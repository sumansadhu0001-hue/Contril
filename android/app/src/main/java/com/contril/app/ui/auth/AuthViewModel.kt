package com.contril.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AuthMode {
    LOGIN,
    REGISTER,
    OTP_VERIFY,
    FORGOT_PASSWORD,
    RESET_PASSWORD
}

data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val fullName: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val otpCode: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val resendCooldownSeconds: Int = 0,
    val isOtpSent: Boolean = false,
    val isPasswordResetMode: Boolean = false
)

class AuthViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository = PreferenceRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private var cooldownJob: Job? = null

    fun setMode(mode: AuthMode) {
        _uiState.value = _uiState.value.copy(
            mode = mode,
            errorMessage = null,
            successMessage = null
        )
    }

    fun setErrorMessage(message: String) {
        _uiState.value = _uiState.value.copy(errorMessage = message, isLoading = false)
    }

    fun setSuccessMessage(message: String) {
        _uiState.value = _uiState.value.copy(successMessage = message, errorMessage = null)
    }

    fun onFullNameChange(name: String) {
        _uiState.value = _uiState.value.copy(fullName = name, errorMessage = null)
    }

    fun onEmailChange(email: String) {
        _uiState.value = _uiState.value.copy(email = email, errorMessage = null)
    }

    fun onPasswordChange(password: String) {
        _uiState.value = _uiState.value.copy(password = password, errorMessage = null)
    }

    fun onConfirmPasswordChange(confirm: String) {
        _uiState.value = _uiState.value.copy(confirmPassword = confirm, errorMessage = null)
    }

    fun onOtpCodeChange(code: String) {
        if (code.length <= 6) {
            _uiState.value = _uiState.value.copy(otpCode = code, errorMessage = null)
        }
    }

    fun login(onSuccess: () -> Unit) {
        val state = _uiState.value
        val email = state.email.trim()
        val password = state.password

        if (email.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Please enter your email address.")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.value = state.copy(errorMessage = "Please enter a valid email address.")
            return
        }
        if (password.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Please enter your password.")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            val response = com.contril.app.data.api.SupabaseAuthClient.signInWithPassword(email, password)
            if (response.success && response.user != null) {
                prefRepository.saveUserSession(response.token ?: "authenticated_token", response.user)
                _uiState.value = _uiState.value.copy(isLoading = false)
                onSuccess()
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = response.error ?: "Invalid email or password."
                )
            }
        }
    }

    fun register(onSuccess: () -> Unit = {}) {
        val state = _uiState.value
        val name = state.fullName.trim()
        val email = state.email.trim()
        val password = state.password
        val confirm = state.confirmPassword

        if (name.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Please enter your full name.")
            return
        }
        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.value = state.copy(errorMessage = "Please enter a valid email address.")
            return
        }
        if (password.length < 6) {
            _uiState.value = state.copy(errorMessage = "Password must be at least 6 characters.")
            return
        }
        if (password != confirm) {
            _uiState.value = state.copy(errorMessage = "Passwords do not match.")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            val response = com.contril.app.data.api.SupabaseAuthClient.signUp(email, name, password)
            if (response.success) {
                if (response.token != null && response.user != null) {
                    prefRepository.saveUserSession(response.token, response.user)
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    onSuccess()
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        mode = AuthMode.LOGIN,
                        successMessage = "Account created. Please check your email to verify and sign in."
                    )
                }
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = response.error ?: "Registration failed."
                )
            }
        }
    }

    fun verifyOtp(onSuccess: () -> Unit) {
        val state = _uiState.value
        val code = state.otpCode.trim()
        val email = state.email.trim()

        if (code.length < 4) {
            _uiState.value = state.copy(errorMessage = "Please enter the complete 6-digit code.")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            val verifyRes = repository.verifyOtp(email, code, if (state.isPasswordResetMode) "recovery" else "signup")
            if (verifyRes.success && verifyRes.user != null) {
                prefRepository.saveUserSession(verifyRes.token ?: "session_${System.currentTimeMillis()}", verifyRes.user)
                _uiState.value = _uiState.value.copy(isLoading = false)
                onSuccess()
            } else if (verifyRes.success) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    mode = if (state.isPasswordResetMode) AuthMode.RESET_PASSWORD else AuthMode.LOGIN,
                    successMessage = "Code verified successfully."
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = verifyRes.error ?: "Invalid code. Please try again."
                )
            }
        }
    }

    fun resendOtp() {
        val state = _uiState.value
        if (state.resendCooldownSeconds > 0) return

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            repository.resendOtp(state.email.trim(), state.isPasswordResetMode)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                successMessage = "New verification code sent."
            )
            startResendCooldown(60)
        }
    }

    fun requestPasswordReset() {
        val state = _uiState.value
        val email = state.email.trim()

        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.value = state.copy(errorMessage = "Please enter a valid email address.")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            val response = com.contril.app.data.api.SupabaseAuthClient.sendPasswordRecovery(email)
            if (response.success) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    mode = AuthMode.LOGIN,
                    successMessage = "Password recovery instructions sent to $email"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = response.error ?: "Unable to send recovery instructions."
                )
            }
        }
    }

    fun resetPassword(onSuccess: () -> Unit) {
        val state = _uiState.value
        val email = state.email.trim()
        val code = state.otpCode.trim()
        val password = state.password
        val confirm = state.confirmPassword

        if (password.length < 6) {
            _uiState.value = state.copy(errorMessage = "Password must be at least 6 characters.")
            return
        }
        if (password != confirm) {
            _uiState.value = state.copy(errorMessage = "Passwords do not match.")
            return
        }

        _uiState.value = state.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            val res = repository.resetPassword(email, code, password)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                mode = AuthMode.LOGIN,
                successMessage = "Password updated successfully. Please sign in."
            )
        }
    }

    fun handleGoogleOAuthToken(token: String, onSuccess: () -> Unit) {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        viewModelScope.launch {
            val user = com.contril.app.data.api.SupabaseAuthClient.getUserProfile(token)
            if (user != null) {
                prefRepository.saveUserSession(token, user)
                _uiState.value = _uiState.value.copy(isLoading = false)
                onSuccess()
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to retrieve authenticated user profile from token."
                )
            }
        }
    }

    fun handleGoogleSignIn(email: String, name: String, token: String?, onSuccess: () -> Unit) {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        viewModelScope.launch {
            val res = repository.oauthSignIn("google", email, name, token)
            val user = res.user ?: UserProfile(
                id = "usr_g_${email.hashCode()}",
                email = email,
                name = name
            )
            prefRepository.saveUserSession(res.token ?: "google_session_${System.currentTimeMillis()}", user)
            _uiState.value = _uiState.value.copy(isLoading = false)
            onSuccess()
        }
    }

    private fun startResendCooldown(seconds: Int) {
        cooldownJob?.cancel()
        cooldownJob = viewModelScope.launch {
            for (i in seconds downTo 0) {
                _uiState.value = _uiState.value.copy(resendCooldownSeconds = i)
                delay(1000)
            }
        }
    }
}

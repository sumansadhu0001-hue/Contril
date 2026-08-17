package com.contril.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.api.SupabaseAuthClient
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
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
    val loadingMessage: String = "",
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
        _uiState.update {
            it.copy(
                mode = mode,
                errorMessage = null,
                successMessage = null,
                isLoading = false,
                otpCode = if (mode != AuthMode.OTP_VERIFY) "" else it.otpCode
            )
        }
    }

    fun setErrorMessage(message: String?) {
        _uiState.update { it.copy(errorMessage = message, isLoading = false) }
    }

    fun setSuccessMessage(message: String?) {
        _uiState.update { it.copy(successMessage = message, errorMessage = null) }
    }

    fun onFullNameChange(name: String) {
        _uiState.update { it.copy(fullName = name, errorMessage = null) }
    }

    fun onEmailChange(email: String) {
        _uiState.update { it.copy(email = email, errorMessage = null) }
    }

    fun onPasswordChange(password: String) {
        _uiState.update { it.copy(password = password, errorMessage = null) }
    }

    fun onConfirmPasswordChange(confirm: String) {
        _uiState.update { it.copy(confirmPassword = confirm, errorMessage = null) }
    }

    fun onOtpCodeChange(code: String) {
        val sanitized = code.filter { it.isDigit() }.take(6)
        _uiState.update { it.copy(otpCode = sanitized, errorMessage = null) }
    }

    fun login(onSuccess: () -> Unit) {
        val state = _uiState.value
        val email = state.email.trim()
        val password = state.password

        if (email.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Please enter your email address.") }
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.update { it.copy(errorMessage = "Please enter a valid email address.") }
            return
        }
        if (password.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Please enter your password.") }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Signing you in...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val response = SupabaseAuthClient.signInWithPassword(email, password)
            if (response.success && response.user != null) {
                prefRepository.saveUserSession(response.token ?: "token_${System.currentTimeMillis()}", response.user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = response.error ?: "Incorrect email or password."
                    )
                }
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
            _uiState.update { it.copy(errorMessage = "Please enter your full name.") }
            return
        }
        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.update { it.copy(errorMessage = "Please enter a valid email address.") }
            return
        }
        if (password.length < 8) {
            _uiState.update { it.copy(errorMessage = "Password must be at least 8 characters.") }
            return
        }
        if (!password.any { it.isUpperCase() } || !password.any { it.isLowerCase() } || !password.any { it.isDigit() }) {
            _uiState.update { it.copy(errorMessage = "Password must contain uppercase, lowercase, and a number.") }
            return
        }
        if (password != confirm) {
            _uiState.update { it.copy(errorMessage = "Passwords do not match.") }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Creating your account...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val response = SupabaseAuthClient.signUp(email, name, password)
            if (response.success) {
                // If user is already active and token provided, log in immediately
                if (response.token != null && response.user != null) {
                    prefRepository.saveUserSession(response.token, response.user)
                    _uiState.update { it.copy(isLoading = false) }
                    onSuccess()
                } else {
                    // Send OTP email and switch to OTP verify step
                    SupabaseAuthClient.sendEmailOtp(email)
                    repository.sendOtp(email, isRecovery = false)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            mode = AuthMode.OTP_VERIFY,
                            isOtpSent = true,
                            isPasswordResetMode = false,
                            successMessage = "Verification code dispatched to $email"
                        )
                    }
                    startResendCooldown(60)
                }
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = response.error ?: "Registration failed. Please try again."
                    )
                }
            }
        }
    }

    fun verifyOtp(onSuccess: () -> Unit) {
        val state = _uiState.value
        val code = state.otpCode.trim()
        val email = state.email.trim()

        if (code.length != 6) {
            _uiState.update { it.copy(errorMessage = "Please enter the complete 6-digit code.") }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Verifying code...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            // 1. Try Supabase verification
            val verifyType = if (state.isPasswordResetMode) "recovery" else "signup"
            val sbResult = SupabaseAuthClient.verifyEmailOtp(email, code, verifyType)

            if (sbResult.success && sbResult.user != null) {
                prefRepository.saveUserSession(sbResult.token ?: "session_${System.currentTimeMillis()}", sbResult.user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
                return@launch
            }

            // 2. Fallback to custom OTP verification
            val customResult = repository.verifyOtp(email, code, verifyType)
            if (customResult.success && customResult.user != null) {
                prefRepository.saveUserSession(customResult.token ?: "session_${System.currentTimeMillis()}", customResult.user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
            } else if (customResult.success) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = if (state.isPasswordResetMode) AuthMode.RESET_PASSWORD else AuthMode.LOGIN,
                        successMessage = "Email verified successfully. Please sign in."
                    )
                }
            } else {
                val err = sbResult.error ?: customResult.error ?: "That code isn't correct. Check your email and try again."
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = err
                    )
                }
            }
        }
    }

    fun resendOtp() {
        val state = _uiState.value
        if (state.resendCooldownSeconds > 0) return

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Sending verification code...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            SupabaseAuthClient.sendEmailOtp(state.email.trim())
            repository.sendOtp(state.email.trim(), state.isPasswordResetMode)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    successMessage = "New verification code sent."
                )
            }
            startResendCooldown(60)
        }
    }

    fun requestPasswordReset() {
        val state = _uiState.value
        val email = state.email.trim()

        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.update { it.copy(errorMessage = "Please enter a valid email address.") }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Sending recovery instructions...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val response = SupabaseAuthClient.sendPasswordRecovery(email)
            repository.forgotPassword(email)
            if (response.success) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = AuthMode.LOGIN,
                        successMessage = "Password recovery instructions sent to $email"
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = response.error ?: "Unable to send recovery instructions."
                    )
                }
            }
        }
    }

    fun resetPassword(onSuccess: () -> Unit) {
        val state = _uiState.value
        val email = state.email.trim()
        val code = state.otpCode.trim()
        val password = state.password
        val confirm = state.confirmPassword

        if (password.length < 8) {
            _uiState.update { it.copy(errorMessage = "Password must be at least 8 characters.") }
            return
        }
        if (password != confirm) {
            _uiState.update { it.copy(errorMessage = "Passwords do not match.") }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Updating password...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val res = repository.resetPassword(email, code, password)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    mode = AuthMode.LOGIN,
                    successMessage = "Password updated successfully. Please sign in."
                )
            }
        }
    }

    fun handleGoogleOAuthToken(token: String, onSuccess: () -> Unit) {
        _uiState.update {
            it.copy(
                isLoading = true,
                loadingMessage = "Connecting to Google...",
                errorMessage = null
            )
        }
        viewModelScope.launch {
            val user = SupabaseAuthClient.getUserProfile(token)
            if (user != null) {
                prefRepository.saveUserSession(token, user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = "Google sign-in couldn't be completed. Please try again."
                    )
                }
            }
        }
    }

    private fun startResendCooldown(seconds: Int) {
        cooldownJob?.cancel()
        cooldownJob = viewModelScope.launch {
            for (i in seconds downTo 0) {
                _uiState.update { it.copy(resendCooldownSeconds = i) }
                delay(1000)
            }
        }
    }
}

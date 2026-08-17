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
    RESET_PASSWORD,
    ONBOARDING_ROLE,
    ONBOARDING_DETAILS,
    ONBOARDING_PLAN
}

data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val fullName: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val otpDigits: List<String> = listOf("", "", "", "", "", ""),
    val isLoading: Boolean = false,
    val loadingMessage: String = "",
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val resendCooldownSeconds: Int = 0,
    val isOtpSent: Boolean = false,
    val isPasswordResetMode: Boolean = false,
    val selectedRole: String = "",
    val organizationName: String = "",
    val selectedPlan: String = "Free",
    val authenticatedUser: UserProfile? = null,
    val authenticatedToken: String? = null
) {
    val otpCode: String
        get() = otpDigits.joinToString("")
}

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
                isLoading = false
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

    fun onOtpDigitChange(index: Int, value: String) {
        val sanitized = value.filter { it.isDigit() }
        _uiState.update { state ->
            val currentDigits = state.otpDigits.toMutableList()
            if (sanitized.length > 1) {
                // Pasted full code
                for (i in 0 until 6) {
                    if (i < sanitized.length) {
                        currentDigits[i] = sanitized[i].toString()
                    }
                }
            } else {
                currentDigits[index] = sanitized
            }
            state.copy(otpDigits = currentDigits, errorMessage = null)
        }
    }

    fun onRoleSelected(role: String) {
        _uiState.update { it.copy(selectedRole = role, errorMessage = null) }
    }

    fun onOrganizationNameChange(org: String) {
        _uiState.update { it.copy(organizationName = org, errorMessage = null) }
    }

    fun onPlanSelected(plan: String) {
        _uiState.update { it.copy(selectedPlan = plan, errorMessage = null) }
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
            // 1. Try Supabase Auth Login
            val response = SupabaseAuthClient.signInWithPassword(email, password)
            if (response.success && response.user != null) {
                prefRepository.saveUserSession(response.token ?: "token_${System.currentTimeMillis()}", response.user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
                return@launch
            }

            // 2. Fallback to backend /api/v1/auth/login
            val apiRes = repository.login(email, password)
            if (apiRes.token != null && apiRes.user != null) {
                prefRepository.saveUserSession(apiRes.token, apiRes.user)
                _uiState.update { it.copy(isLoading = false) }
                onSuccess()
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = response.error ?: apiRes.error ?: "Incorrect email or password."
                    )
                }
            }
        }
    }

    fun register() {
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
            // Dispatches real OTP through Resend via backend
            val res = repository.signUpWithOtp(email, name, password)
            if (res.error == null || res.message != null) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = AuthMode.OTP_VERIFY,
                        otpDigits = listOf("", "", "", "", "", ""),
                        isOtpSent = true,
                        isPasswordResetMode = false,
                        successMessage = "Verification code sent to $email"
                    )
                }
                startResendCooldown(60)
            } else {
                // Fallback to custom-otp/send
                repository.sendOtp(email, isRecovery = false)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = AuthMode.OTP_VERIFY,
                        otpDigits = listOf("", "", "", "", "", ""),
                        isOtpSent = true,
                        isPasswordResetMode = false,
                        successMessage = "Verification code sent to $email"
                    )
                }
                startResendCooldown(60)
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
                loadingMessage = "Verifying...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val verifyType = if (state.isPasswordResetMode) "recovery" else "signup"
            val customResult = repository.verifyOtp(email, code, verifyType)

            if (customResult.success && customResult.user != null) {
                val user = customResult.user
                val token = customResult.token ?: "session_${System.currentTimeMillis()}"
                prefRepository.saveUserSession(token, user)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        authenticatedUser = user,
                        authenticatedToken = token,
                        mode = AuthMode.ONBOARDING_ROLE
                    )
                }
            } else if (customResult.success && state.isPasswordResetMode) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = AuthMode.RESET_PASSWORD,
                        successMessage = "Code verified. Please set your new password."
                    )
                }
            } else {
                val err = customResult.error ?: "That code isn't correct. Try again."
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
            repository.resendOtp(state.email.trim(), state.isPasswordResetMode)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    otpDigits = listOf("", "", "", "", "", ""),
                    successMessage = "New code sent."
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
                loadingMessage = "Sending password reset code...",
                errorMessage = null
            )
        }

        viewModelScope.launch {
            val response = repository.forgotPassword(email)
            if (response.error == null) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        mode = AuthMode.OTP_VERIFY,
                        otpDigits = listOf("", "", "", "", "", ""),
                        isOtpSent = true,
                        isPasswordResetMode = true,
                        successMessage = "Password reset code sent to $email"
                    )
                }
                startResendCooldown(60)
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = response.error ?: "Unable to send reset code."
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

    fun completeOnboarding(onSuccess: () -> Unit) {
        val state = _uiState.value
        val user = state.authenticatedUser ?: prefRepository.getUserProfile() ?: UserProfile(
            id = "usr_${System.currentTimeMillis()}",
            email = state.email.ifBlank { "user@contril.app" },
            name = state.fullName.ifBlank { "User" }
        )

        val updatedUser = user.copy(
            name = if (state.fullName.isNotBlank()) state.fullName else user.name
        )

        prefRepository.saveUserSession(
            token = state.authenticatedToken ?: "session_${System.currentTimeMillis()}",
            user = updatedUser
        )

        _uiState.update { it.copy(isLoading = false) }
        onSuccess()
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

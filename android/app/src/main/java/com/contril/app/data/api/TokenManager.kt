package com.contril.app.data.api

import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.StateFlow

class TokenManager(
    private val prefRepository: PreferenceRepository
) {
    val sessionToken: StateFlow<String?> = prefRepository.userSessionToken

    fun getValidToken(): String? {
        return prefRepository.userSessionToken.value
    }

    fun isSessionActive(): Boolean {
        return !prefRepository.userSessionToken.value.isNullOrBlank()
    }

    fun clearSession() {
        prefRepository.clearSession()
    }
}

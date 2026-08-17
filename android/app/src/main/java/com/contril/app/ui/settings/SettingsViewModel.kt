package com.contril.app.ui.settings

import androidx.lifecycle.ViewModel
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.StateFlow

class SettingsViewModel(
    private val prefRepository: PreferenceRepository
) : ViewModel() {

    val autonomyMode: StateFlow<AutonomyMode> = prefRepository.autonomyMode
    val isDarkTheme: StateFlow<Boolean> = prefRepository.isDarkTheme
    val currentUser: StateFlow<UserProfile?> = prefRepository.currentUser
    val connectedServices: StateFlow<Map<String, String>> = prefRepository.connectedServices

    fun setAutonomyMode(mode: AutonomyMode) {
        prefRepository.setAutonomyMode(mode)
    }

    fun setDarkTheme(isDark: Boolean) {
        prefRepository.setDarkTheme(isDark)
    }

    fun logout() {
        prefRepository.clearSession()
    }
}


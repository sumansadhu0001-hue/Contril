package com.contril.app.ui.settings

import android.content.Context
import androidx.lifecycle.ViewModel
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.data.model.OvernightServiceState
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.service.OvernightAutonomyService
import kotlinx.coroutines.flow.StateFlow

class SettingsViewModel(
    private val prefRepository: PreferenceRepository
) : ViewModel() {

    val autonomyMode: StateFlow<AutonomyMode> = prefRepository.autonomyMode
    val isDarkTheme: StateFlow<Boolean> = prefRepository.isDarkTheme
    val isAutoSendEnabled: StateFlow<Boolean> = prefRepository.isAutoSendEnabled
    val isOvernightAutonomyEnabled: StateFlow<Boolean> = prefRepository.isOvernightAutonomyEnabled
    val overnightServiceState: StateFlow<OvernightServiceState> = prefRepository.overnightServiceState
    val activityLogs: StateFlow<List<OvernightActivityLog>> = prefRepository.activityLogs
    val currentUser: StateFlow<UserProfile?> = prefRepository.currentUser
    val connectedServices: StateFlow<Map<String, String>> = prefRepository.connectedServices

    fun setAutonomyMode(mode: AutonomyMode) {
        prefRepository.setAutonomyMode(mode)
    }

    fun setAutoSendEnabled(enabled: Boolean) {
        prefRepository.setAutoSendEnabled(enabled)
    }

    fun setOvernightAutonomyEnabled(context: Context, enabled: Boolean) {
        prefRepository.setOvernightAutonomyEnabled(enabled)
        if (enabled) {
            OvernightAutonomyService.startService(context)
        } else {
            OvernightAutonomyService.stopService(context)
        }
    }

    fun purgeOldLogs() {
        prefRepository.purgeOldActivityLogs(days = 30)
    }

    fun setDarkTheme(isDark: Boolean) {
        prefRepository.setDarkTheme(isDark)
    }

    fun logout() {
        prefRepository.clearSession()
    }
}


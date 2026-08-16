package com.contril.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.contril.app.data.model.AutonomyMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PreferenceRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("contril_native_prefs", Context.MODE_PRIVATE)

    private val _autonomyMode = MutableStateFlow(getSavedAutonomyMode())
    val autonomyMode: StateFlow<AutonomyMode> = _autonomyMode.asStateFlow()

    private val _isDarkTheme = MutableStateFlow(prefs.getBoolean("is_dark_theme", true))
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    private val _userSessionToken = MutableStateFlow(prefs.getString("auth_token", null))
    val userSessionToken: StateFlow<String?> = _userSessionToken.asStateFlow()

    private fun getSavedAutonomyMode(): AutonomyMode {
        val saved = prefs.getString("autonomy_mode", AutonomyMode.SENSITIVE_ONLY.name)
        return try {
            AutonomyMode.valueOf(saved ?: AutonomyMode.SENSITIVE_ONLY.name)
        } catch (e: Exception) {
            AutonomyMode.SENSITIVE_ONLY
        }
    }

    fun setAutonomyMode(mode: AutonomyMode) {
        prefs.edit().putString("autonomy_mode", mode.name).apply()
        _autonomyMode.value = mode
    }

    fun setDarkTheme(isDark: Boolean) {
        prefs.edit().putBoolean("is_dark_theme", isDark).apply()
        _isDarkTheme.value = isDark
    }

    fun saveAuthToken(token: String?) {
        prefs.edit().putString("auth_token", token).apply()
        _userSessionToken.value = token
    }
}

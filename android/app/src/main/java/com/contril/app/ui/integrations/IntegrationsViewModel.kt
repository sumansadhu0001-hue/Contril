package com.contril.app.ui.integrations

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.api.GoogleOAuthManager
import com.contril.app.data.model.IntegrationCategory
import com.contril.app.data.model.IntegrationStatus
import com.contril.app.data.model.MeetingItem
import com.contril.app.data.model.PriorityItem
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class IntegrationsUiState(
    val integrations: List<IntegrationStatus> = emptyList(),
    val currentUser: UserProfile? = null,
    val connectedMap: Map<String, String> = emptyMap(),
    val isConnecting: Boolean = false,
    val connectingServiceId: String? = null,
    val unreadEmailCount: Int = 0,
    val nextMeetingSummary: String? = null,
    val needsGoogleReconnect: Boolean = false,
    val errorMessage: String? = null
) {
    val connectedCount: Int
        get() = connectedMap.size
}

class IntegrationsViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null
) : ViewModel() {

    private val TAG = "IntegrationsVM"
    private val _uiState = MutableStateFlow(IntegrationsUiState())
    val uiState: StateFlow<IntegrationsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefRepository?.currentUser?.collect { user ->
                _uiState.update { it.copy(currentUser = user) }
                buildIntegrationsList()
            }
        }

        viewModelScope.launch {
            prefRepository?.connectedServices?.collect { map ->
                _uiState.update { it.copy(connectedMap = map) }
                buildIntegrationsList()
            }
        }

        // Live Real Repository Observation
        viewModelScope.launch {
            repository.priorities.collect { priorities ->
                val unreadCount = priorities.count { it.serviceTag.contains("gmail", ignoreCase = true) || it.isUrgent }
                _uiState.update { it.copy(unreadEmailCount = unreadCount) }
                buildIntegrationsList()
            }
        }

        viewModelScope.launch {
            repository.meetings.collect { meetings ->
                val nextMeeting = meetings.firstOrNull()
                val summary = if (nextMeeting != null) {
                    "Next: ${nextMeeting.title} at ${nextMeeting.timeRange}"
                } else {
                    "No upcoming events today"
                }
                _uiState.update { it.copy(nextMeetingSummary = summary) }
                buildIntegrationsList()
            }
        }

        // Perform background silent refresh check on startup
        checkAndRefreshGoogleTokens()
    }

    fun checkAndRefreshGoogleTokens() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                if (prefRepository == null) return@launch
                val token = prefRepository.getGoogleProviderToken()
                val refreshToken = prefRepository.getGoogleRefreshToken()

                if (!token.isNullOrBlank()) {
                    val isExpired = prefRepository.isGoogleTokenExpired()
                    if (isExpired) {
                        Log.i(TAG, "Google access token is expired, attempting silent background renewal...")
                        val freshToken = com.contril.app.data.api.ContrilBackendClient.getFreshGoogleToken(prefRepository)
                        if (freshToken.isNullOrBlank() && refreshToken.isNullOrBlank()) {
                            Log.w(TAG, "Silent token refresh failed; refresh token revoked.")
                            _uiState.update { it.copy(needsGoogleReconnect = true) }
                            buildIntegrationsList()
                        } else {
                            _uiState.update { it.copy(needsGoogleReconnect = false) }
                            buildIntegrationsList()
                        }
                    } else {
                        _uiState.update { it.copy(needsGoogleReconnect = false) }
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "checkAndRefreshGoogleTokens error: ${e.message}")
            }
        }
    }

    private fun buildIntegrationsList() {
        val map = _uiState.value.connectedMap
        val user = _uiState.value.currentUser
        val userEmail = user?.email?.ifBlank { null }
        val unreadEmails = _uiState.value.unreadEmailCount
        val nextMeeting = _uiState.value.nextMeetingSummary ?: "No upcoming events today"
        val needsReconnect = _uiState.value.needsGoogleReconnect

        val isGmailConnected = map.containsKey("gmail") || map.containsKey("google_workspace")
        val isCalendarConnected = map.containsKey("calendar") || map.containsKey("google_workspace")
        val isDriveConnected = map.containsKey("drive") || map.containsKey("google_workspace")

        val gmailAccount = map["gmail"] ?: map["google_workspace"] ?: (if (isGmailConnected) userEmail else null)
        val calAccount = map["calendar"] ?: map["google_workspace"] ?: (if (isCalendarConnected) userEmail else null)
        val driveAccount = map["drive"] ?: map["google_workspace"] ?: (if (isDriveConnected) userEmail else null)

        val list = listOf(
            IntegrationStatus(
                id = "gmail",
                name = "Gmail",
                description = "Priority email triage, executive daily briefing synthesis, and draft preparation.",
                isConnected = isGmailConnected && !needsReconnect,
                connectedAccount = gmailAccount,
                lastSyncTime = if (needsReconnect) "Authorization expired • Reconnect required"
                               else if (isGmailConnected) "$unreadEmails priority emails • Real-time inbox intelligence active"
                               else "Not connected",
                iconKey = "mail",
                category = IntegrationCategory.WORK,
                scopes = listOf("Read email messages", "Compose & prepare draft replies", "Extract priority action items")
            ),
            IntegrationStatus(
                id = "calendar",
                name = "Google Calendar",
                description = "Detects upcoming meetings, warns of scheduling conflicts, and tracks daily agenda milestones.",
                isConnected = isCalendarConnected && !needsReconnect,
                connectedAccount = calAccount,
                lastSyncTime = if (needsReconnect) "Authorization expired • Reconnect required"
                               else if (isCalendarConnected) "$nextMeeting • Schedule sync active"
                               else "Not connected",
                iconKey = "calendar",
                category = IntegrationCategory.PRODUCTIVITY,
                scopes = listOf("View calendar events", "Detect meeting conflicts", "Coordinate schedules")
            ),
            IntegrationStatus(
                id = "drive",
                name = "Google Drive",
                description = "Context extraction from indexed documents, meeting briefs, and proposals.",
                isConnected = isDriveConnected && !needsReconnect,
                connectedAccount = driveAccount,
                lastSyncTime = if (isDriveConnected) "Indexed workspace search active" else "Not connected",
                iconKey = "drive",
                category = IntegrationCategory.WORK,
                scopes = listOf("Read indexed workspace documents", "Search drive files")
            ),
            IntegrationStatus(
                id = "web",
                name = "Live Web Intelligence",
                description = "Real-time fact checking, market research, price tracking, and multi-source verification.",
                isConnected = true,
                isAlwaysAvailable = true,
                connectedAccount = "Global Engine Active",
                lastSyncTime = "Multi-engine autonomous search active",
                iconKey = "web",
                category = IntegrationCategory.PRODUCTIVITY,
                scopes = listOf("Autonomous web search", "Real-time verification")
            ),
            IntegrationStatus(
                id = "github",
                name = "GitHub",
                description = "Track repository pull requests, issues, and release activity.",
                isConnected = map.containsKey("github"),
                connectedAccount = map["github"],
                lastSyncTime = if (map.containsKey("github")) "Real-time repository sync active" else "Not connected",
                iconKey = "github",
                category = IntegrationCategory.WORK,
                scopes = listOf("Read user repositories", "Track pull requests")
            )
        )
        _uiState.update { it.copy(integrations = list) }
    }

    fun launchGoogleOAuth(context: Context) {
        try {
            val googleOAuthManager = GoogleOAuthManager(context.applicationContext)
            val intent = googleOAuthManager.createAuthorizationIntent(forceConsent = true)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch Google PKCE OAuth flow: ${e.message}", e)
            setErrorMessage("Unable to launch Google Sign-In: ${e.message}")
        }
    }

    fun disconnectService(serviceId: String) {
        viewModelScope.launch(Dispatchers.IO) {
            prefRepository?.let { pref ->
                pref.disconnectService(serviceId)
                if (serviceId == "gmail" || serviceId == "calendar" || serviceId == "drive") {
                    // Check if all Google services are disconnected
                    val connected = pref.connectedServices.value
                    val hasAnyGoogle = connected.containsKey("gmail") || connected.containsKey("calendar") || connected.containsKey("drive")
                    if (!hasAnyGoogle) {
                        pref.disconnectService("google_workspace")
                        pref.saveGoogleProviderTokens(providerToken = "", refreshToken = null)
                    }
                }
            }
            buildIntegrationsList()
        }
    }

    fun setErrorMessage(msg: String?) {
        _uiState.update { it.copy(errorMessage = msg) }
    }
}

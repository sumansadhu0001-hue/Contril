package com.contril.app.ui.integrations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.IntegrationStatus
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class IntegrationsUiState(
    val integrations: List<IntegrationStatus> = emptyList(),
    val currentUser: UserProfile? = null,
    val connectedMap: Map<String, String> = emptyMap(),
    val isConnecting: Boolean = false,
    val connectingServiceId: String? = null,
    val errorMessage: String? = null
) {
    val connectedCount: Int
        get() = connectedMap.size
}

class IntegrationsViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null
) : ViewModel() {

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
    }

    private fun buildIntegrationsList() {
        val map = _uiState.value.connectedMap
        val user = _uiState.value.currentUser
        val userEmail = user?.email?.ifBlank { null }

        val list = listOf(
            IntegrationStatus(
                id = "gmail",
                name = "Gmail",
                description = "Email intelligence, unread summaries, and draft preparation",
                isConnected = map.containsKey("gmail"),
                connectedAccount = map["gmail"] ?: (if (map.containsKey("gmail")) userEmail else null),
                lastSyncTime = if (map.containsKey("gmail")) "Real-time sync active" else "Not connected",
                iconKey = "mail",
                scopes = listOf("Read email messages", "Compose & prepare drafts")
            ),
            IntegrationStatus(
                id = "calendar",
                name = "Google Calendar",
                description = "Schedule conflict resolution and meeting briefings",
                isConnected = map.containsKey("calendar"),
                connectedAccount = map["calendar"] ?: (if (map.containsKey("calendar")) userEmail else null),
                lastSyncTime = if (map.containsKey("calendar")) "Real-time sync active" else "Not connected",
                iconKey = "calendar",
                scopes = listOf("View calendar events", "Check meeting conflicts", "Coordinate schedules")
            ),
            IntegrationStatus(
                id = "drive",
                name = "Google Drive",
                description = "Context extraction from indexed documents and proposals",
                isConnected = map.containsKey("drive"),
                connectedAccount = map["drive"] ?: (if (map.containsKey("drive")) userEmail else null),
                lastSyncTime = if (map.containsKey("drive")) "Real-time sync active" else "Not connected",
                iconKey = "drive",
                scopes = listOf("Read indexed documents", "Search workspace files")
            ),
            IntegrationStatus(
                id = "outlook",
                name = "Outlook / Microsoft 365",
                description = "Enterprise email and meeting coordination",
                isConnected = map.containsKey("outlook"),
                connectedAccount = map["outlook"],
                lastSyncTime = if (map.containsKey("outlook")) "Real-time sync active" else "Not connected",
                iconKey = "outlook",
                scopes = listOf("Read Outlook messages", "Sync Microsoft 365 calendar")
            ),
            IntegrationStatus(
                id = "github",
                name = "GitHub",
                description = "Repository activity, pull request updates, and issues",
                isConnected = map.containsKey("github"),
                connectedAccount = map["github"],
                lastSyncTime = if (map.containsKey("github")) "Real-time sync active" else "Not connected",
                iconKey = "github",
                scopes = listOf("Read user repositories", "Track pull requests & notifications")
            ),
            IntegrationStatus(
                id = "web",
                name = "Live Web Intelligence",
                description = "Real-time fact checking, market research, and verification",
                isConnected = true,
                isAlwaysAvailable = true,
                connectedAccount = "Global Engine Active",
                lastSyncTime = "Global Index Connected",
                iconKey = "web",
                scopes = listOf("Autonomous search", "Real-time verification")
            )
        )

        _uiState.update { it.copy(integrations = list) }
    }

    fun handleOAuthSuccessForService(serviceId: String, emailOrUser: String) {
        if (serviceId == "google_workspace" || serviceId == "workspace") {
            prefRepository?.connectService("gmail", emailOrUser)
            prefRepository?.connectService("calendar", emailOrUser)
            prefRepository?.connectService("drive", emailOrUser)
        } else {
            prefRepository?.connectService(serviceId, emailOrUser)
        }
        _uiState.update { it.copy(isConnecting = false, connectingServiceId = null, errorMessage = null) }
        buildIntegrationsList()
    }

    fun disconnectService(serviceId: String) {
        prefRepository?.disconnectService(serviceId)
        buildIntegrationsList()
    }

    fun setConnecting(serviceId: String?) {
        _uiState.update { it.copy(isConnecting = serviceId != null, connectingServiceId = serviceId) }
    }

    fun setErrorMessage(msg: String?) {
        _uiState.update { it.copy(errorMessage = msg, isConnecting = false, connectingServiceId = null) }
    }
}

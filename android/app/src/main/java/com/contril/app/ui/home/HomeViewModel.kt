package com.contril.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.local.ContrilDefaults
import com.contril.app.data.model.*
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val commandText: String = "",
    val isLoading: Boolean = false,
    val suggestedPrompts: List<String> = ContrilDefaults.getSuggestedPrompts(),
    val priorities: List<PriorityItem> = emptyList(),
    val pendingActions: List<PendingAction> = emptyList(),
    val latestResponse: CommandResponse? = null,
    val currentUser: UserProfile? = null,
    val connectedServicesCount: Int = 0
)

class HomeViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefRepository?.currentUser?.collect { user ->
                _uiState.update { it.copy(currentUser = user) }
            }
        }
        viewModelScope.launch {
            prefRepository?.connectedServices?.collect { map ->
                _uiState.update { it.copy(connectedServicesCount = map.size) }
            }
        }
        viewModelScope.launch {
            repository.priorities.collect { items ->
                _uiState.update { it.copy(priorities = items) }
            }
        }
        viewModelScope.launch {
            repository.pendingActions.collect { actions ->
                _uiState.update { it.copy(pendingActions = actions) }
            }
        }
    }

    fun onCommandTextChanged(text: String) {
        _uiState.update { it.copy(commandText = text) }
    }

    fun executeCommand(promptOverride: String? = null) {
        val prompt = promptOverride ?: _uiState.value.commandText
        if (prompt.isBlank()) return

        _uiState.update { it.copy(isLoading = true, commandText = "") }

        viewModelScope.launch {
            val autonomy = prefRepository?.autonomyMode?.value ?: AutonomyMode.SENSITIVE_ONLY
            val connected = prefRepository?.connectedServices?.value ?: emptyMap()
            val response = repository.executeCommand(prompt, autonomy, connected)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    latestResponse = response
                )
            }
        }
    }

    fun dismissResponse() {
        _uiState.update { it.copy(latestResponse = null) }
    }

    fun approveAction(actionId: String) {
        viewModelScope.launch {
            repository.approveAction(actionId)
        }
    }

    fun rejectAction(actionId: String) {
        viewModelScope.launch {
            repository.rejectAction(actionId)
        }
    }
}

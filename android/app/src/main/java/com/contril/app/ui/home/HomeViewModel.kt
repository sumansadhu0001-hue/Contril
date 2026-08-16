package com.contril.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.local.DemoDataProvider
import com.contril.app.data.model.*
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val commandText: String = "",
    val isLoading: Boolean = false,
    val suggestedPrompts: List<String> = DemoDataProvider.getSuggestedPrompts(),
    val priorities: List<PriorityItem> = emptyList(),
    val pendingActions: List<PendingAction> = emptyList(),
    val latestResponse: CommandResponse? = null
)

class HomeViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
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
            val response = repository.executeCommand(prompt, autonomy)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    latestResponse = response
                )
            }
        }
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

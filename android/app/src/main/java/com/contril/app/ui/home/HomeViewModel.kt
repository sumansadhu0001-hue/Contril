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
    val suggestedPrompts: List<String> = emptyList(),
    val priorities: List<PriorityItem> = emptyList(),
    val pendingActions: List<PendingAction> = emptyList(),
    val latestResponse: CommandResponse? = null,
    val currentUser: UserProfile? = null,
    val userRole: String = "Executive",
    val connectedServicesCount: Int = 0,
    val aiUsage: Pair<Int, Int> = Pair(0, 5)
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
            prefRepository?.userRole?.collect { role ->
                _uiState.update { it.copy(userRole = role) }
            }
        }
        viewModelScope.launch {
            prefRepository?.connectedServices?.collect { map ->
                val prompts = mutableListOf<String>()
                if (map.containsKey("gmail")) {
                    prompts.add("Summarize my unread emails")
                }
                if (map.containsKey("calendar")) {
                    prompts.add("What's on my schedule today?")
                }
                prompts.add("Create a follow-up task for tomorrow")
                prompts.add("Prepare briefing for today")

                _uiState.update {
                    it.copy(
                        connectedServicesCount = map.size,
                        suggestedPrompts = prompts,
                        aiUsage = prefRepository.getTodayAiUsage()
                    )
                }
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

        // Daily AI Usage Enforcement
        val canExecute = prefRepository?.incrementAiUsage() ?: true
        if (!canExecute) {
            _uiState.update {
                it.copy(
                    isLoading = false,
                    latestResponse = CommandResponse(
                        conversationId = "limit_notice",
                        responseText = "You've reached today's Free plan limit of 5 AI conversations. Upgrade to Contril Pro in Settings for unlimited usage."
                    ),
                    aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(5, 5)
                )
            }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                commandText = "",
                aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(1, 5)
            )
        }

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

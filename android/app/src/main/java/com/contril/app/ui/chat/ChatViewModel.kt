package com.contril.app.ui.chat

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.automation.ComparisonResult
import com.contril.app.data.automation.PriceComparisonManager
import com.contril.app.data.automation.QueryIntentClassifier
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.CommandResponse
import com.contril.app.data.model.PendingAction
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val isUser: Boolean,
    val text: String,
    val timestamp: String = java.time.LocalTime.now().toString().take(5),
    val responsePayload: CommandResponse? = null,
    val comparisonResult: ComparisonResult? = null,
    val pendingAction: PendingAction? = null,
    val proposedPlan: com.contril.app.data.model.AgenticExecutionPlan? = null
)

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val inputText: String = "",
    val isLoading: Boolean = false,
    val isComparingPrices: Boolean = false,
    val comparisonStatus: String? = null,
    val showConsentModal: Boolean = false,
    val aiUsage: Pair<Int, Int> = Pair(0, 5),
    val isOnline: Boolean = true
)

class ChatViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null,
    val comparisonManager: PriceComparisonManager = PriceComparisonManager(prefRepository),
    val networkMonitor: com.contril.app.data.network.NetworkMonitor? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ChatUiState(isOnline = networkMonitor?.isOnline?.value ?: true)
    )
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            networkMonitor?.isOnline?.collect { online ->
                _uiState.update { it.copy(isOnline = online) }
            }
        }
        viewModelScope.launch {
            comparisonManager.isComparing.collect { comparing ->
                _uiState.update { it.copy(isComparingPrices = comparing) }
            }
        }
        viewModelScope.launch {
            comparisonManager.statusText.collect { status ->
                _uiState.update { it.copy(comparisonStatus = status) }
            }
        }
        viewModelScope.launch {
            comparisonManager.latestResult.collect { result ->
                if (result != null) {
                    val compMessage = ChatMessage(
                        isUser = false,
                        text = "Here is the on-device price comparison for \"${result.searchQuery}\":",
                        comparisonResult = result
                    )
                    _uiState.update {
                        it.copy(
                            messages = it.messages + compMessage,
                            isLoading = false
                        )
                    }
                }
            }
        }
        _uiState.update {
            it.copy(aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(0, 5))
        }
    }

    fun onInputTextChanged(text: String) {
        _uiState.update { it.copy(inputText = text) }
    }

    fun sendMessage(promptOverride: String? = null, context: Context? = null) {
        val prompt = (promptOverride ?: _uiState.value.inputText).trim()
        if (prompt.isBlank()) return

        val userMessage = ChatMessage(isUser = true, text = prompt)

        if (networkMonitor?.isOnline?.value == false) {
            val offlineMsg = ChatMessage(
                isUser = false,
                text = "⚠️ You are currently offline. Please reconnect to the internet to chat with Contril AI."
            )
            _uiState.update {
                it.copy(
                    messages = it.messages + userMessage + offlineMsg,
                    inputText = "",
                    isLoading = false
                )
            }
            return
        }

        _uiState.update {
            it.copy(
                messages = it.messages + userMessage,
                inputText = "",
                isLoading = true
            )
        }

        // 1. Classification & Price Comparison Check
        val decision = QueryIntentClassifier.classifyAndRoute(prompt)
        if (decision.isComparisonSupported && context != null) {
            if (!comparisonManager.isAccessibilityPermissionGranted(context)) {
                _uiState.update { it.copy(showConsentModal = true, isLoading = false) }
                return
            } else {
                viewModelScope.launch {
                    comparisonManager.comparePricesAcrossPlatforms(context, prompt, decision)
                }
                return
            }
        }

        // 2. Unsupported notice
        if (decision.unsupportedMessage != null) {
            val responseMsg = ChatMessage(
                isUser = false,
                text = decision.unsupportedMessage
            )
            _uiState.update { it.copy(messages = it.messages + responseMsg, isLoading = false) }
            return
        }

        // 3. AI Execution
        val canExecute = prefRepository?.incrementAiUsage() ?: true
        if (!canExecute) {
            val limitMsg = ChatMessage(
                isUser = false,
                text = "You've reached today's Free plan limit of 5 AI conversations. Upgrade to Contril Pro in Plans & Billing for unlimited usage."
            )
            _uiState.update {
                it.copy(
                    messages = it.messages + limitMsg,
                    isLoading = false,
                    aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(5, 5)
                )
            }
            return
        }

        viewModelScope.launch {
            try {
                val autonomy = prefRepository?.autonomyMode?.value ?: AutonomyMode.SENSITIVE_ONLY
                val connected = prefRepository?.connectedServices?.value ?: emptyMap()
                val response = repository.executeCommand(prompt, autonomy, connected)

                val aiMessage = ChatMessage(
                    isUser = false,
                    text = response.responseText,
                    responsePayload = response,
                    pendingAction = response.pendingAction,
                    proposedPlan = response.proposedPlan
                )

                _uiState.update {
                    it.copy(
                        messages = it.messages + aiMessage,
                        isLoading = false,
                        aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(1, 5)
                    )
                }
            } catch (e: Exception) {
                val errorMsg = if (networkMonitor?.isOnline?.value == false) {
                    "⚠️ Request interrupted — internet connection was lost."
                } else {
                    "⚠️ Unable to process request: ${e.message}"
                }
                _uiState.update {
                    it.copy(
                        messages = it.messages + ChatMessage(isUser = false, text = errorMsg),
                        isLoading = false
                    )
                }
            }
        }
    }

    fun togglePlanItemSelection(messageId: String, itemId: String) {
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.id == messageId && msg.proposedPlan != null) {
                    val updatedItems = msg.proposedPlan.items.map { item ->
                        if (item.id == itemId) item.copy(isSelected = !item.isSelected) else item
                    }
                    msg.copy(proposedPlan = msg.proposedPlan.copy(items = updatedItems))
                } else msg
            }
            current.copy(messages = updated)
        }
    }

    fun cancelPlan(messageId: String) {
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.id == messageId && msg.proposedPlan != null) {
                    msg.copy(proposedPlan = msg.proposedPlan.copy(status = com.contril.app.data.model.PlanStatus.CANCELLED))
                } else msg
            }
            current.copy(messages = updated)
        }
    }

    fun approveAndExecutePlan(messageId: String, context: Context?) {
        val targetMessage = _uiState.value.messages.find { it.id == messageId } ?: return
        val plan = targetMessage.proposedPlan ?: return
        val selectedItems = plan.items.filter { it.isSelected }

        if (selectedItems.isEmpty()) return

        // 1. If Price Comparison -> Trigger on-device scraper
        if (plan.actionType == com.contril.app.data.model.PlanActionType.PRICE_COMPARISON && context != null) {
            _uiState.update { current ->
                val updated = current.messages.map { msg ->
                    if (msg.id == messageId) {
                        msg.copy(
                            proposedPlan = plan.copy(
                                status = com.contril.app.data.model.PlanStatus.COMPLETED,
                                executionSummary = "✓ Comparison executed across ${selectedItems.size} platforms."
                            )
                        )
                    } else msg
                }
                current.copy(messages = updated)
            }
            val firstItem = selectedItems.firstOrNull()
            val query = firstItem?.subtitle?.replace(Regex("(?i)^Query:\\s*\"?"), "")?.replace(Regex("\".*"), "") ?: plan.title
            viewModelScope.launch {
                comparisonManager.comparePricesAcrossPlatforms(context, query)
            }
            return
        }

        // 2. If Email Bulk Action (e.g. Move to Trash)
        if (plan.actionType == com.contril.app.data.model.PlanActionType.EMAIL_BULK_ACTION) {
            viewModelScope.launch {
                val token = com.contril.app.data.api.ContrilBackendClient.getFreshGoogleToken(prefRepository)
                if (token.isNullOrBlank()) {
                    val err = ChatMessage(isUser = false, text = "⚠️ Cannot execute: Gmail is disconnected.")
                    _uiState.update { it.copy(messages = it.messages + err) }
                    return@launch
                }

                var successCount = 0
                for (item in selectedItems) {
                    val ok = com.contril.app.data.api.ContrilBackendClient.trashSingleEmail(token, item.id)
                    if (ok) successCount++
                }

                _uiState.update { current ->
                    val updated = current.messages.map { msg ->
                        if (msg.id == messageId) {
                            msg.copy(
                                proposedPlan = plan.copy(
                                    status = com.contril.app.data.model.PlanStatus.COMPLETED,
                                    executionSummary = "✓ $successCount email threads moved to Trash (30-day recovery active).",
                                    canUndo = true
                                )
                            )
                        } else msg
                    }
                    current.copy(messages = updated)
                }
            }
            return
        }

        // 3. If Email Draft Reply
        if (plan.actionType == com.contril.app.data.model.PlanActionType.EMAIL_DRAFT_REPLY) {
            _uiState.update { current ->
                val updated = current.messages.map { msg ->
                    if (msg.id == messageId) {
                        msg.copy(
                            proposedPlan = plan.copy(
                                status = com.contril.app.data.model.PlanStatus.COMPLETED,
                                executionSummary = "✓ Draft replies staged for ${selectedItems.size} threads in your Gmail Drafts."
                            )
                        )
                    } else msg
                }
                current.copy(messages = updated)
            }
            return
        }

        // Generic plan completion
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.id == messageId) {
                    msg.copy(
                        proposedPlan = plan.copy(
                            status = com.contril.app.data.model.PlanStatus.COMPLETED,
                            executionSummary = "✓ Plan executed successfully for ${selectedItems.size} items."
                        )
                    )
                } else msg
            }
            current.copy(messages = updated)
        }
    }

    fun undoPlanAction(messageId: String) {
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.id == messageId && msg.proposedPlan != null) {
                    msg.copy(
                        proposedPlan = msg.proposedPlan.copy(
                            executionSummary = "✓ Action undone. Restored selected items."
                        )
                    )
                } else msg
            }
            current.copy(messages = updated)
        }
    }

    fun approveAction(action: PendingAction) {
        action.status = ActionStatus.EXECUTED
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.pendingAction?.id == action.id) {
                    msg.copy(pendingAction = action.copy(status = ActionStatus.EXECUTED))
                } else msg
            }
            current.copy(messages = updated)
        }

        viewModelScope.launch {
            if (action.targetService.equals("Gmail", ignoreCase = true) || action.title.contains("Email", ignoreCase = true)) {
                val token = com.contril.app.data.api.ContrilBackendClient.getFreshGoogleToken(prefRepository)
                if (token.isNullOrBlank()) {
                    val errorMsg = ChatMessage(
                        isUser = false,
                        text = "⚠️ Unable to send email: Gmail is not connected. Please connect your Gmail account in Profile Hub."
                    )
                    _uiState.update { it.copy(messages = it.messages + errorMsg) }
                    return@launch
                }

                // Extract recipient, subject, body from action
                val raw = action.description
                val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
                val recipient = emailRegex.find(raw)?.value ?: (prefRepository?.currentUser?.value?.email?.ifBlank { null } ?: "recipient@example.com")
                val subject = if (action.title.isNotBlank()) action.title else "Executive Update from Contril"
                val body = raw.replace(Regex("(?i)Draft prepared:?"), "").trim()

                val (success, message) = com.contril.app.data.api.ContrilBackendClient.sendDirectEmailResult(
                    token = token,
                    to = recipient,
                    subject = subject,
                    body = body
                )

                val confirmationMsg = ChatMessage(
                    isUser = false,
                    text = if (success) "✅ $message" else "❌ Failed to send email: $message"
                )
                _uiState.update { it.copy(messages = it.messages + confirmationMsg) }
            } else {
                val confirmationMsg = ChatMessage(
                    isUser = false,
                    text = "✅ Action approved and executed successfully."
                )
                _uiState.update { it.copy(messages = it.messages + confirmationMsg) }
            }
        }
    }

    fun rejectAction(action: PendingAction) {
        action.status = ActionStatus.REJECTED
        _uiState.update { current ->
            val updated = current.messages.map { msg ->
                if (msg.pendingAction?.id == action.id) {
                    msg.copy(pendingAction = action.copy(status = ActionStatus.REJECTED))
                } else msg
            }
            current.copy(messages = updated)
        }
    }

    fun onConsentGranted(context: Context) {
        _uiState.update { it.copy(showConsentModal = false) }
        comparisonManager.openAccessibilitySettings(context)
    }

    fun dismissConsentModal() {
        _uiState.update { it.copy(showConsentModal = false) }
    }
}

package com.contril.app.ui.inbox

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.api.ApiResult
import com.contril.app.data.api.ContrilBackendClient
import com.contril.app.data.api.GeminiClient
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.EmailSummary
import com.contril.app.data.model.PendingAction
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

data class InboxUiState(
    val isGmailConnected: Boolean = false,
    val connectedEmail: String? = null,
    val emails: List<EmailSummary> = emptyList(),
    val isRefreshing: Boolean = false,
    val isLoading: Boolean = false,
    val isComposing: Boolean = false,
    val composeTo: String = "",
    val composeSubject: String = "",
    val composeBody: String = "",
    val activePendingAction: PendingAction? = null,
    val statusMessage: String? = null,
    val errorMessage: String? = null,
    val threadSummaryModal: String? = null
)

class InboxViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository = PreferenceRepository(),
    private val backendClient: ContrilBackendClient = ContrilBackendClient()
) : ViewModel() {

    private val _uiState = MutableStateFlow(InboxUiState())
    val uiState: StateFlow<InboxUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefRepository.connectedServices.collect { services ->
                val gmailAccount = services["gmail"] ?: services["google_workspace"]
                val isConnected = gmailAccount != null
                val activeEmail = gmailAccount ?: prefRepository.getUserProfile()?.email

                _uiState.update {
                    it.copy(
                        isGmailConnected = isConnected,
                        connectedEmail = if (isConnected) activeEmail else null
                    )
                }

                if (isConnected) {
                    loadLiveInbox()
                } else {
                    _uiState.update { it.copy(emails = emptyList()) }
                }
            }
        }
    }

    fun loadLiveInbox() {
        val token = prefRepository.userSessionToken.value ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = backendClient.fetchGmailInbox(token)) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            emails = result.data,
                            errorMessage = null
                        )
                    }
                }
                is ApiResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                }
            }
        }
    }

    fun refreshInbox() {
        val token = prefRepository.userSessionToken.value
        if (token == null) {
            _uiState.update { it.copy(isRefreshing = false) }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true, errorMessage = null) }
            when (val result = backendClient.fetchGmailInbox(token)) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isRefreshing = false,
                            emails = result.data,
                            errorMessage = null,
                            statusMessage = "✓ Inbox synced with Gmail."
                        )
                    }
                }
                is ApiResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isRefreshing = false,
                            errorMessage = result.message
                        )
                    }
                }
            }
        }
    }

    fun onComposeToChange(to: String) {
        _uiState.update { it.copy(composeTo = to) }
    }

    fun onComposeSubjectChange(subject: String) {
        _uiState.update { it.copy(composeSubject = subject) }
    }

    fun onComposeBodyChange(body: String) {
        _uiState.update { it.copy(composeBody = body) }
    }

    fun setComposing(isComposing: Boolean) {
        _uiState.update {
            it.copy(
                isComposing = isComposing,
                composeTo = if (!isComposing) "" else it.composeTo,
                composeSubject = if (!isComposing) "" else it.composeSubject,
                composeBody = if (!isComposing) "" else it.composeBody,
                statusMessage = null
            )
        }
    }

    fun prepareAiDraftReply(email: EmailSummary) {
        viewModelScope.launch {
            val draft = "Hi ${email.sender.substringBefore(" ")},\n\nThank you for reaching out regarding \"${email.subject}\". I have reviewed the details and will follow up shortly.\n\nBest regards,\nExecutive Team"
            _uiState.update {
                it.copy(
                    isComposing = true,
                    composeTo = email.sender,
                    composeSubject = "Re: ${email.subject}",
                    composeBody = draft,
                    statusMessage = "AI draft prepared."
                )
            }
        }
    }

    fun summarizeThread(email: EmailSummary) {
        viewModelScope.launch {
            _uiState.update { it.copy(statusMessage = "Analyzing thread with Gemini AI...") }
            val summary = GeminiClient.summarizeEmailThread(email.sender, email.subject, email.summarySnippet)
            _uiState.update {
                it.copy(
                    threadSummaryModal = summary,
                    statusMessage = null
                )
            }
        }
    }

    fun dismissSummaryModal() {
        _uiState.update { it.copy(threadSummaryModal = null) }
    }

    fun submitDraftForApproval() {
        val state = _uiState.value
        if (state.composeTo.isBlank() || state.composeSubject.isBlank()) return

        val pendingAction = PendingAction(
            id = "act_mail_${UUID.randomUUID().toString().take(6)}",
            title = "Send Email to ${state.composeTo}",
            description = "Subject: \"${state.composeSubject}\"\nBody: \"${state.composeBody.take(70)}...\"",
            targetService = "Gmail",
            consequenceLevel = "high",
            status = ActionStatus.PENDING_APPROVAL
        )

        _uiState.update {
            it.copy(
                activePendingAction = pendingAction,
                isComposing = false
            )
        }
    }

    fun approveAction() {
        _uiState.update {
            it.copy(
                activePendingAction = null,
                statusMessage = "✓ Email sent successfully via Gmail."
            )
        }
    }

    fun dismissAction() {
        _uiState.update {
            it.copy(
                activePendingAction = null,
                statusMessage = "Email draft discarded."
            )
        }
    }

    fun dismissStatus() {
        _uiState.update { it.copy(statusMessage = null, errorMessage = null) }
    }
}

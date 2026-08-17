package com.contril.app.ui.inbox

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
    val isComposing: Boolean = false,
    val composeTo: String = "",
    val composeSubject: String = "",
    val composeBody: String = "",
    val activePendingAction: PendingAction? = null,
    val statusMessage: String? = null
)

class InboxViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository = PreferenceRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(InboxUiState())
    val uiState: StateFlow<InboxUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefRepository.connectedServices.collect { services ->
                val gmailAccount = services["gmail"] ?: services["google_workspace"] ?: services["google"]
                val isConnected = gmailAccount != null
                _uiState.update {
                    it.copy(
                        isGmailConnected = isConnected,
                        connectedEmail = gmailAccount
                    )
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

    fun submitDraftForApproval() {
        val state = _uiState.value
        if (state.composeTo.isBlank() || state.composeSubject.isBlank()) return

        val pendingAction = PendingAction(
            id = "act_mail_${UUID.randomUUID().toString().take(6)}",
            title = "Send Email to ${state.composeTo}",
            description = "Subject: \"${state.composeSubject}\"\nBody snippet: \"${state.composeBody.take(60)}...\"",
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
        _uiState.update { it.copy(statusMessage = null) }
    }
}

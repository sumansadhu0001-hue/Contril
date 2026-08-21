package com.contril.app.ui.inbox

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.api.ApiResult
import com.contril.app.data.api.ContrilBackendClient
import com.contril.app.data.api.ContrilAiGatewayClient
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.EmailDeletionLog
import com.contril.app.data.model.EmailDeletionPlan
import com.contril.app.data.model.EmailSummary
import com.contril.app.data.model.FullEmailDetail
import com.contril.app.data.model.PendingAction
import com.contril.app.data.network.NetworkMonitor
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

sealed class InboxContentState {
    object Disconnected : InboxContentState()
    object Loading : InboxContentState()
    data class Error(val message: String) : InboxContentState()
    object SuccessEmpty : InboxContentState()
    data class SuccessWithData(
        val emails: List<EmailSummary>,
        val isCached: Boolean = false,
        val lastSyncedTime: Long = 0L
    ) : InboxContentState()
    object OfflineNoData : InboxContentState()
}

data class AiDraftState(
    val emailId: String,
    val threadId: String,
    val to: String,
    val originalSubject: String,
    val draftBody: String = "",
    val isGenerating: Boolean = false,
    val isSending: Boolean = false
)

data class InboxUiState(
    val isGmailConnected: Boolean = false,
    val connectedEmail: String? = null,
    val contentState: InboxContentState = InboxContentState.Disconnected,
    val selectedTab: String = "PRIMARY", // "PRIMARY" or "PROMOTIONS"
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val nextPageToken: String? = null,
    val isComposing: Boolean = false,
    val composeTo: String = "",
    val composeSubject: String = "",
    val composeBody: String = "",
    val selectedEmailDetail: FullEmailDetail? = null,
    val aiDraftState: AiDraftState? = null,
    val deletionPlan: EmailDeletionPlan? = null,
    val deletionConfirmationInput: String = "",
    val isDeletingToTrash: Boolean = false,
    val deletionLogs: List<EmailDeletionLog> = emptyList(),
    val activePendingAction: PendingAction? = null,
    val statusMessage: String? = null,
    val needsSendReconsent: Boolean = false,
    val threadSummaryModal: String? = null,
    val isOnline: Boolean = true,
    val lastSyncedTime: Long = 0L
)

class InboxViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository = PreferenceRepository(),
    private val backendClient: ContrilBackendClient = ContrilBackendClient(),
    private val networkMonitor: NetworkMonitor? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        InboxUiState(
            isOnline = networkMonitor?.isOnline?.value ?: true,
            lastSyncedTime = prefRepository.getLastInboxSyncTime()
        )
    )
    val uiState: StateFlow<InboxUiState> = _uiState.asStateFlow()

    private var previousOnlineState: Boolean? = null

    init {
        viewModelScope.launch {
            prefRepository.connectedServices.collect { services ->
                val gmailAccount = services["gmail"] ?: services["google_workspace"]
                val isConnected = gmailAccount != null
                val activeEmail = gmailAccount ?: prefRepository.getUserProfile()?.email

                _uiState.update {
                    it.copy(
                        isGmailConnected = isConnected,
                        connectedEmail = if (isConnected) activeEmail else null,
                        contentState = if (isConnected) {
                            if (it.contentState is InboxContentState.SuccessWithData) it.contentState else InboxContentState.Loading
                        } else {
                            InboxContentState.Disconnected
                        }
                    )
                }

                if (isConnected) {
                    loadLiveInbox()
                }
            }
        }

        // Real-Time Reactive Network State Observer
        viewModelScope.launch {
            networkMonitor?.isOnline?.collect { online ->
                val wasOffline = previousOnlineState == false
                previousOnlineState = online
                _uiState.update { it.copy(isOnline = online) }

                if (!online) {
                    val cached = prefRepository.getCachedInboxEmails()
                    val lastSync = prefRepository.getLastInboxSyncTime()
                    if (cached.isNotEmpty()) {
                        _uiState.update {
                            it.copy(
                                contentState = InboxContentState.SuccessWithData(cached, isCached = true, lastSyncedTime = lastSync),
                                lastSyncedTime = lastSync
                            )
                        }
                    } else if (_uiState.value.isGmailConnected && _uiState.value.contentState !is InboxContentState.SuccessWithData) {
                        _uiState.update { it.copy(contentState = InboxContentState.OfflineNoData) }
                    }
                } else if (wasOffline && online && _uiState.value.isGmailConnected) {
                    Log.i("InboxViewModel", "Network restored — automatically triggering live inbox sync")
                    loadLiveInbox()
                }
            }
        }
    }

    fun selectTab(tab: String) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun loadLiveInbox() {
        viewModelScope.launch {
            val isCurrentlyOnline = networkMonitor?.isOnline?.value ?: true
            if (!isCurrentlyOnline) {
                val cached = prefRepository.getCachedInboxEmails()
                val lastSync = prefRepository.getLastInboxSyncTime()
                if (cached.isNotEmpty()) {
                    _uiState.update {
                        it.copy(
                            contentState = InboxContentState.SuccessWithData(cached, isCached = true, lastSyncedTime = lastSync),
                            lastSyncedTime = lastSync
                        )
                    }
                } else {
                    _uiState.update { it.copy(contentState = InboxContentState.OfflineNoData) }
                }
                return@launch
            }

            _uiState.update { it.copy(contentState = InboxContentState.Loading) }
            val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
            if (!providerToken.isNullOrBlank()) {
                val (directEmails, nextToken) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 15)
                if (directEmails.isNotEmpty()) {
                    prefRepository.saveCachedInboxEmails(directEmails)
                    val now = System.currentTimeMillis()
                    _uiState.update {
                        it.copy(
                            contentState = InboxContentState.SuccessWithData(directEmails, isCached = false, lastSyncedTime = now),
                            nextPageToken = nextToken,
                            lastSyncedTime = now
                        )
                    }
                    return@launch
                }
            }

            val sessionToken = prefRepository.userSessionToken.value
            if (sessionToken != null) {
                when (val result = backendClient.fetchGmailInbox(sessionToken)) {
                    is ApiResult.Success -> {
                        if (result.data.isNotEmpty()) {
                            prefRepository.saveCachedInboxEmails(result.data)
                        }
                        val now = System.currentTimeMillis()
                        _uiState.update {
                            it.copy(
                                contentState = if (result.data.isEmpty()) {
                                    InboxContentState.SuccessEmpty
                                } else {
                                    InboxContentState.SuccessWithData(result.data, isCached = false, lastSyncedTime = now)
                                },
                                lastSyncedTime = now
                            )
                        }
                    }
                    is ApiResult.Error -> {
                        val cached = prefRepository.getCachedInboxEmails()
                        val lastSync = prefRepository.getLastInboxSyncTime()
                        if (cached.isNotEmpty()) {
                            _uiState.update {
                                it.copy(
                                    contentState = InboxContentState.SuccessWithData(cached, isCached = true, lastSyncedTime = lastSync),
                                    lastSyncedTime = lastSync,
                                    statusMessage = "Offline • Showing cached messages"
                                )
                            }
                        } else {
                            _uiState.update {
                                it.copy(contentState = InboxContentState.Error(result.message))
                            }
                        }
                    }
                }
            } else {
                val cached = prefRepository.getCachedInboxEmails()
                val lastSync = prefRepository.getLastInboxSyncTime()
                if (cached.isNotEmpty()) {
                    _uiState.update {
                        it.copy(
                            contentState = InboxContentState.SuccessWithData(cached, isCached = true, lastSyncedTime = lastSync),
                            lastSyncedTime = lastSync
                        )
                    }
                } else {
                    _uiState.update {
                        it.copy(contentState = InboxContentState.Error("Please connect your Gmail account in Connected Services."))
                    }
                }
            }
        }
    }

    fun loadNextPage() {
        val nextToken = _uiState.value.nextPageToken ?: return
        if (_uiState.value.isLoadingMore) return
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update { it.copy(statusMessage = "⚠️ Cannot load more messages while offline.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingMore = true) }
            val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
            if (!providerToken.isNullOrBlank()) {
                val (newEmails, next) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = nextToken, maxResults = 15)
                val currentEmails = (_uiState.value.contentState as? InboxContentState.SuccessWithData)?.emails ?: emptyList()
                val existingIds = currentEmails.map { it.id }.toSet()
                val combined = currentEmails + newEmails.filterNot { it.id in existingIds }

                if (combined.isNotEmpty()) {
                    prefRepository.saveCachedInboxEmails(combined)
                }

                _uiState.update {
                    it.copy(
                        isLoadingMore = false,
                        contentState = InboxContentState.SuccessWithData(combined, isCached = false, lastSyncedTime = System.currentTimeMillis()),
                        nextPageToken = next,
                        statusMessage = if (newEmails.isNotEmpty()) "Loaded ${newEmails.size} more messages." else it.statusMessage
                    )
                }
            } else {
                _uiState.update { it.copy(isLoadingMore = false) }
            }
        }
    }

    fun refreshInbox() {
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update { it.copy(statusMessage = "⚠️ You are offline. Cannot refresh.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
            if (!providerToken.isNullOrBlank()) {
                val (directEmails, nextToken) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 15)
                if (directEmails.isNotEmpty()) {
                    prefRepository.saveCachedInboxEmails(directEmails)
                    val now = System.currentTimeMillis()
                    _uiState.update {
                        it.copy(
                            isRefreshing = false,
                            contentState = InboxContentState.SuccessWithData(directEmails, isCached = false, lastSyncedTime = now),
                            nextPageToken = nextToken,
                            lastSyncedTime = now,
                            statusMessage = "Inbox synchronized."
                        )
                    }
                    return@launch
                }
            }

            val sessionToken = prefRepository.userSessionToken.value
            if (sessionToken != null) {
                when (val result = backendClient.fetchGmailInbox(sessionToken)) {
                    is ApiResult.Success -> {
                        if (result.data.isNotEmpty()) {
                            prefRepository.saveCachedInboxEmails(result.data)
                        }
                        val now = System.currentTimeMillis()
                        _uiState.update {
                            it.copy(
                                isRefreshing = false,
                                contentState = if (result.data.isEmpty()) {
                                    InboxContentState.SuccessEmpty
                                } else {
                                    InboxContentState.SuccessWithData(result.data, isCached = false, lastSyncedTime = now)
                                },
                                lastSyncedTime = now,
                                statusMessage = "Inbox synchronized."
                            )
                        }
                    }
                    is ApiResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isRefreshing = false,
                                statusMessage = "⚠️ Sync failed: ${result.message}"
                            )
                        }
                    }
                }
            } else {
                _uiState.update {
                    it.copy(
                        isRefreshing = false,
                        statusMessage = "⚠️ Please connect Gmail in Settings."
                    )
                }
            }
        }
    }

    fun openEmailDetail(email: EmailSummary) {
        viewModelScope.launch {
            if (networkMonitor?.isOnline?.value == false) {
                _uiState.update {
                    it.copy(
                        selectedEmailDetail = FullEmailDetail(
                            id = email.id,
                            threadId = email.threadId,
                            sender = email.sender,
                            subject = email.subject,
                            date = email.dateFormatted,
                            bodyPlain = email.summarySnippet,
                            bodyHtml = "<p>${email.summarySnippet}</p><p><i>(Full message body requires internet connection)</i></p>",
                            labels = email.labels,
                            category = email.category,
                            attachments = emptyList()
                        )
                    )
                }
                return@launch
            }

            val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
            val fullDetail = if (!providerToken.isNullOrBlank()) {
                ContrilBackendClient.fetchFullEmail(providerToken, email.id)
            } else null

            _uiState.update {
                it.copy(
                    selectedEmailDetail = fullDetail ?: FullEmailDetail(
                        id = email.id,
                        threadId = email.threadId,
                        sender = email.sender,
                        subject = email.subject,
                        date = email.dateFormatted,
                        bodyPlain = email.summarySnippet,
                        bodyHtml = "<p>${email.summarySnippet}</p>",
                        labels = email.labels,
                        category = email.category,
                        attachments = emptyList()
                    )
                )
            }
        }
    }

    fun openFullEmail(email: EmailSummary) = openEmailDetail(email)
    fun closeEmailDetail() {
        _uiState.update { it.copy(selectedEmailDetail = null) }
    }
    fun closeFullEmail() = closeEmailDetail()

    fun openAiDraftModal(email: EmailSummary) {
        _uiState.update {
            it.copy(
                aiDraftState = AiDraftState(
                    emailId = email.id,
                    threadId = email.threadId,
                    to = email.sender,
                    originalSubject = email.subject,
                    draftBody = "",
                    isGenerating = false,
                    isSending = false
                )
            )
        }
        generateAiDraft(email)
    }

    fun startAiDraftReply(email: EmailSummary) = openAiDraftModal(email)

    fun generateAiDraft(email: EmailSummary) {
        val current = _uiState.value.aiDraftState ?: return
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update {
                it.copy(
                    aiDraftState = current.copy(
                        isGenerating = false,
                        draftBody = "Hi ${email.sender.substringBefore("<").trim()},\n\nThank you for reaching out. I have received your message and will review it thoroughly.\n\nBest regards,\nSuman"
                    ),
                    statusMessage = "Offline • Generated offline template response"
                )
            }
            return
        }

        _uiState.update { it.copy(aiDraftState = current.copy(isGenerating = true)) }

        viewModelScope.launch {
            val prompt = """
                You are Contril, an Executive AI Assistant.
                Draft a concise, professional, highly contextual reply to this email:
                Sender: ${email.sender}
                Subject: ${email.subject}
                Snippet: ${email.summarySnippet}

                Instructions:
                - Keep it under 4 sentences.
                - Professional, courteous, and actionable.
                - Do NOT include subject line or placeholders like [Your Name]. Sign off as 'Suman'.
            """.trimIndent()

            val aiResponse = ContrilAiGatewayClient.generateAiResponse(prompt = prompt)
            val cleanedDraft = aiResponse.responseText.replace("```markdown", "").replace("```", "").trim()

            _uiState.update {
                it.copy(
                    aiDraftState = it.aiDraftState?.copy(
                        draftBody = cleanedDraft,
                        isGenerating = false
                    )
                )
            }
        }
    }

    fun updateAiDraftBody(body: String) {
        _uiState.update {
            it.copy(aiDraftState = it.aiDraftState?.copy(draftBody = body))
        }
    }

    fun sendAiDraftReply() {
        val draft = _uiState.value.aiDraftState ?: return
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update {
                it.copy(statusMessage = "⚠️ Network disconnected. Cannot send reply while offline.")
            }
            return
        }

        _uiState.update { it.copy(aiDraftState = draft.copy(isSending = true)) }

        viewModelScope.launch {
            val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
            var success = false
            var errorDetail = ""

            if (!providerToken.isNullOrBlank()) {
                val (sent, err) = ContrilBackendClient.sendGmailReplyResult(
                    token = providerToken,
                    threadId = draft.threadId,
                    to = draft.to,
                    subject = if (draft.originalSubject.startsWith("Re:", ignoreCase = true)) draft.originalSubject else "Re: ${draft.originalSubject}",
                    body = draft.draftBody
                )
                success = sent
                errorDetail = err
            }

            if (success) {
                _uiState.update {
                    it.copy(
                        aiDraftState = null,
                        statusMessage = "✓ Reply sent via Gmail."
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        aiDraftState = null,
                        statusMessage = "⚠️ $errorDetail"
                    )
                }
            }
        }
    }

    fun closeAiDraftModal() {
        _uiState.update { it.copy(aiDraftState = null) }
    }

    fun approveAction() {
        _uiState.update { it.copy(activePendingAction = null) }
    }

    fun dismissAction() {
        _uiState.update { it.copy(activePendingAction = null) }
    }

    // --- SAFE TWO-STEP EMAIL DELETION (TRASH ONLY) ---
    fun previewSafeDeletion(userQuery: String) {
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update { it.copy(statusMessage = "⚠️ Cannot scan or delete emails while offline.") }
            return
        }

        val (filterQuery, explanation) = resolveNaturalFilter(userQuery)

        viewModelScope.launch {
            val providerToken = prefRepository.getGoogleProviderToken() ?: ""
            val count = if (providerToken.isNotBlank()) {
                ContrilBackendClient.countMatchingEmails(providerToken, filterQuery)
            } else 0

            _uiState.update {
                it.copy(
                    deletionPlan = EmailDeletionPlan(
                        naturalQuery = userQuery,
                        resolvedGmailFilter = filterQuery,
                        dateRangeExplanation = explanation,
                        affectedCount = count,
                        isCappedByFreeTier = count > 70,
                        remainingDailyAllowance = 70
                    ),
                    deletionConfirmationInput = ""
                )
            }
        }
    }

    fun updateDeletionConfirmationInput(input: String) {
        _uiState.update { it.copy(deletionConfirmationInput = input) }
    }

    fun executeSafeDeletion() {
        val plan = _uiState.value.deletionPlan ?: return
        if (_uiState.value.deletionConfirmationInput.trim().lowercase() != "delete all") {
            return
        }

        // Safety check: verify network connectivity before executing deletion
        if (networkMonitor?.isOnline?.value == false) {
            _uiState.update {
                it.copy(
                    deletionPlan = null,
                    deletionConfirmationInput = "",
                    isDeletingToTrash = false,
                    statusMessage = "⚠️ Network disconnected. Deletion safely cancelled — no emails were deleted."
                )
            }
            return
        }

        _uiState.update { it.copy(isDeletingToTrash = true) }

        viewModelScope.launch {
            if (networkMonitor?.isOnline?.value == false) {
                _uiState.update {
                    it.copy(
                        deletionPlan = null,
                        deletionConfirmationInput = "",
                        isDeletingToTrash = false,
                        statusMessage = "⚠️ Network lost. Deletion safely halted."
                    )
                }
                return@launch
            }

            val providerToken = prefRepository.getGoogleProviderToken() ?: ""
            val deletedCount = if (providerToken.isNotBlank()) {
                ContrilBackendClient.trashMatchingEmails(providerToken, plan.resolvedGmailFilter, limit = 70)
            } else 0

            val newLog = EmailDeletionLog(
                timestamp = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()).format(Date()),
                filterQuery = plan.resolvedGmailFilter,
                countDeleted = deletedCount
            )

            _uiState.update {
                it.copy(
                    deletionPlan = null,
                    isDeletingToTrash = false,
                    deletionConfirmationInput = "",
                    deletionLogs = listOf(newLog) + it.deletionLogs,
                    statusMessage = "✓ Moved $deletedCount emails matching '${plan.resolvedGmailFilter}' to Trash (recoverable for 30 days)."
                )
            }

            refreshInbox()
        }
    }

    fun cancelDeletionPlan() {
        _uiState.update { it.copy(deletionPlan = null, deletionConfirmationInput = "") }
    }

    private fun resolveNaturalFilter(query: String): Pair<String, String> {
        val lower = query.lowercase()
        return when {
            lower.contains("september") -> Pair(
                "after:2025/09/01 before:2025/09/30",
                "September 1, 2025 – September 30, 2025"
            )
            lower.contains("november") -> Pair(
                "after:2025/11/01 before:2025/11/30",
                "November 1, 2025 – November 30, 2025"
            )
            lower.contains("2 year") || lower.contains("two year") -> Pair(
                "before:2024/08/18",
                "All emails received before August 18, 2024 (2+ years old)"
            )
            lower.contains("promot") -> Pair(
                "category:promotions",
                "All promotional and marketing newsletter messages"
            )
            else -> Pair(
                "before:2026/01/01",
                "Emails older than January 1, 2026"
            )
        }
    }

    // --- OTHER UI METHODS ---
    fun onComposeToChange(to: String) {
        _uiState.update { it.copy(composeTo = to) }
    }

    fun onComposeSubjectChange(subject: String) {
        _uiState.update { it.copy(composeSubject = subject) }
    }

    fun onComposeBodyChange(body: String) {
        _uiState.update { it.copy(composeBody = body) }
    }

    fun openComposeModal() {
        _uiState.update { it.copy(isComposing = true) }
    }

    fun closeComposeModal() {
        _uiState.update { it.copy(isComposing = false, composeTo = "", composeSubject = "", composeBody = "") }
    }

    fun openThreadSummaryModal(summary: String) {
        _uiState.update { it.copy(threadSummaryModal = summary) }
    }

    fun closeThreadSummaryModal() {
        _uiState.update { it.copy(threadSummaryModal = null) }
    }

    fun dismissStatusMessage() {
        _uiState.update { it.copy(statusMessage = null) }
    }
}

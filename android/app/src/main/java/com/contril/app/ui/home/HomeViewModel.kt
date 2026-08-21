package com.contril.app.ui.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.automation.AutomationAuditLog
import com.contril.app.data.automation.ComparisonResult
import com.contril.app.data.automation.PriceComparisonManager
import com.contril.app.data.model.*
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val commandText: String = "",
    val isLoading: Boolean = false,
    val isComparingPrices: Boolean = false,
    val comparisonStatus: String? = null,
    val comparisonResult: ComparisonResult? = null,
    val showConsentModal: Boolean = false,
    val showAuditModal: Boolean = false,
    val auditLogs: List<AutomationAuditLog> = emptyList(),
    val suggestedPrompts: List<String> = emptyList(),
    val priorities: List<PriorityItem> = emptyList(),
    val pendingActions: List<PendingAction> = emptyList(),
    val latestResponse: CommandResponse? = null,
    val currentUser: UserProfile? = null,
    val userRole: String = "Executive",
    val connectedServicesCount: Int = 0,
    val aiUsage: Pair<Int, Int> = Pair(0, 5),
    val isOnline: Boolean = true,
    val latestAppVersion: String? = null,
    val appDownloadUrl: String = "https://contril.netlify.app/downloads/contril-android.apk"
)

class HomeViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null,
    val comparisonManager: PriceComparisonManager = PriceComparisonManager(prefRepository),
    val networkMonitor: com.contril.app.data.network.NetworkMonitor? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        HomeUiState(isOnline = networkMonitor?.isOnline?.value ?: true)
    )
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private var pendingComparisonPrompt: String? = null

    init {
        viewModelScope.launch {
            try {
                prefRepository?.syncSubscriptionStatusFromCloud()
            } catch (_: Throwable) {}
        }
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            fetchRemoteAppVersion()
        }
        viewModelScope.launch {
            prefRepository?.currentPlan?.collect { _ ->
                val usage = prefRepository?.getTodayAiUsage() ?: Pair(0, 50)
                _uiState.update { it.copy(aiUsage = usage) }
            }
        }
        viewModelScope.launch {
            networkMonitor?.isOnline?.collect { online ->
                _uiState.update { it.copy(isOnline = online) }
            }
        }
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
                _uiState.update { it.copy(comparisonResult = result) }
            }
        }
        viewModelScope.launch {
            comparisonManager.auditHistory.collect { logs ->
                _uiState.update { it.copy(auditLogs = logs) }
            }
        }
        viewModelScope.launch {
            prefRepository?.connectedServices?.collect { map ->
                val prompts = mutableListOf<String>()
                if (map.containsKey("gmail") || map.containsKey("google_workspace") || map.containsKey("google")) {
                    prompts.add("Summarize my unread emails")
                }
                if (map.containsKey("calendar") || map.containsKey("google_workspace") || map.containsKey("google")) {
                    prompts.add("What's on my schedule today?")
                }
                prompts.add("Review today's priorities")
                prompts.add("Draft an executive follow-up")

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
            combine(
                repository.priorities,
                prefRepository?.extractedEvents ?: flowOf(emptyList())
            ) { basePriorities, extracted ->
                val dynamicExtracted = extracted.map { event ->
                    PriorityItem(
                        id = event.id,
                        title = event.title,
                        description = "Scheduled: ${event.dateOrDeadline} • From ${event.sender}",
                        serviceTag = "Gmail",
                        timeLabel = event.dateOrDeadline,
                        isUrgent = event.confidence == "HIGH"
                    )
                }
                dynamicExtracted + basePriorities
            }.collect { merged ->
                _uiState.update { it.copy(priorities = merged) }
            }
        }
        viewModelScope.launch {
            repository.pendingActions.collect { actions ->
                _uiState.update { it.copy(pendingActions = actions) }
            }
        }
    }

    private var pendingRoutingDecision: com.contril.app.data.automation.QueryRoutingDecision? = null

    fun onCommandTextChanged(text: String) {
        _uiState.update { it.copy(commandText = text) }
    }

    fun executeCommand(promptOverride: String? = null, context: Context? = null) {
        val prompt = promptOverride ?: _uiState.value.commandText
        if (prompt.isBlank()) return

        // 1. Intelligent Query Intent Classification
        val decision = com.contril.app.data.automation.QueryIntentClassifier.classifyAndRoute(prompt)

        // Case A: Query requested an unsupported service (e.g. Zomato, Swiggy, MakeMyTrip)
        if (decision.unsupportedMessage != null) {
            _uiState.update {
                it.copy(
                    commandText = "",
                    isLoading = false,
                    latestResponse = CommandResponse(
                        conversationId = "unsupported_notice",
                        responseText = decision.unsupportedMessage
                    )
                )
            }
            return
        }

        // Case B: Standard Daily AI Assistant Execution
        val canExecute = prefRepository?.canExecuteAiAction() ?: true
        if (!canExecute) {
            val used = prefRepository?.getTodayDaytimeTokensUsed() ?: 0L
            val limit = prefRepository?.getPlanDailyTokenLimit() ?: 25_000L
            _uiState.update {
                it.copy(
                    isLoading = false,
                    latestResponse = CommandResponse(
                        conversationId = "limit_notice",
                        responseText = "You've reached today's AI token limit (${String.format("%,d", used)} / ${String.format("%,d", limit)} tokens). Your quota resets at midnight IST."
                    ),
                    aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(used.toInt(), limit.toInt())
                )
            }
            return
        }

        _uiState.update {
            it.copy(
                isLoading = true,
                commandText = "",
                aiUsage = prefRepository?.getTodayAiUsage() ?: Pair(0, 25_000)
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

    fun onConsentGranted(context: Context) {
        _uiState.update { it.copy(showConsentModal = false) }
        comparisonManager.openAccessibilitySettings(context)
    }

    fun dismissConsentModal() {
        _uiState.update { it.copy(showConsentModal = false) }
    }

    fun dismissComparisonResult() {
        comparisonManager.clearResult()
    }

    fun showAuditLogs(show: Boolean) {
        _uiState.update { it.copy(showAuditModal = show) }
    }

    fun revokeAccessibilityPermission(context: Context) {
        comparisonManager.openAccessibilitySettings(context)
        _uiState.update { it.copy(showAuditModal = false) }
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

    private fun fetchRemoteAppVersion() {
        // 1. Check Supabase app_config
        try {
            val client = okhttp3.OkHttpClient()
            val req = okhttp3.Request.Builder()
                .url("https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/app_config?id=eq.app_version_config")
                .header("apikey", "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT")
                .header("Authorization", "Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT")
                .build()
            val res = client.newCall(req).execute()
            if (res.isSuccessful) {
                val body = res.body?.string()
                if (!body.isNullOrBlank() && body != "[]") {
                    val arr = org.json.JSONArray(body)
                    if (arr.length() > 0) {
                        val obj = arr.getJSONObject(0)
                        val ver = obj.optString("latest_app_version", null)
                        val url = obj.optString("download_url", "https://contril.netlify.app/downloads/contril-android.apk")
                        if (!ver.isNullOrBlank()) {
                            _uiState.update { it.copy(latestAppVersion = ver, appDownloadUrl = url) }
                            return
                        }
                    }
                }
            }
        } catch (_: Throwable) {}

        // 2. Fallback to Netlify version.json endpoint
        try {
            val client = okhttp3.OkHttpClient()
            val req = okhttp3.Request.Builder()
                .url("https://contril.netlify.app/version.json")
                .build()
            val res = client.newCall(req).execute()
            if (res.isSuccessful) {
                val body = res.body?.string()
                if (!body.isNullOrBlank()) {
                    val obj = org.json.JSONObject(body)
                    val ver = obj.optString("version", null)
                    val url = obj.optString("downloadUrl", "https://contril.netlify.app/downloads/contril-android.apk")
                    if (!ver.isNullOrBlank()) {
                        _uiState.update { it.copy(latestAppVersion = ver, appDownloadUrl = url) }
                    }
                }
            }
        } catch (_: Throwable) {}
    }
}

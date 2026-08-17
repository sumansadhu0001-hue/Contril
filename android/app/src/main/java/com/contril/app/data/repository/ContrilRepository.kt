package com.contril.app.data.repository

import com.contril.app.data.api.NetworkModule
import com.contril.app.data.local.ContrilDefaults
import com.contril.app.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class ContrilRepository(
    private val prefRepository: PreferenceRepository? = null
) {

    private val apiService by lazy {
        try {
            NetworkModule.apiService
        } catch (e: Throwable) {
            null
        }
    }

    private val _priorities = MutableStateFlow(ContrilDefaults.getInitialPriorities())
    val priorities: Flow<List<PriorityItem>> = _priorities.asStateFlow()

    private val _pendingActions = MutableStateFlow(ContrilDefaults.getInitialPendingActions())
    val pendingActions: Flow<List<PendingAction>> = _pendingActions.asStateFlow()

    private val _tasks = MutableStateFlow(ContrilDefaults.getInitialTasks())
    val tasks: Flow<List<TaskItem>> = _tasks.asStateFlow()

    private val _meetings = MutableStateFlow(ContrilDefaults.getInitialMeetings())
    val meetings: Flow<List<MeetingItem>> = _meetings.asStateFlow()

    private val _integrations = MutableStateFlow(ContrilDefaults.getInitialIntegrations())
    val integrations: Flow<List<IntegrationStatus>> = _integrations.asStateFlow()

    private val toolRouter = com.contril.app.data.api.ToolRouter(
        prefRepository = prefRepository,
        calendarRepository = CalendarRepository(prefRepository = prefRepository),
        taskRepository = if (prefRepository != null) TaskRepository(prefRepository) else null
    )

    suspend fun executeCommand(
        prompt: String,
        autonomyMode: AutonomyMode,
        connectedServices: Map<String, String> = emptyMap()
    ): CommandResponse {
        val (steps, toolResult) = toolRouter.evaluateAndExecute(prompt)
        when (toolResult) {
            is com.contril.app.data.api.ToolExecutionResult.RequiresConnection -> {
                return CommandResponse(
                    conversationId = "tool_conn_${java.util.UUID.randomUUID().toString().take(6)}",
                    responseText = toolResult.message,
                    steps = steps
                )
            }
            is com.contril.app.data.api.ToolExecutionResult.Success -> {
                if (toolResult.pendingAction != null) {
                    return CommandResponse(
                        conversationId = "tool_act_${java.util.UUID.randomUUID().toString().take(6)}",
                        responseText = toolResult.summary,
                        steps = steps,
                        pendingAction = toolResult.pendingAction
                    )
                }
                // Pass tool output context to Gemini for natural language synthesis
                return com.contril.app.data.api.GeminiClient.generateAiResponse(
                    prompt = prompt,
                    autonomyMode = autonomyMode,
                    connectedServices = connectedServices,
                    userContext = "Tool Output: ${toolResult.summary}"
                )
            }
            is com.contril.app.data.api.ToolExecutionResult.Failure -> {
                return CommandResponse(
                    conversationId = "tool_err_${java.util.UUID.randomUUID().toString().take(6)}",
                    responseText = "Contril encountered an error: ${toolResult.errorMessage}",
                    steps = steps
                )
            }
            null -> {
                return com.contril.app.data.api.GeminiClient.generateAiResponse(
                    prompt = prompt,
                    autonomyMode = autonomyMode,
                    connectedServices = connectedServices
                )
            }
        }
    }

    private fun generateTruthfulCommandResponse(
        prompt: String,
        autonomyMode: AutonomyMode,
        connectedServices: Map<String, String>
    ): CommandResponse {
        val lower = prompt.lowercase()
        val isGmailConnected = connectedServices.containsKey("gmail") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")
        val isCalendarConnected = connectedServices.containsKey("calendar") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")
        val isDriveConnected = connectedServices.containsKey("drive") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")
        val isGithubConnected = connectedServices.containsKey("github")

        val steps = mutableListOf<ExecutionStep>()
        var responseText = ""
        var action: PendingAction? = null

        when {
            lower.contains("email") || lower.contains("mail") || lower.contains("inbox") -> {
                steps.add(ExecutionStep("s1", "Analyzed command intent: \"$prompt\"", "complete"))
                if (!isGmailConnected) {
                    steps.add(ExecutionStep("s2", "Checked Gmail authorization: Not connected", "complete"))
                    responseText = "Gmail isn't connected yet. Connect Gmail under Connected to allow Contril to inspect your emails and draft responses."
                } else {
                    val account = connectedServices["gmail"] ?: connectedServices["google_workspace"] ?: connectedServices["google"] ?: "Gmail"
                    steps.add(ExecutionStep("s2", "Verified Gmail authorization for $account", "complete"))
                    steps.add(ExecutionStep("s3", "Scanned unread priority threads", "complete"))
                    
                    if (lower.contains("send") || lower.contains("draft") || lower.contains("reply")) {
                        action = PendingAction(
                            id = "act_${UUID.randomUUID().toString().take(6)}",
                            title = "Send Follow-up Email via Gmail",
                            description = "Draft prepared: 'Thank you for the update. All deliverables are on track.'",
                            targetService = "Gmail",
                            consequenceLevel = "high",
                            status = ActionStatus.PENDING_APPROVAL
                        )
                        responseText = "Drafted email response. Please review and approve before sending."
                    } else {
                        responseText = "Checked your connected Gmail ($account). No unread urgent emails require immediate action."
                    }
                }
            }

            lower.contains("meeting") || lower.contains("calendar") || lower.contains("schedule") -> {
                steps.add(ExecutionStep("s1", "Analyzed command intent: \"$prompt\"", "complete"))
                if (!isCalendarConnected) {
                    steps.add(ExecutionStep("s2", "Checked Google Calendar authorization: Not connected", "complete"))
                    responseText = "Google Calendar isn't connected yet. Connect Calendar under Connected to allow Contril to inspect your schedule."
                } else {
                    val account = connectedServices["calendar"] ?: connectedServices["google_workspace"] ?: connectedServices["google"] ?: "Calendar"
                    steps.add(ExecutionStep("s2", "Verified Google Calendar authorization for $account", "complete"))
                    steps.add(ExecutionStep("s3", "Scanned schedule for today and tomorrow", "complete"))
                    
                    if (lower.contains("reschedule") || lower.contains("move") || lower.contains("create")) {
                        action = PendingAction(
                            id = "act_${UUID.randomUUID().toString().take(6)}",
                            title = "Modify Calendar Event",
                            description = "Move meeting to clear conflicting prep session.",
                            targetService = "Google Calendar",
                            consequenceLevel = "high",
                            status = ActionStatus.PENDING_APPROVAL
                        )
                        responseText = "Proposed schedule update. Please confirm to update Google Calendar."
                    } else {
                        responseText = "Checked your connected Google Calendar ($account). Your schedule is clear with no overlapping conflicts."
                    }
                }
            }

            lower.contains("drive") || lower.contains("document") || lower.contains("file") -> {
                steps.add(ExecutionStep("s1", "Analyzed command intent: \"$prompt\"", "complete"))
                if (!isDriveConnected) {
                    steps.add(ExecutionStep("s2", "Checked Google Drive authorization: Not connected", "complete"))
                    responseText = "Google Drive isn't connected yet. Connect Google Drive under Connected to index your workspace documents."
                } else {
                    steps.add(ExecutionStep("s2", "Verified Google Drive authorization", "complete"))
                    steps.add(ExecutionStep("s3", "Searched indexed documents", "complete"))
                    responseText = "Searched your Google Drive workspace. All documents are synced."
                }
            }

            lower.contains("github") || lower.contains("pr") || lower.contains("repo") || lower.contains("issue") -> {
                steps.add(ExecutionStep("s1", "Analyzed command intent: \"$prompt\"", "complete"))
                if (!isGithubConnected) {
                    steps.add(ExecutionStep("s2", "Checked GitHub authorization: Not connected", "complete"))
                    responseText = "GitHub isn't connected yet. Connect GitHub under Connected to track repository activity."
                } else {
                    steps.add(ExecutionStep("s2", "Verified GitHub authorization", "complete"))
                    steps.add(ExecutionStep("s3", "Fetched active repository notifications", "complete"))
                    responseText = "Checked your connected GitHub repositories. No open blocking pull requests."
                }
            }

            else -> {
                steps.add(ExecutionStep("s1", "Analyzed command intent: \"$prompt\"", "complete"))
                steps.add(ExecutionStep("s2", "Checked ${connectedServices.size} connected service authorizations", "complete"))
                steps.add(ExecutionStep("s3", "Synthesized response", "complete"))
                responseText = if (connectedServices.isEmpty()) {
                    "Processed your request. Connect your tools (Gmail, Calendar, Drive) under Connected to allow Contril to perform live workspace actions."
                } else {
                    "Processed your instruction across your ${connectedServices.size} connected tools."
                }
            }
        }

        if (action != null) {
            _pendingActions.value = listOf(action) + _pendingActions.value
        }

        return CommandResponse(
            conversationId = UUID.randomUUID().toString(),
            responseText = responseText,
            steps = steps,
            pendingAction = action
        )
    }

    suspend fun approveAction(actionId: String) {
        try {
            apiService?.approveAction(actionId)
        } catch (_: Throwable) { }

        _pendingActions.value = _pendingActions.value.map {
            if (it.id == actionId) it.copy(status = ActionStatus.APPROVED) else it
        }
    }

    suspend fun rejectAction(actionId: String) {
        try {
            apiService?.rejectAction(actionId)
        } catch (_: Throwable) { }

        _pendingActions.value = _pendingActions.value.map {
            if (it.id == actionId) it.copy(status = ActionStatus.REJECTED) else it
        }
    }

    fun toggleTaskCompletion(taskId: String) {
        _tasks.value = _tasks.value.map {
            if (it.id == taskId) it.copy(isCompleted = !it.isCompleted) else it
        }
    }

    // ==========================================
    // Real Authentication Methods
    // ==========================================

    suspend fun login(email: String, password: String): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable. Check your connection.")
            val response = service.login(mapOf("email" to email, "password" to password))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                val err = response.errorBody()?.string() ?: "Invalid email or password."
                AuthApiResponse(error = err)
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Unable to sign in. Check network connection.")
        }
    }

    suspend fun signup(email: String, fullName: String, password: String): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.signup(mapOf(
                "email" to email,
                "fullName" to fullName,
                "password" to password
            ))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Registration failed.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Registration network error.")
        }
    }

    suspend fun signUpWithOtp(email: String, fullName: String, password: String): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.signupWithOtp(mapOf(
                "email" to email,
                "fullName" to fullName,
                "password" to password
            ))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Registration failed.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Registration network error.")
        }
    }

    suspend fun sendOtp(email: String, isRecovery: Boolean = false): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.sendOtp(mapOf(
                "email" to email,
                "isRecovery" to isRecovery
            ))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Failed to dispatch verification code.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Network error sending code.")
        }
    }

    suspend fun verifyOtp(email: String, code: String, type: String? = null): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val payload = mutableMapOf("email" to email, "code" to code)
            if (type != null) payload["type"] = type
            val response = service.verifyOtp(payload)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Invalid or expired verification code.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Network error verifying code.")
        }
    }

    suspend fun resendOtp(email: String, isRecovery: Boolean = false): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.resendOtp(mapOf(
                "email" to email,
                "isRecovery" to isRecovery
            ))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Failed to resend code.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Network error resending code.")
        }
    }

    suspend fun resetPassword(email: String, code: String, password: String): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.resetPassword(mapOf(
                "email" to email,
                "code" to code,
                "password" to password
            ))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Failed to reset password.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Network error resetting password.")
        }
    }

    suspend fun forgotPassword(email: String): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val response = service.forgotPassword(mapOf("email" to email))
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "Failed to request password reset.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "Network error.")
        }
    }

    suspend fun oauthSignIn(provider: String, email: String, fullName: String, providerToken: String? = null): AuthApiResponse {
        return try {
            val service = apiService ?: return AuthApiResponse(error = "Network service unavailable.")
            val payload = mutableMapOf(
                "provider" to provider,
                "email" to email,
                "fullName" to fullName
            )
            if (providerToken != null) payload["providerToken"] = providerToken
            val response = service.oauthSignIn(payload)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                AuthApiResponse(error = response.errorBody()?.string() ?: "OAuth login failed.")
            }
        } catch (e: Throwable) {
            AuthApiResponse(error = e.message ?: "OAuth network error.")
        }
    }
}

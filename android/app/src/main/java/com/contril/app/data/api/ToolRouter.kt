package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.ExecutionStep
import com.contril.app.data.model.PendingAction
import com.contril.app.data.repository.CalendarRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.TaskRepository
import java.util.UUID

sealed class ToolExecutionResult {
    data class Success(val summary: String, val rawData: Any? = null, val pendingAction: PendingAction? = null) : ToolExecutionResult()
    data class RequiresConnection(val serviceName: String, val message: String) : ToolExecutionResult()
    data class Failure(val errorMessage: String) : ToolExecutionResult()
}

class ToolRouter(
    private val prefRepository: PreferenceRepository? = null,
    private val calendarRepository: CalendarRepository? = null,
    private val taskRepository: TaskRepository? = null,
    private val backendClient: ContrilBackendClient = ContrilBackendClient()
) {

    suspend fun evaluateAndExecute(prompt: String): Pair<List<ExecutionStep>, ToolExecutionResult?> {
        val lower = prompt.lowercase().trim()
        val steps = mutableListOf<ExecutionStep>()
        val connectedServices = prefRepository?.connectedServices?.value ?: emptyMap()

        val isGmailConnected = connectedServices.containsKey("gmail") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        val isCalendarConnected = connectedServices.containsKey("calendar") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        // 1. Explicit Gmail Inbox Inspection (Not drafting or creative writing)
        val isExplicitInboxCheck = (lower.contains("check email") || lower.contains("check my email") ||
                lower.contains("read email") || lower.contains("unread email") ||
                lower.contains("check inbox") || lower.contains("scan inbox") ||
                lower.contains("my emails") || lower.contains("recent emails")) &&
                !lower.contains("write") && !lower.contains("draft") && !lower.contains("compose") && !lower.contains("generate")

        if (isExplicitInboxCheck) {
            steps.add(ExecutionStep("t1", "Routed to Gmail Tool Engine", "complete"))
            if (!isGmailConnected) {
                steps.add(ExecutionStep("t2", "Checked Gmail Connection: Disconnected", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Gmail", "Connect Gmail in your Profile Hub to inspect emails.")
                )
            }

            val token = prefRepository?.userSessionToken?.value
            if (token.isNullOrBlank()) {
                return Pair(steps, ToolExecutionResult.Failure("Session expired. Please re-authenticate in Profile Hub."))
            }

            steps.add(ExecutionStep("t2", "Fetched live inbox threads", "complete"))
            val result = backendClient.fetchGmailInbox(token)
            return when (result) {
                is ApiResult.Success -> {
                    val count = result.data.size
                    val summary = if (count == 0) {
                        "Your Gmail inbox is clear. No unread priority messages."
                    } else {
                        "Found $count unread email threads in your connected Gmail."
                    }
                    Pair(steps, ToolExecutionResult.Success(summary, rawData = result.data))
                }
                is ApiResult.Error -> {
                    Pair(steps, ToolExecutionResult.Failure(result.message))
                }
            }
        }

        // 2. Explicit Google Calendar Inspection
        val isExplicitCalendarCheck = (lower.contains("check calendar") || lower.contains("my calendar") ||
                lower.contains("check meetings") || lower.contains("upcoming meetings") ||
                lower.contains("what's on my schedule") || lower.contains("schedule today") ||
                lower.contains("calendar today") || lower.contains("my agenda")) &&
                !lower.contains("explain") && !lower.contains("how to") && !lower.contains("strategy")

        if (isExplicitCalendarCheck) {
            steps.add(ExecutionStep("t1", "Routed to Google Calendar Engine", "complete"))
            if (!isCalendarConnected) {
                steps.add(ExecutionStep("t2", "Checked Calendar Connection: Disconnected", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Google Calendar", "Connect Google Calendar to inspect meetings.")
                )
            }

            val token = prefRepository?.userSessionToken?.value
            if (token.isNullOrBlank()) {
                return Pair(steps, ToolExecutionResult.Failure("Session expired. Please re-authenticate."))
            }

            steps.add(ExecutionStep("t2", "Queried upcoming schedule", "complete"))
            val result = backendClient.fetchCalendarEvents(token)
            return when (result) {
                is ApiResult.Success -> {
                    val count = result.data.size
                    val summary = if (count == 0) {
                        "Your calendar is clear for today."
                    } else {
                        "You have $count upcoming events scheduled."
                    }
                    Pair(steps, ToolExecutionResult.Success(summary, rawData = result.data))
                }
                is ApiResult.Error -> {
                    Pair(steps, ToolExecutionResult.Failure(result.message))
                }
            }
        }

        // 3. Explicit Local Task Creation & Inspection
        val isExplicitTaskAction = lower.startsWith("create task") || lower.startsWith("add task") ||
                lower.startsWith("new task") || lower.startsWith("remind me to") ||
                lower == "my tasks" || lower == "list tasks" || lower == "check tasks"

        if (isExplicitTaskAction) {
            steps.add(ExecutionStep("t1", "Routed to Native Task Manager", "complete"))
            if (lower.startsWith("create task") || lower.startsWith("add task") || lower.startsWith("new task") || lower.startsWith("remind me to")) {
                val taskTitle = prompt.replace(Regex("(?i)^(create task|add task|new task|remind me to|task:)\\s*"), "").trim().ifBlank { prompt }
                taskRepository?.addTask(title = taskTitle, category = "AI Action", serviceSource = "Contril")
                steps.add(ExecutionStep("t2", "Persisted task to local workspace", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.Success("Task created: \"$taskTitle\"")
                )
            } else {
                val count = taskRepository?.getPendingTaskCount() ?: 0
                steps.add(ExecutionStep("t2", "Queried pending tasks ($count active)", "complete"))
                val summary = if (count == 0) "You have no pending tasks." else "You have $count active tasks."
                return Pair(steps, ToolExecutionResult.Success(summary))
            }
        }

        // Default: Pure Universal Conversational AI via Gemini
        return Pair(emptyList(), null)
    }
}

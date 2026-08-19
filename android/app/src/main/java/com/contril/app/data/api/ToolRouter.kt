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

        // 0. Explicit Daily Briefing / Agenda Synthesis
        val isExplicitBriefing = lower.contains("briefing") || lower.contains("daily brief") ||
                lower.contains("morning brief") || lower.contains("today's brief") ||
                lower == "briefing" || lower == "what is my briefing" ||
                lower.contains("summarize my day") || lower.contains("today's agenda") ||
                lower.contains("what's on for today")

        if (isExplicitBriefing) {
            steps.add(ExecutionStep("b1", "Evaluating Executive Briefing Engine", "complete"))

            if (!isGmailConnected && !isCalendarConnected) {
                steps.add(ExecutionStep("b2", "Checked Workspace: Disconnected", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection(
                        "Google Workspace",
                        "Gmail and Google Calendar are not connected. Connect them in Profile Hub to view your real-time daily briefing."
                    )
                )
            }

            val token = prefRepository?.userSessionToken?.value
            if (token.isNullOrBlank()) {
                return Pair(steps, ToolExecutionResult.Failure("Session expired. Please re-authenticate Google Workspace in Profile Hub."))
            }

            steps.add(ExecutionStep("b2", "Fetching live inbox & calendar feeds", "complete"))

            val gmailResult = if (isGmailConnected) backendClient.fetchGmailInbox(token) else ApiResult.Success(emptyList())
            val calResult = if (isCalendarConnected) backendClient.fetchCalendarEvents(token) else ApiResult.Success(emptyList())
            val tasks = taskRepository?.tasks?.value?.filter { !it.isCompleted } ?: emptyList()

            val emails = (gmailResult as? ApiResult.Success)?.data ?: emptyList()
            val meetings = (calResult as? ApiResult.Success)?.data ?: emptyList()

            if (gmailResult is ApiResult.Error && calResult is ApiResult.Error) {
                return Pair(steps, ToolExecutionResult.Failure("Couldn't load briefing — check connection or re-authenticate in Profile Hub."))
            }

            if (emails.isEmpty() && meetings.isEmpty() && tasks.isEmpty()) {
                val cleanEmptyBriefing = "Today's Executive Briefing:\n\n• Inbox: Your connected Gmail inbox is clear. No unread priority threads.\n• Schedule: No meetings scheduled on your Google Calendar today.\n• Tasks: All focus tasks are completed."
                return Pair(steps, ToolExecutionResult.Success(cleanEmptyBriefing))
            }

            // Construct real grounded data
            val emailSummaryList = emails.take(5).map { "• From: ${it.sender}, Subject: \"${it.subject}\"" }.joinToString("\n")
            val meetingSummaryList = meetings.take(5).map { "• Meeting: \"${it.title}\" at ${it.timeRange}" }.joinToString("\n")
            val taskSummaryList = tasks.take(5).map { "• Task: \"${it.title}\" (${it.category})" }.joinToString("\n")

            val groundedPrompt = """
                You are Contril AI Chief of Staff generating "Today's Briefing" for the user.
                
                REAL CONNECTED USER DATA:
                Inbox Emails:
                ${if (emails.isEmpty()) "• No unread emails in inbox." else emailSummaryList}
                
                Calendar Meetings:
                ${if (meetings.isEmpty()) "• No upcoming meetings scheduled today." else meetingSummaryList}
                
                Active Tasks:
                ${if (tasks.isEmpty()) "• No pending tasks." else taskSummaryList}
                
                STRICT GROUNDING DIRECTIVES:
                1. Base your briefing EXCLUSIVELY and ENTIRELY on the real emails, calendar meetings, and tasks provided above.
                2. CRITICAL SAFEGUARD: NEVER invent, assume, or hallucinate any person, company, meeting, or document not present in the data above. Specifically DO NOT mention Sarah Jenkins, Marcus Vance, Apex Holdings, or any fictional deliverables.
                3. If there are real emails, summarize each real email by its actual sender and subject.
                4. If there are no calendar meetings, explicitly state "No meetings scheduled today".
                5. Output clean, elegant text with clean bullet points (•) and no markdown symbol clutter.
            """.trimIndent()

            val aiResult = GeminiClient.generateContent(groundedPrompt)
            val briefingText = aiResult.getOrNull() ?: run {
                val sb = StringBuilder("Today's Executive Briefing:\n\n")
                if (emails.isNotEmpty()) {
                    sb.append("Priority Emails (${emails.size}):\n")
                    emails.take(3).forEach { sb.append("• From ${it.sender}: \"${it.subject}\"\n") }
                    sb.append("\n")
                } else {
                    sb.append("• Inbox: No unread priority messages.\n")
                }
                if (meetings.isNotEmpty()) {
                    sb.append("Today's Schedule (${meetings.size}):\n")
                    meetings.take(3).forEach { sb.append("• \"${it.title}\" at ${it.timeRange}\n") }
                } else {
                    sb.append("• Schedule: No meetings scheduled today.\n")
                }
                sb.toString()
            }

            return Pair(steps, ToolExecutionResult.Success(GeminiClient.sanitizeCleanText(briefingText)))
        }

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

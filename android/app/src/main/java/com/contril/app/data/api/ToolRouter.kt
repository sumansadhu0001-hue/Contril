package com.contril.app.data.api

import com.contril.app.data.automation.IntentCategory
import com.contril.app.data.automation.QueryIntentClassifier
import com.contril.app.data.model.*
import com.contril.app.data.repository.CalendarRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.TaskRepository
import java.util.UUID

sealed class ToolExecutionResult {
    data class Success(
        val summary: String,
        val rawData: Any? = null,
        val pendingAction: PendingAction? = null,
        val proposedPlan: AgenticExecutionPlan? = null
    ) : ToolExecutionResult()
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
        val steps = mutableListOf<ExecutionStep>()
        val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
        val connectedServices = prefRepository?.connectedServices?.value ?: emptyMap()

        val isGmailConnected = !providerToken.isNullOrBlank() ||
                connectedServices.containsKey("gmail") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        val isCalendarConnected = !providerToken.isNullOrBlank() ||
                connectedServices.containsKey("calendar") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        steps.add(ExecutionStep("nlu1", "Understanding request intent with Gemini", "complete"))
        val decision = QueryIntentClassifier.classifyAndRouteWithAi(prompt)

        // 1. Ambiguous Input -> Transparent, Honest Clarification
        if (decision.category == IntentCategory.AMBIGUOUS) {
            val clarify = decision.clarificationMessage ?: "I'm not sure what you're asking — could you clarify whether you'd like to search prices, manage your emails, or check your schedule?"
            steps.add(ExecutionStep("nlu2", "Requested intent clarification", "complete"))
            return Pair(steps, ToolExecutionResult.Success(clarify))
        }

        // 2. Price Comparison Intent -> Create Ray-style Execution Plan
        if (decision.category in listOf(IntentCategory.ECOMMERCE, IntentCategory.FOOD_DELIVERY, IntentCategory.FASHION_BEAUTY, IntentCategory.GROCERY_QUICK_COMMERCE)) {
            steps.add(ExecutionStep("shop1", "Identified ${decision.category.name.lowercase().replace('_', ' ')} query", "complete"))
            if (!decision.isComparisonSupported) {
                return Pair(steps, ToolExecutionResult.Success(decision.unsupportedMessage ?: "Comparison not supported for this category."))
            }

            val targetPlatforms = decision.targetScraperIds
            val planItems = targetPlatforms.map { platform ->
                PlanItem(
                    id = "scrape_$platform",
                    title = "Search on ${platform.replaceFirstChar { it.uppercase() }}",
                    subtitle = "Query: \"${decision.cleanedSearchTerm}\"${decision.budget?.let { " (Budget: ≤ ₹${it.toInt()})" } ?: ""}",
                    sourceData = platform,
                    isSelected = true
                )
            }

            val plan = AgenticExecutionPlan(
                title = "Price Comparison Plan: ${decision.cleanedSearchTerm}",
                description = "Contril will search and rank deals across ${targetPlatforms.joinToString(", ") { it.replaceFirstChar { c -> c.uppercase() } }}.",
                actionType = PlanActionType.PRICE_COMPARISON,
                items = planItems,
                status = PlanStatus.PROPOSED
            )

            steps.add(ExecutionStep("shop2", "Prepared comparison plan across ${targetPlatforms.size} platforms", "complete"))
            return Pair(
                steps,
                ToolExecutionResult.Success(
                    summary = "Proposed plan to compare prices for \"${decision.cleanedSearchTerm}\".",
                    proposedPlan = plan
                )
            )
        }

        // 3. Daily Briefing / Agenda Synthesis
        if (decision.category == IntentCategory.BRIEFING) {
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

            steps.add(ExecutionStep("b2", "Fetching live inbox & calendar feeds", "complete"))
            val emails = if (isGmailConnected && !providerToken.isNullOrBlank()) {
                val (liveEmails, _) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 10)
                liveEmails
            } else if (isGmailConnected && !prefRepository?.userSessionToken?.value.isNullOrBlank()) {
                ContrilBackendClient.fetchDirectGmailMessages(prefRepository!!.userSessionToken.value!!)
            } else {
                emptyList()
            }

            val calResult = if (isCalendarConnected) (calendarRepository?.refreshCalendar() ?: ApiResult.Success(emptyList())) else ApiResult.Success(emptyList())
            val tasks = taskRepository?.tasks?.value?.filter { !it.isCompleted } ?: emptyList()

            val meetings = (calResult as? ApiResult.Success)?.data ?: emptyList()

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
                2. CRITICAL SAFEGUARD: NEVER invent, assume, or hallucinate any person, company, meeting, or document not present in the data above.
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

        // 4. Email Communication Intent -> Live Inbox Fetch & Grounded Response / Execution Plan
        val lowerPrompt = prompt.lowercase()
        val isEmailQuery = decision.category == IntentCategory.EMAIL_COMMUNICATION ||
                lowerPrompt.contains("email") ||
                lowerPrompt.contains("inbox") ||
                lowerPrompt.contains("unread") ||
                lowerPrompt.contains("mail") ||
                lowerPrompt.contains("message")

        if (isEmailQuery) {
            steps.add(ExecutionStep("e1", "Routed to Gmail Engine", "complete"))
            if (!isGmailConnected) {
                steps.add(ExecutionStep("e2", "Checked Gmail Connection: Disconnected", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Gmail", "Connect Gmail in your Profile Hub to inspect and manage emails.")
                )
            }

            steps.add(ExecutionStep("e2", "Fetching live inbox threads directly from Gmail", "complete"))
            val emails = if (!providerToken.isNullOrBlank()) {
                val (liveEmails, _) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 10)
                liveEmails
            } else if (!prefRepository?.userSessionToken?.value.isNullOrBlank()) {
                ContrilBackendClient.fetchDirectGmailMessages(prefRepository!!.userSessionToken.value!!)
            } else {
                emptyList()
            }

            if (emails.isEmpty()) {
                return Pair(steps, ToolExecutionResult.Success("Your connected Gmail inbox is clear. No unread priority messages."))
            }

            // Check if user is asking for a summary / reading emails vs requesting an action (delete, clean, reply)
            val isActionRequest = decision.proposedAction == "TRASH_EMAILS" ||
                    decision.proposedAction == "SEND_DRAFT" ||
                    lowerPrompt.contains("delete") ||
                    lowerPrompt.contains("clean") ||
                    lowerPrompt.contains("trash") ||
                    lowerPrompt.contains("reply to") ||
                    lowerPrompt.contains("send email")

            if (!isActionRequest) {
                // Return live truthful grounded summary
                val emailItemsText = emails.take(5).mapIndexed { idx, em ->
                    "${idx + 1}. From: ${em.sender}\n   Subject: \"${em.subject}\"\n   Snippet: \"${em.summarySnippet.take(150)}\""
                }.joinToString("\n\n")

                val summaryPrompt = """
                    User asked: "$prompt"
                    
                    REAL UNREAD EMAILS FROM CONNECTED GMAIL INBOX:
                    $emailItemsText
                    
                    Respond naturally and accurately summarizing the user's real unread emails above.
                    DO NOT hallucinate any emails not in the list. Output clean, elegant text with bullet points (•).
                """.trimIndent()

                val summaryResult = GeminiClient.generateContent(summaryPrompt).getOrNull()
                val finalSummary = summaryResult ?: ("Here is a summary of your unread emails:\n\n" + emails.take(5).joinToString("\n\n") { "• From ${it.sender}: \"${it.subject}\"\n  ${it.summarySnippet.take(120)}" })
                return Pair(steps, ToolExecutionResult.Success(GeminiClient.sanitizeCleanText(finalSummary), rawData = emails))
            } else {
                val isTrash = decision.proposedAction == "TRASH_EMAILS" || lowerPrompt.contains("delete") || lowerPrompt.contains("clean") || lowerPrompt.contains("trash")
                val planItems = emails.take(10).map { em ->
                    PlanItem(
                        id = em.id,
                        title = em.sender,
                        subtitle = em.subject,
                        sourceData = em.summarySnippet,
                        isSelected = true,
                        isDestructive = isTrash
                    )
                }

                val actionType = if (isTrash) PlanActionType.EMAIL_BULK_ACTION else PlanActionType.EMAIL_DRAFT_REPLY
                val plan = AgenticExecutionPlan(
                    title = if (isTrash) "Email Cleanup Plan (${planItems.size} threads)" else "Email Follow-up Plan (${planItems.size} threads)",
                    description = if (isTrash) "Review and select messages to move to Trash (30-day recovery)." else "Review and select incoming messages for AI draft replies.",
                    actionType = actionType,
                    items = planItems,
                    status = PlanStatus.PROPOSED,
                    canUndo = isTrash,
                    requiresTypedConfirmation = isTrash && planItems.size > 5
                )

                steps.add(ExecutionStep("e3", "Constructed interactive plan with ${planItems.size} items", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.Success(
                        summary = "Found ${emails.size} relevant email threads in your connected Gmail.",
                        rawData = emails,
                        proposedPlan = plan
                    )
                )
            }
        }

        // 5. Calendar Schedule Intent
        if (decision.category == IntentCategory.CALENDAR_SCHEDULE) {
            steps.add(ExecutionStep("c1", "Routed to Google Calendar Engine", "complete"))
            if (!isCalendarConnected) {
                steps.add(ExecutionStep("c2", "Checked Calendar Connection: Disconnected", "complete"))
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Google Calendar", "Connect Google Calendar to inspect meetings.")
                )
            }

            steps.add(ExecutionStep("c2", "Queried upcoming schedule", "complete"))
            val result = calendarRepository?.refreshCalendar() ?: ApiResult.Success(emptyList())
            return when (result) {
                is ApiResult.Success<List<MeetingItem>> -> {
                    val count = result.data.size
                    val summary = if (count == 0) {
                        "Your calendar is clear for today."
                    } else {
                        "You have $count upcoming events scheduled:\n" +
                                result.data.take(5).joinToString("\n") { "• \"${it.title}\" at ${it.timeRange}" }
                    }
                    Pair(steps, ToolExecutionResult.Success(summary, rawData = result.data))
                }
                is ApiResult.Error -> {
                    Pair(steps, ToolExecutionResult.Failure(result.message))
                }
            }
        }

        // 6. Task Management Intent
        if (decision.category == IntentCategory.TASK_MANAGEMENT) {
            steps.add(ExecutionStep("t1", "Routed to Native Task Manager", "complete"))
            if (decision.proposedAction == "CREATE_TASK" || prompt.startsWith("create", ignoreCase = true) || prompt.startsWith("add", ignoreCase = true) || prompt.startsWith("remind", ignoreCase = true)) {
                val taskTitle = decision.cleanedSearchTerm.ifBlank { prompt }
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

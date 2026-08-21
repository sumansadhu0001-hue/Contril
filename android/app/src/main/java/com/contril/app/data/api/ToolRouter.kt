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
        val proposedPlan: AgenticExecutionPlan? = null,
        val tokensUsed: Int = 0
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

    suspend fun evaluateAndExecute(
        prompt: String,
        passedServices: Map<String, String> = emptyMap()
    ): Pair<List<ExecutionStep>, ToolExecutionResult?> {
        val steps = emptyList<ExecutionStep>()
        val providerToken = ContrilBackendClient.getFreshGoogleToken(prefRepository)
        val prefConnected = prefRepository?.connectedServices?.value ?: emptyMap()
        val connectedServices = if (prefConnected.isNotEmpty()) prefConnected else passedServices

        val isGmailConnected = prefRepository?.isGmailConnected() == true ||
                !providerToken.isNullOrBlank() ||
                connectedServices.containsKey("gmail") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        val isCalendarConnected = prefRepository?.isCalendarConnected() == true ||
                !providerToken.isNullOrBlank() ||
                connectedServices.containsKey("calendar") ||
                connectedServices.containsKey("google_workspace") ||
                connectedServices.containsKey("google")

        val decision = QueryIntentClassifier.classifyAndRoute(prompt)

        // 0. Connection Management Commands (e.g. "connect gmail", "disconnect gmail")
        if (decision.category == IntentCategory.CONNECT_SERVICE) {
            val isTargetGmail = decision.targetService == "Gmail"
            val isConnected = if (isTargetGmail) isGmailConnected else isCalendarConnected
            val serviceName = decision.targetService ?: "Google Workspace"

            if (isConnected) {
                return Pair(steps, ToolExecutionResult.Success("$serviceName is already connected to your Contril account."))
            } else {
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection(
                        serviceName,
                        "Connect your Google account to let Contril securely search, summarize, and manage your $serviceName."
                    )
                )
            }
        }

        if (decision.category == IntentCategory.DISCONNECT_SERVICE) {
            prefRepository?.disconnectGoogleWorkspace()
            return Pair(
                steps,
                ToolExecutionResult.Success("Google Workspace has been disconnected. Contril will no longer access your Gmail or Google Calendar.")
            )
        }

        // 1. Explicitly Unsupported Service (YouTube, Spotify, WhatsApp, Zomato, Swiggy, MakeMyTrip)
        if (decision.category == IntentCategory.UNSUPPORTED_SERVICE) {
            val msg = decision.unsupportedMessage ?: "This service is not connected to Contril. Contril supports Gmail, Google Calendar, and Task management."
            return Pair(steps, ToolExecutionResult.Success(msg))
        }

        // 2. Email Drafting / Composition Request (Explicitly DO NOT search inbox)
        if (decision.category == IntentCategory.EMAIL_COMMUNICATION && decision.isDraftRequest) {
            val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
            val targetEmail = emailRegex.find(prompt)?.value ?: "Recipient"

            val draftPrompt = """
                User wants to draft an email: "$prompt"
                
                Generate a polite, crisp, executive email draft with:
                Subject: <Clear Subject>
                
                Hi <Name/Recipient>,
                
                <Message Body>
                
                Best,
                Suman
            """.trimIndent()

            val aiResponse = ContrilAiGatewayClient.generateAiResponse(
                prompt = draftPrompt,
                connectedServices = connectedServices,
                prefRepository = prefRepository
            )

            val pendingAction = PendingAction(
                id = "act_send_${UUID.randomUUID().toString().take(6)}",
                title = "Send Email to $targetEmail",
                description = aiResponse.responseText.take(300),
                targetService = "Gmail",
                consequenceLevel = "high",
                status = ActionStatus.PENDING_APPROVAL
            )

            return Pair(
                steps,
                ToolExecutionResult.Success(
                    summary = aiResponse.responseText,
                    pendingAction = pendingAction,
                    tokensUsed = aiResponse.tokensUsed
                )
            )
        }

        // 3. Email Inbox Search / Read Request
        if (decision.category == IntentCategory.EMAIL_COMMUNICATION) {
            if (!isGmailConnected) {
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Gmail", "Your Gmail isn't connected yet. Connect it from Profile to let me check your emails.")
                )
            }

            val emails = if (!providerToken.isNullOrBlank()) {
                val (liveEmails, _) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 15)
                liveEmails
            } else if (!prefRepository?.userSessionToken?.value.isNullOrBlank()) {
                ContrilBackendClient.fetchDirectGmailMessages(prefRepository!!.userSessionToken.value!!)
            } else {
                emptyList()
            }

            val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
            val queriedAddress = emailRegex.find(prompt)?.value

            // Filter if user searched for a specific sender
            val filteredEmails = if (queriedAddress != null) {
                emails.filter { it.sender.contains(queriedAddress, ignoreCase = true) || it.subject.contains(queriedAddress, ignoreCase = true) || it.summarySnippet.contains(queriedAddress, ignoreCase = true) }
            } else {
                emails
            }

            if (filteredEmails.isEmpty()) {
                val notFoundMsg = if (queriedAddress != null) {
                    "No emails found from $queriedAddress in your connected Gmail inbox."
                } else {
                    "Your connected Gmail inbox is clear. No unread priority messages."
                }
                return Pair(steps, ToolExecutionResult.Success(notFoundMsg))
            }

            val emailItemsText = filteredEmails.take(5).mapIndexed { idx, em ->
                "${idx + 1}. From: ${em.sender}\n   Subject: \"${em.subject}\"\n   Snippet: \"${em.summarySnippet.take(150)}\""
            }.joinToString("\n\n")

            val summaryPrompt = """
                User asked: "$prompt"
                
                REAL EMAILS FROM GMAIL:
                $emailItemsText
                
                Respond concisely and accurately summarizing these emails. DO NOT hallucinate any details.
            """.trimIndent()

            val summaryResult = ContrilAiGatewayClient.generateAiResponse(
                prompt = summaryPrompt,
                connectedServices = connectedServices,
                prefRepository = prefRepository
            )

            val finalSummary = if (summaryResult.responseText.isNotBlank() && !summaryResult.responseText.contains("couldn't reach")) {
                summaryResult.responseText
            } else {
                "Here is what I found in your connected Gmail:\n\n" + filteredEmails.take(5).joinToString("\n\n") { "• From ${it.sender}: \"${it.subject}\"\n  ${it.summarySnippet.take(120)}" }
            }

            return Pair(
                steps,
                ToolExecutionResult.Success(
                    summary = ContrilAiGatewayClient.sanitizeCleanText(finalSummary),
                    rawData = filteredEmails,
                    tokensUsed = summaryResult.tokensUsed
                )
            )
        }

        // 4. Daily Briefing / Agenda Synthesis
        if (decision.category == IntentCategory.BRIEFING) {
            if (!isGmailConnected && !isCalendarConnected) {
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection(
                        "Google Workspace",
                        "Gmail and Google Calendar are not connected. Connect them in Profile to let me check your schedule and emails."
                    )
                )
            }

            val emails = if (isGmailConnected && !providerToken.isNullOrBlank()) {
                val (liveEmails, _) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 10)
                liveEmails
            } else if (isGmailConnected && !prefRepository?.userSessionToken?.value.isNullOrBlank()) {
                ContrilBackendClient.fetchDirectGmailMessages(prefRepository!!.userSessionToken.value!!)
            } else {
                emptyList()
            }

            val calResult = if (isCalendarConnected) (calendarRepository?.refreshCalendar() ?: ApiResult.Success(emptyList())) else ApiResult.Success(emptyList())
            val meetings = if (calResult is ApiResult.Success) calResult.data else emptyList()

            val emailSummary = if (emails.isNotEmpty()) {
                emails.take(5).mapIndexed { idx, em ->
                    "${idx + 1}. From: ${em.sender} | Subject: \"${em.subject}\" | Snippet: \"${em.summarySnippet.take(120)}\""
                }.joinToString("\n")
            } else {
                "No unread priority emails in connected Gmail."
            }

            val scheduleSummary = if (meetings.isNotEmpty()) {
                meetings.take(5).mapIndexed { idx, m ->
                    "${idx + 1}. \"${m.title}\" at ${m.timeRange} (Attendees: ${m.attendees.size})"
                }.joinToString("\n")
            } else {
                "No meetings scheduled on your Google Calendar today."
            }

            val groundedPrompt = """
                User asked for today's briefing.
                
                REAL LIVE WORKSPACE DATA:
                EMAILS:
                $emailSummary
                
                SCHEDULE:
                $scheduleSummary
                
                Synthesize a crisp, elegant executive briefing using ONLY the real data above.
                Output clean bullet points (•) without markdown asterisks clutter.
            """.trimIndent()

            val aiResult = ContrilAiGatewayClient.generateAiResponse(
                prompt = groundedPrompt,
                connectedServices = connectedServices,
                prefRepository = prefRepository
            )

            val briefingText = if (aiResult.responseText.isNotBlank() && !aiResult.responseText.contains("couldn't reach")) {
                aiResult.responseText
            } else {
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

            return Pair(
                steps,
                ToolExecutionResult.Success(
                    summary = ContrilAiGatewayClient.sanitizeCleanText(briefingText),
                    tokensUsed = aiResult.tokensUsed
                )
            )
        }

        // 5. Calendar Schedule (Query or Schedule)
        if (decision.category == IntentCategory.CALENDAR_SCHEDULE) {
            if (!isCalendarConnected) {
                return Pair(
                    steps,
                    ToolExecutionResult.RequiresConnection("Google Calendar", "Your Google Calendar isn't connected yet. Connect it from Profile to let me check your schedule.")
                )
            }

            val calResult = calendarRepository?.refreshCalendar() ?: ApiResult.Success(emptyList())
            val meetings = if (calResult is ApiResult.Success) calResult.data else emptyList()

            if (!decision.isActionRequest) {
                if (meetings.isEmpty()) {
                    return Pair(steps, ToolExecutionResult.Success("You have no meetings scheduled on your Google Calendar today."))
                }

                val eventsText = meetings.take(5).mapIndexed { idx, m ->
                    "${idx + 1}. \"${m.title}\" at ${m.timeRange}"
                }.joinToString("\n")

                val calPrompt = """
                    User asked: "$prompt"
                    
                    REAL CALENDAR EVENTS TODAY:
                    $eventsText
                    
                    Provide a clean, concise schedule summary.
                """.trimIndent()

                val summaryResult = ContrilAiGatewayClient.generateAiResponse(
                    prompt = calPrompt,
                    connectedServices = connectedServices,
                    prefRepository = prefRepository
                )

                val finalSummary = if (summaryResult.responseText.isNotBlank() && !summaryResult.responseText.contains("couldn't reach")) {
                    summaryResult.responseText
                } else {
                    "Here is your schedule for today:\n\n" + meetings.take(5).joinToString("\n") { "• \"${it.title}\" at ${it.timeRange}" }
                }

                return Pair(
                    steps,
                    ToolExecutionResult.Success(
                        summary = ContrilAiGatewayClient.sanitizeCleanText(finalSummary),
                        rawData = meetings,
                        tokensUsed = summaryResult.tokensUsed
                    )
                )
            }
        }

        // 6. Tasks Management
        if (decision.category == IntentCategory.TASK_MANAGEMENT) {
            val lower = prompt.lowercase()
            if (lower.startsWith("add task") || lower.startsWith("create task") || lower.startsWith("new task")) {
                val taskTitle = prompt.replace(Regex("^(add task|create task|new task):?\\s*", RegexOption.IGNORE_CASE), "").trim()
                if (taskTitle.isNotBlank()) {
                    taskRepository?.addTask(title = taskTitle, category = "Focus", serviceSource = "Contril", dueDate = "Today")
                    return Pair(steps, ToolExecutionResult.Success("Task added: \"$taskTitle\"."))
                }
            } else {
                val count = taskRepository?.getPendingTaskCount() ?: 0
                val summary = if (count == 0) "You have no pending tasks." else "You have $count active tasks."
                return Pair(steps, ToolExecutionResult.Success(summary))
            }
        }

        // Default: Pure Universal Conversational AI via Contril AI Gateway
        return Pair(emptyList(), null)
    }
}

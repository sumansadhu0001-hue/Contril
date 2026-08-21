package com.contril.app.data.automation

enum class IntentCategory {
    CONNECT_SERVICE,
    DISCONNECT_SERVICE,
    EMAIL_COMMUNICATION,
    CALENDAR_SCHEDULE,
    BRIEFING,
    TASK_MANAGEMENT,
    GENERAL_ASSISTANT,
    UNSUPPORTED_SERVICE
}

data class QueryRoutingDecision(
    val rawQuery: String,
    val category: IntentCategory,
    val isActionRequest: Boolean = false,
    val isDraftRequest: Boolean = false,
    val targetService: String? = null,
    val unsupportedMessage: String? = null
)

object QueryIntentClassifier {

    fun classifyAndRoute(prompt: String): QueryRoutingDecision {
        val lower = prompt.lowercase().trim()

        // 1. Connection / OAuth Management Commands
        if (lower.startsWith("connect gmail") || lower.startsWith("connect google") || lower.startsWith("connect workspace") || lower.startsWith("connect calendar")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.CONNECT_SERVICE,
                targetService = if (lower.contains("calendar")) "Google Calendar" else "Gmail"
            )
        }

        if (lower.startsWith("disconnect gmail") || lower.startsWith("disconnect google") || lower.startsWith("disconnect workspace") || lower.startsWith("disconnect calendar")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.DISCONNECT_SERVICE,
                targetService = if (lower.contains("calendar")) "Google Calendar" else "Gmail"
            )
        }

        // 2. YouTube & Unsupported Apps
        if (lower.contains("youtube")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.UNSUPPORTED_SERVICE,
                unsupportedMessage = "I can't open YouTube because YouTube isn't a connected Contril capability."
            )
        }

        if (lower.contains("spotify") || lower.contains("whatsapp") || lower.contains("instagram")) {
            val app = if (lower.contains("spotify")) "Spotify" else if (lower.contains("whatsapp")) "WhatsApp" else "Instagram"
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.UNSUPPORTED_SERVICE,
                unsupportedMessage = "I can't perform actions on $app because $app isn't a connected Contril capability."
            )
        }

        // 3. Unsupported food / travel / shopping services
        if (lower.contains("zomato") || lower.contains("swiggy") || lower.contains("food delivery") || lower.contains("order food") || lower.contains("order biryani") || lower.contains("order pizza")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.UNSUPPORTED_SERVICE,
                unsupportedMessage = "I can't place food delivery orders because food delivery services (Zomato/Swiggy) are not connected to Contril. I currently support Gmail, Google Calendar, and Task management."
            )
        }

        if (lower.contains("makemytrip") || lower.contains("book flight") || lower.contains("book hotel") || lower.contains("flight ticket") || lower.contains("airbnb")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.UNSUPPORTED_SERVICE,
                unsupportedMessage = "I can't book flights or hotels because travel booking services are not connected to Contril. I currently support Gmail, Google Calendar, and Task management."
            )
        }

        // 4. Email Communication (Drafting vs Searching)
        val isDraftOrSend = lower.startsWith("write ") ||
                lower.startsWith("draft ") ||
                lower.startsWith("compose ") ||
                lower.startsWith("send email") ||
                lower.startsWith("send an email") ||
                lower.startsWith("send mail") ||
                lower.startsWith("email ") ||
                lower.contains("write an email") ||
                lower.contains("write a greeting email") ||
                lower.contains("draft an email") ||
                lower.contains("draft a reply")

        val isEmailSearch = lower.startsWith("find ") ||
                lower.startsWith("search ") ||
                lower.startsWith("check ") ||
                lower.startsWith("read ") ||
                lower.startsWith("show ") ||
                lower.startsWith("list ") ||
                lower.contains("any email from") ||
                lower.contains("unread email") ||
                lower.contains("inbox")

        if (isDraftOrSend && !isEmailSearch) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.EMAIL_COMMUNICATION,
                isActionRequest = true,
                isDraftRequest = true,
                targetService = "Gmail"
            )
        }

        if (isEmailSearch || lower.contains("email") || lower.contains("mail")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.EMAIL_COMMUNICATION,
                isActionRequest = false,
                isDraftRequest = false,
                targetService = "Gmail"
            )
        }

        // 5. Calendar & Schedule
        val isCalendar = lower.contains("calendar") || lower.contains("schedule") || lower.contains("meeting") || lower.contains("agenda") || lower.contains("appointment")
        if (isCalendar) {
            val isAction = lower.startsWith("schedule ") || lower.startsWith("create meeting") || lower.startsWith("book meeting") || lower.contains("cancel meeting")
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.CALENDAR_SCHEDULE,
                isActionRequest = isAction,
                targetService = "Google Calendar"
            )
        }

        // 6. Briefing
        if (lower.contains("briefing") || lower.contains("summary of my day") || lower.contains("daily brief")) {
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.BRIEFING,
                targetService = "Workspace"
            )
        }

        // 7. Tasks
        if (lower.contains("task") || lower.contains("todo") || lower.contains("to-do") || lower.contains("action item")) {
            val isAction = lower.startsWith("add task") || lower.startsWith("create task") || lower.startsWith("complete task") || lower.startsWith("delete task")
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.TASK_MANAGEMENT,
                isActionRequest = isAction,
                targetService = "Tasks"
            )
        }

        // Default: General Executive Assistant
        return QueryRoutingDecision(
            rawQuery = prompt,
            category = IntentCategory.GENERAL_ASSISTANT
        )
    }
}

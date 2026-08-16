package com.contril.app.data.local

import com.contril.app.data.model.*

object DemoDataProvider {

    fun getSuggestedPrompts(): List<String> = listOf(
        "Summarize my unread emails.",
        "Find tomorrow's meetings and prepare a briefing.",
        "Search my Drive for the latest project proposal.",
        "Show me the important messages from today.",
        "Find the latest GitHub activity.",
        "Check for scheduling conflicts tomorrow afternoon."
    )

    fun getInitialPriorities(): List<PriorityItem> = listOf(
        PriorityItem(
            id = "p1",
            title = "Client Follow-up Email",
            description = "Response drafted to partner regarding deliverables timeline.",
            serviceTag = "Gmail",
            timeLabel = "9:30 AM",
            isUrgent = true,
            pendingActionId = "act_101"
        ),
        PriorityItem(
            id = "p2",
            title = "Team Strategy Sync",
            description = "Conflict detected at 2:00 PM with Board prep call.",
            serviceTag = "Calendar",
            timeLabel = "2:00 PM",
            isUrgent = true,
            pendingActionId = "act_102"
        ),
        PriorityItem(
            id = "p3",
            title = "Q3 Infrastructure Proposal",
            description = "Document updated with feedback and ready for review.",
            serviceTag = "Drive",
            timeLabel = "Yesterday",
            isUrgent = false,
            pendingActionId = null
        )
    )

    fun getInitialPendingActions(): List<PendingAction> = listOf(
        PendingAction(
            id = "act_101",
            title = "Send Follow-up Email",
            description = "Draft prepared: 'Thank you for the update. All deliverables are on track for Friday.'",
            targetService = "Gmail",
            consequenceLevel = "medium",
            status = ActionStatus.PENDING_APPROVAL
        ),
        PendingAction(
            id = "act_102",
            title = "Reschedule Strategy Sync",
            description = "Move meeting from 2:00 PM to 3:30 PM to clear conflicting Board prep call.",
            targetService = "Calendar",
            consequenceLevel = "high",
            status = ActionStatus.PENDING_APPROVAL
        )
    )

    fun getInitialMeetings(): List<MeetingItem> = listOf(
        MeetingItem(
            id = "m1",
            title = "Morning Executive Sync",
            timeRange = "09:00 - 09:30 AM",
            attendees = listOf("Lead Architect", "Operations Director"),
            locationOrLink = "Google Meet",
            hasConflict = false,
            briefingReady = true
        ),
        MeetingItem(
            id = "m2",
            title = "Team Strategy Sync",
            timeRange = "02:00 - 03:00 PM",
            attendees = listOf("Product Team", "Engineering Leads"),
            locationOrLink = "Conference Room 3A",
            hasConflict = true,
            briefingReady = true
        ),
        MeetingItem(
            id = "m3",
            title = "Quarterly Roadmap Review",
            timeRange = "04:30 - 05:30 PM",
            attendees = listOf("Executive Team"),
            locationOrLink = "Google Meet",
            hasConflict = false,
            briefingReady = false
        )
    )

    fun getInitialTasks(): List<TaskItem> = listOf(
        TaskItem(
            id = "t1",
            title = "Review infrastructure budget allocation",
            category = "Finance",
            dueDate = "Today, 5:00 PM",
            isCompleted = false,
            serviceSource = "Drive"
        ),
        TaskItem(
            id = "t2",
            title = "Confirm agenda for quarterly partner review",
            category = "Meetings",
            dueDate = "Tomorrow, 10:00 AM",
            isCompleted = false,
            serviceSource = "Calendar"
        ),
        TaskItem(
            id = "t3",
            title = "Archive resolved security audit tickets",
            category = "Engineering",
            dueDate = "Friday",
            isCompleted = true,
            serviceSource = "GitHub"
        )
    )

    fun getInitialIntegrations(): List<IntegrationStatus> = listOf(
        IntegrationStatus(
            id = "gmail",
            name = "Gmail",
            description = "Email intelligence, unread summaries, and draft preparation",
            isConnected = true,
            lastSyncTime = "2 mins ago",
            iconKey = "mail"
        ),
        IntegrationStatus(
            id = "calendar",
            name = "Google Calendar",
            description = "Schedule conflict resolution and meeting briefings",
            isConnected = true,
            lastSyncTime = "5 mins ago",
            iconKey = "calendar"
        ),
        IntegrationStatus(
            id = "drive",
            name = "Google Drive",
            description = "Context extraction from indexed documents and proposals",
            isConnected = true,
            lastSyncTime = "15 mins ago",
            iconKey = "drive"
        ),
        IntegrationStatus(
            id = "outlook",
            name = "Outlook / Microsoft 365",
            description = "Enterprise email and meeting coordination",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "outlook"
        ),
        IntegrationStatus(
            id = "github",
            name = "GitHub",
            description = "Repository activity, pull request updates, and issues",
            isConnected = true,
            lastSyncTime = "1 hour ago",
            iconKey = "github"
        ),
        IntegrationStatus(
            id = "web",
            name = "Live Web Intelligence",
            description = "Real-time fact checking, market research, and verification",
            isConnected = true,
            lastSyncTime = "Live",
            iconKey = "web"
        )
    )
}

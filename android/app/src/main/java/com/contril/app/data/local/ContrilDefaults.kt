package com.contril.app.data.local

import com.contril.app.data.model.*

object ContrilDefaults {

    fun getSuggestedPrompts(): List<String> = listOf(
        "Connect my Google Workspace.",
        "Summarize my schedule for today.",
        "Check for urgent action items.",
        "Search my connected services."
    )

    fun getInitialPriorities(): List<PriorityItem> = emptyList()

    fun getInitialPendingActions(): List<PendingAction> = emptyList()

    fun getInitialMeetings(): List<MeetingItem> = emptyList()

    fun getInitialTasks(): List<TaskItem> = emptyList()

    fun getInitialIntegrations(): List<IntegrationStatus> = listOf(
        IntegrationStatus(
            id = "gmail",
            name = "Gmail",
            description = "Email intelligence, unread summaries, and draft preparation",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "mail"
        ),
        IntegrationStatus(
            id = "calendar",
            name = "Google Calendar",
            description = "Schedule conflict resolution and meeting briefings",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "calendar"
        ),
        IntegrationStatus(
            id = "drive",
            name = "Google Drive",
            description = "Context extraction from indexed documents and proposals",
            isConnected = false,
            lastSyncTime = "Not connected",
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
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "github"
        ),
        IntegrationStatus(
            id = "web",
            name = "Live Web Intelligence",
            description = "Real-time fact checking, market research, and verification",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "web"
        )
    )
}

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

    fun getConnectedGmailThreads(accountEmail: String): List<EmailSummary> = emptyList()

    fun getInitialIntegrations(): List<IntegrationStatus> = listOf(
        // Work & Communication
        IntegrationStatus(
            id = "gmail",
            name = "Gmail",
            description = "Email intelligence, unread summaries, and draft preparation",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "mail",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("gmail.search", "gmail.read", "gmail.send")
        ),
        IntegrationStatus(
            id = "calendar",
            name = "Google Calendar",
            description = "Schedule conflict resolution and meeting briefings",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "calendar",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("calendar.search", "calendar.create", "calendar.update")
        ),
        IntegrationStatus(
            id = "drive",
            name = "Google Drive",
            description = "Context extraction from indexed documents and proposals",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "drive",
            category = IntegrationCategory.PRODUCTIVITY,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("drive.search", "drive.read")
        ),
        IntegrationStatus(
            id = "outlook",
            name = "Outlook / Microsoft 365",
            description = "Enterprise email and meeting coordination",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "outlook",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("outlook.read", "outlook.send")
        ),
        IntegrationStatus(
            id = "github",
            name = "GitHub",
            description = "Repository activity, pull request updates, and issues",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "github",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("github.repos", "github.issues", "github.prs")
        ),
        IntegrationStatus(
            id = "notion",
            name = "Notion",
            description = "Workspace knowledge base and notes indexing",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "notion",
            category = IntegrationCategory.PRODUCTIVITY,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("notion.search", "notion.create")
        )
    )
}

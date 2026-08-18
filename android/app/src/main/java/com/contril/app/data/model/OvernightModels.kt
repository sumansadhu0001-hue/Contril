package com.contril.app.data.model

import java.util.UUID

enum class ActivityEventType {
    SCAN_STARTED,
    NO_NEW_EMAILS,
    EMAILS_SCANNED,
    MEETING_EXTRACTED,
    DEADLINE_EXTRACTED,
    DRAFT_CREATED,
    REPLY_AUTO_SENT,
    TOKEN_BUDGET_EXHAUSTED,
    SERVICE_STARTED,
    SERVICE_STOPPED
}

data class OvernightActivityLog(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: Long = System.currentTimeMillis(),
    val eventType: ActivityEventType,
    val title: String,
    val description: String,
    val emailSender: String? = null,
    val emailSubject: String? = null,
    val payloadSnippet: String? = null,
    val tokensConsumed: Int = 0
)

data class ExtractedEvent(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val dateOrDeadline: String,
    val sender: String,
    val sourceEmailId: String,
    val confidence: String, // "HIGH", "MEDIUM", "LOW"
    val timestamp: Long = System.currentTimeMillis()
)

data class OvernightServiceState(
    val isRunning: Boolean = false,
    val lastScanTime: Long = 0L,
    val tokensUsedTonight: Int = 0,
    val tokenBudgetMax: Int = 150, // Elite Plan 150 token budget reserved for overnight
    val unreadProcessedCount: Int = 0,
    val meetingsFoundCount: Int = 0,
    val draftsCreatedCount: Int = 0,
    val repliesAutoSentCount: Int = 0
)

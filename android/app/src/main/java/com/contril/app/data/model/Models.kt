package com.contril.app.data.model

import com.google.gson.annotations.SerializedName

enum class AutonomyMode {
    @SerializedName("always_ask")
    ALWAYS_ASK,

    @SerializedName("sensitive_only")
    SENSITIVE_ONLY,

    @SerializedName("auto_approve")
    AUTO_APPROVE
}

enum class ActionStatus {
    @SerializedName("pending_approval")
    PENDING_APPROVAL,

    @SerializedName("approved")
    APPROVED,

    @SerializedName("rejected")
    REJECTED,

    @SerializedName("executed")
    EXECUTED
}

data class CommandRequest(
    val prompt: String,
    val autonomyLevel: AutonomyMode = AutonomyMode.SENSITIVE_ONLY,
    val conversationId: String? = null
)

data class ExecutionStep(
    val id: String,
    val description: String,
    val status: String, // "complete", "in_progress", "pending"
    val timestamp: Long = System.currentTimeMillis()
)

data class CommandResponse(
    val conversationId: String,
    val responseText: String,
    val steps: List<ExecutionStep> = emptyList(),
    val pendingAction: PendingAction? = null
)

data class PendingAction(
    val id: String,
    val title: String,
    val description: String,
    val targetService: String, // "gmail", "calendar", "drive", "github"
    val consequenceLevel: String, // "high", "medium", "low"
    var status: ActionStatus = ActionStatus.PENDING_APPROVAL
)

data class PriorityItem(
    val id: String,
    val title: String,
    val description: String,
    val serviceTag: String,
    val timeLabel: String,
    val isUrgent: Boolean = false,
    val pendingActionId: String? = null
)

data class TaskItem(
    val id: String,
    val title: String,
    val category: String,
    val dueDate: String,
    val isCompleted: Boolean = false,
    val serviceSource: String = "Contril AI"
)

data class MeetingItem(
    val id: String,
    val title: String,
    val timeRange: String,
    val attendees: List<String>,
    val locationOrLink: String,
    val hasConflict: Boolean = false,
    val briefingReady: Boolean = true
)

data class EmailSummary(
    val id: String,
    val sender: String,
    val subject: String,
    val summarySnippet: String,
    val isUrgent: Boolean,
    val hasDraftReady: Boolean
)

data class IntegrationStatus(
    val id: String,
    val name: String,
    val description: String,
    val isConnected: Boolean,
    val lastSyncTime: String,
    val iconKey: String,
    val connectedAccount: String? = null,
    val scopes: List<String> = emptyList(),
    val isAlwaysAvailable: Boolean = false
)

data class UserProfile(
    val id: String = "",
    val email: String = "",
    val name: String = "",
    val avatarUrl: String? = null,
    val createdAt: String? = null
) {
    val initials: String
        get() {
            val parts = name.trim().split("\\s+".toRegex())
            return if (parts.size >= 2) {
                "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
            } else if (parts.isNotEmpty() && parts[0].isNotEmpty()) {
                parts[0].take(2).uppercase()
            } else if (email.isNotEmpty()) {
                email.take(2).uppercase()
            } else {
                "CO"
            }
        }
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val fullName: String,
    val password: String
)

data class OtpSendRequest(
    val email: String,
    val userId: String? = null,
    val isRecovery: Boolean = false
)

data class OtpVerifyRequest(
    val email: String,
    val code: String,
    val type: String? = null
)

data class ResetPasswordRequest(
    val email: String,
    val code: String,
    val password: String
)

data class AuthApiResponse(
    val success: Boolean = false,
    val message: String? = null,
    val error: String? = null,
    val token: String? = null,
    val user: UserProfile? = null
)


package com.contril.app.data.model

enum class SubscriptionStatus {
    FREE,
    PENDING_APPROVAL,
    ACTIVE_PRO,
    REJECTED,
    EXPIRED
}

data class EntitlementState(
    val status: SubscriptionStatus = SubscriptionStatus.FREE,
    val planName: String = "Free",
    val transactionRef: String? = null,
    val requestedAt: String? = null,
    val approvedAt: String? = null,
    val isPaidActive: Boolean = false
)

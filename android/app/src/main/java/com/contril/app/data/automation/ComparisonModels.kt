package com.contril.app.data.automation

import java.util.UUID

data class ProductListingItem(
    val id: String = UUID.randomUUID().toString(),
    val platformName: String,
    val platformPackage: String,
    val itemName: String,
    val restaurantOrVendor: String = "",
    val price: Double,
    val priceFormatted: String = "₹${price.toInt()}",
    val rating: String? = null,
    val eta: String? = null,
    val deepLinkUrl: String,
    val isBestValue: Boolean = false
)

enum class ScrapeFailureType {
    APP_NOT_INSTALLED,
    PERMISSION_DENIED,
    UI_DRIFT_NODES_NOT_FOUND,
    SEARCH_ZERO_RESULTS,
    TIMEOUT,
    APP_CRASHED_OR_CLOSED,
    NO_RELEVANT_LISTINGS
}

data class ScrapeFailure(
    val platformName: String,
    val failureType: ScrapeFailureType,
    val message: String,
    val isUiDrift: Boolean = false
)

data class AutomationAuditLog(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: String,
    val platformName: String,
    val searchQuery: String,
    val status: String,
    val resultSummary: String
)

data class ComparisonResult(
    val searchQuery: String,
    val maxPriceBudget: Double? = null,
    val rankedItems: List<ProductListingItem> = emptyList(),
    val failures: List<ScrapeFailure> = emptyList(),
    val timestamp: String = java.time.LocalTime.now().toString().take(5),
    val auditLog: AutomationAuditLog? = null
)

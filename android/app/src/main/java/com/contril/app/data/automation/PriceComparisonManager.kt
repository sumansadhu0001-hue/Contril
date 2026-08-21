package com.contril.app.data.automation

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class PriceComparisonManager(
    private val prefRepository: PreferenceRepository? = null,
    private val networkMonitor: com.contril.app.data.network.NetworkMonitor? = null,
    private val scrapers: List<PlatformScraper> = listOf(
        ZomatoAccessibilityScraper(),
        SwiggyAccessibilityScraper(),
        FlipkartAccessibilityScraper(),
        AmazonAccessibilityScraper(),
        MyntraAccessibilityScraper(),
        MeeshoAccessibilityScraper(),
        AjioAccessibilityScraper(),
        PurplleAccessibilityScraper()
    )
) {

    private val _isComparing = MutableStateFlow(false)
    val isComparing: StateFlow<Boolean> = _isComparing.asStateFlow()

    private val _statusText = MutableStateFlow<String?>(null)
    val statusText: StateFlow<String?> = _statusText.asStateFlow()

    private val _latestResult = MutableStateFlow<ComparisonResult?>(null)
    val latestResult: StateFlow<ComparisonResult?> = _latestResult.asStateFlow()

    private val _auditHistory = MutableStateFlow<List<AutomationAuditLog>>(emptyList())
    val auditHistory: StateFlow<List<AutomationAuditLog>> = _auditHistory.asStateFlow()

    fun isAccessibilityPermissionGranted(context: Context): Boolean {
        return ContrilAccessibilityService.isServiceEnabled(context)
    }

    fun openAccessibilitySettings(context: Context) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    suspend fun comparePricesAcrossPlatforms(
        context: Context,
        rawPrompt: String,
        routingDecision: QueryRoutingDecision? = null
    ): ComparisonResult {
        // Pre-check network state
        if (networkMonitor?.isOnline?.value == false) {
            _isComparing.value = false
            _statusText.value = "⚠️ Comparison unavailable — offline"
            val offlineResult = ComparisonResult(
                searchQuery = rawPrompt,
                rankedItems = emptyList(),
                failures = listOf(
                    ScrapeFailure(
                        platformName = "All Platforms",
                        failureType = ScrapeFailureType.TIMEOUT,
                        message = "Device is offline. Reconnect to search and compare prices."
                    )
                ),
                timestamp = LocalTime.now().format(DateTimeFormatter.ofPattern("h:mm a"))
            )
            _latestResult.value = offlineResult
            return offlineResult
        }

        _isComparing.value = true
        val searchTerm = rawPrompt.trim()
        val timestamp = LocalTime.now().format(DateTimeFormatter.ofPattern("h:mm a"))
        val collectedItems = mutableListOf<ProductListingItem>()
        val failures = mutableListOf<ScrapeFailure>()

        val result = ComparisonResult(
            searchQuery = searchTerm,
            maxPriceBudget = null,
            rankedItems = collectedItems,
            failures = failures,
            auditLog = AutomationAuditLog(
                timestamp = timestamp,
                platformName = "Contril Workspace",
                searchQuery = searchTerm,
                status = "Completed",
                resultSummary = "Search completed."
            )
        )

        _latestResult.value = result
        _isComparing.value = false
        _statusText.value = null

        return result
    }

    fun clearResult() {
        _latestResult.value = null
        _statusText.value = null
    }
}

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
    private val scrapers: List<PlatformScraper> = listOf(
        ZomatoAccessibilityScraper(),
        SwiggyAccessibilityScraper()
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
        _isComparing.value = true
        val decision = routingDecision ?: QueryIntentClassifier.classifyAndRoute(rawPrompt)

        val targetScrapers = if (decision.targetScraperIds.isNotEmpty()) {
            scrapers.filter { it.platformId in decision.targetScraperIds }
        } else {
            scrapers
        }

        val collectedItems = mutableListOf<ProductListingItem>()
        val failures = mutableListOf<ScrapeFailure>()
        val timestamp = LocalTime.now().format(DateTimeFormatter.ofPattern("h:mm a"))
        val searchTerm = decision.cleanedSearchTerm.ifBlank { rawPrompt.trim() }

        for (scraper in targetScrapers) {
            _statusText.value = "Checking ${scraper.platformName}..."
            val scrapeRes = scraper.executeScrape(context, searchTerm, decision.budget)

            when (scrapeRes) {
                is ScrapePlatformResult.Success -> {
                    collectedItems.addAll(scrapeRes.items)
                }
                is ScrapePlatformResult.Failure -> {
                    failures.add(scrapeRes.failure)
                }
            }
        }

        // Rank by price ascending
        val sortedItems = collectedItems.sortedBy { it.price }.mapIndexed { index, item ->
            if (index == 0) item.copy(isBestValue = true) else item
        }

        val platformsQueried = targetScrapers.joinToString(" & ") { it.platformName }
        val auditLog = AutomationAuditLog(
            timestamp = timestamp,
            platformName = platformsQueried,
            searchQuery = searchTerm,
            status = if (sortedItems.isNotEmpty()) "Completed" else "Partial/Failed",
            resultSummary = "Found ${sortedItems.size} listings (${failures.size} failure notices)"
        )

        val currentAudit = _auditHistory.value.toMutableList()
        currentAudit.add(0, auditLog)
        _auditHistory.value = currentAudit

        val result = ComparisonResult(
            searchQuery = searchTerm,
            maxPriceBudget = decision.budget,
            rankedItems = sortedItems,
            failures = failures,
            auditLog = auditLog
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

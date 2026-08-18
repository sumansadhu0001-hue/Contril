package com.contril.app.data.automation

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.net.URLEncoder

class ZomatoAccessibilityScraper : PlatformScraper {
    override val platformId: String = "zomato"
    override val platformName: String = "Zomato"
    override val targetPackage: String = "com.application.zomato"

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("zomato://search?q=$encoded")
    }

    override suspend fun executeScrape(
        context: Context,
        query: String,
        maxBudget: Double?
    ): ScrapePlatformResult = withContext(Dispatchers.IO) {
        if (!isAppInstalled(context)) {
            return@withContext ScrapePlatformResult.Failure(
                ScrapeFailure(
                    platformName = platformName,
                    failureType = ScrapeFailureType.APP_NOT_INSTALLED,
                    message = "Zomato is not installed on this device."
                )
            )
        }

        val service = ContrilAccessibilityService.instance
        if (service == null) {
            return@withContext ScrapePlatformResult.Failure(
                ScrapeFailure(
                    platformName = platformName,
                    failureType = ScrapeFailureType.PERMISSION_DENIED,
                    message = "Accessibility permission required to inspect Zomato search results."
                )
            )
        }

        // Launch search
        val launchIntent = createLaunchIntent(context, query)
        if (launchIntent != null) {
            context.startActivity(launchIntent)
        }

        // Poll for nodes with timeout
        val items = mutableListOf<ProductListingItem>()
        var elapsed = 0
        val timeoutMs = 4000

        while (elapsed < timeoutMs) {
            delay(600)
            elapsed += 600

            val nodeTexts = service.extractScreenNodes()
            val parsed = parseZomatoNodes(nodeTexts, query, maxBudget)
            if (parsed.isNotEmpty()) {
                items.addAll(parsed)
                break
            }
        }

        if (items.isNotEmpty()) {
            ScrapePlatformResult.Success(items.distinctBy { it.itemName })
        } else {
            ScrapePlatformResult.Failure(
                ScrapeFailure(
                    platformName = platformName,
                    failureType = ScrapeFailureType.SEARCH_ZERO_RESULTS,
                    message = "No matching items found within criteria on Zomato."
                )
            )
        }
    }

    private fun parseZomatoNodes(nodes: List<String>, query: String, maxBudget: Double?): List<ProductListingItem> {
        val results = mutableListOf<ProductListingItem>()
        val priceRegex = Regex("₹\\s*(\\d+)")
        val ratingRegex = Regex("([1-5]\\.\\d)\\s*★?")

        for (i in nodes.indices) {
            val text = nodes[i]
            val priceMatch = priceRegex.find(text)

            if (priceMatch != null) {
                val priceVal = priceMatch.groupValues[1].toDoubleOrNull() ?: continue
                if (maxBudget != null && priceVal > maxBudget) continue

                val rawTitle = if (i > 0 && nodes[i - 1].length in 4..60) nodes[i - 1] else ""
                if (!ProductRelevanceValidator.isRelevant(query, rawTitle)) continue

                val rating = nodes.subList(maxOf(0, i - 2), minOf(nodes.size, i + 3))
                    .mapNotNull { ratingRegex.find(it)?.groupValues?.get(1) }
                    .firstOrNull() ?: "4.2"

                results.add(
                    ProductListingItem(
                        platformName = platformName,
                        platformPackage = targetPackage,
                        itemName = rawTitle,
                        restaurantOrVendor = "Verified Restaurant",
                        price = priceVal,
                        rating = rating,
                        eta = "30-40 mins",
                        deepLinkUrl = getDeepLinkUri(query).toString()
                    )
                )
            }
        }
        return results
    }
}

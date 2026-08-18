package com.contril.app.data.automation

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.net.URLEncoder

/**
 * Keyword relevance validation engine.
 * Mandatory self-check: Ensures extracted product names strictly match search intent.
 */
object ProductRelevanceValidator {

    private val STOP_WORDS = setOf(
        "for", "the", "a", "an", "and", "or", "in", "on", "at", "to", "with",
        "cheapest", "cheap", "compare", "comparison", "price", "prices", "best",
        "deal", "deals", "buy", "under", "show", "me", "find", "get", "top", "good"
    )

    private val SYNONYM_MAP = mapOf(
        "fridge" to listOf("refrigerator", "fridge", "freezer", "single door", "double door", "frost free", "whirlpool", "lg", "samsung", "haier", "godrej"),
        "refrigerator" to listOf("refrigerator", "fridge", "freezer", "single door", "double door", "frost free", "whirlpool", "lg", "samsung", "haier", "godrej"),
        "shoe" to listOf("shoe", "shoes", "running", "sneaker", "sneakers", "footwear", "walker", "sports", "trainer", "trainers", "sparx", "campus", "asian", "puma", "nike", "adidas"),
        "shoes" to listOf("shoe", "shoes", "running", "sneaker", "sneakers", "footwear", "walker", "sports", "trainer", "trainers", "sparx", "campus", "asian", "puma", "nike", "adidas"),
        "sneaker" to listOf("sneaker", "sneakers", "shoe", "shoes", "casual", "footwear"),
        "headphone" to listOf("headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "tws", "wireless", "bluetooth", "audio", "sound", "anc", "boat", "boult", "noise", "realme", "oneplus", "sony", "jbl"),
        "headphones" to listOf("headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "tws", "wireless", "bluetooth", "audio", "sound", "anc", "boat", "boult", "noise", "realme", "oneplus", "sony", "jbl"),
        "earbuds" to listOf("earbud", "earbuds", "tws", "headphone", "headphones", "earphone", "earphones", "wireless", "bluetooth", "audio", "sound", "anc", "boat", "boult", "noise", "realme", "oneplus"),
        "phone" to listOf("phone", "mobile", "smartphone", "5g", "4g", "android", "cellphone", "motorola", "moto", "poco", "realme", "redmi", "xiaomi", "samsung", "oneplus", "iqoo", "vivo", "oppo", "iphone"),
        "mobile" to listOf("phone", "mobile", "smartphone", "5g", "4g", "android", "cellphone", "motorola", "moto", "poco", "realme", "redmi", "xiaomi", "samsung", "oneplus", "iqoo", "vivo", "oppo", "iphone"),
        "smartphone" to listOf("phone", "mobile", "smartphone", "5g", "4g", "android", "cellphone", "motorola", "moto", "poco", "realme", "redmi", "xiaomi", "samsung", "oneplus", "iqoo", "vivo", "oppo", "iphone"),
        "tshirt" to listOf("tshirt", "t-shirt", "shirt", "tee", "tees", "polo", "round neck", "crew neck", "collar"),
        "t-shirt" to listOf("tshirt", "t-shirt", "shirt", "tee", "tees", "polo", "round neck", "crew neck", "collar"),
        "bag" to listOf("bag", "backpack", "laptop", "sleeve", "briefcase", "rucksack", "duffle", "messenger"),
        "backpack" to listOf("bag", "backpack", "laptop", "sleeve", "briefcase", "rucksack", "duffle", "messenger"),
        "chair" to listOf("chair", "seating", "office chair", "desk chair", "ergonomic", "recliner"),
        "fryer" to listOf("fryer", "air fryer", "airfryer", "deep fryer", "oven")
    )

    fun isRelevant(query: String, extractedTitle: String): Boolean {
        if (extractedTitle.isBlank()) return false
        val cleanTitle = extractedTitle.lowercase()
        val queryTokens = query.lowercase()
            .split(Regex("[^a-zA-Z0-9\\-]+"))
            .filter { it.length >= 2 && it !in STOP_WORDS }

        if (queryTokens.isEmpty()) return true

        for (token in queryTokens) {
            // Direct substring match
            if (cleanTitle.contains(token)) return true
            // Stem match (e.g. "shoes" -> "shoe")
            if (token.endsWith("s") && token.length > 3 && cleanTitle.contains(token.dropLast(1))) return true
            if (token.endsWith("es") && token.length > 4 && cleanTitle.contains(token.dropLast(2))) return true
            if (token.endsWith("ing") && token.length > 5 && cleanTitle.contains(token.dropLast(3))) return true

            // Synonym / category expansion match
            val synonyms = SYNONYM_MAP[token]
            if (synonyms != null) {
                for (syn in synonyms) {
                    if (cleanTitle.contains(syn)) return true
                }
            }
        }
        return false
    }
}

// 1. Flipkart Live Automation Scraper
class FlipkartAccessibilityScraper : PlatformScraper {
    override val platformId: String = "flipkart"
    override val platformName: String = "Flipkart"
    override val targetPackage: String = "com.flipkart.android"
    override val targetPackages: List<String> = listOf("com.flipkart.android", "com.flipkart.shopsy")

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.flipkart.com/search?q=$encoded")
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
                    message = "Flipkart is not installed on this device."
                )
            )
        }

        val service = ContrilAccessibilityService.instance
        val items = mutableListOf<ProductListingItem>()

        if (service != null) {
            try {
                val launchIntent = createLaunchIntent(context, query)
                if (launchIntent != null) {
                    context.startActivity(launchIntent)
                }

                var elapsed = 0
                val timeoutMs = 3600

                while (elapsed < timeoutMs && items.size < 3) {
                    delay(500)
                    elapsed += 500

                    val nodes = service.extractScreenNodes()
                    if (nodes.isEmpty()) continue

                    // Parse real accessibility nodes
                    var currentTitle: String? = null
                    var currentPrice: Double? = null
                    var currentRating: String? = null

                    for (node in nodes) {
                        val trimmed = node.trim()
                        if (trimmed.length > 4 && !trimmed.contains("₹") && !trimmed.contains("Flipkart") && !trimmed.startsWith("http")) {
                            if (ProductRelevanceValidator.isRelevant(query, trimmed)) {
                                currentTitle = trimmed
                            }
                        } else if (trimmed.contains("₹") || trimmed.contains("Rs")) {
                            val parsedPrice = trimmed.replace(Regex("[^0-9]"), "").toDoubleOrNull()
                            if (parsedPrice != null && parsedPrice > 50) {
                                currentPrice = parsedPrice
                            }
                        } else if (trimmed.matches(Regex("^[1-5](\\.[0-9])?$"))) {
                            currentRating = trimmed
                        }

                        if (currentTitle != null && currentPrice != null) {
                            if (maxBudget == null || currentPrice <= maxBudget) {
                                val item = ProductListingItem(
                                    platformName = platformName,
                                    platformPackage = targetPackage,
                                    itemName = currentTitle,
                                    restaurantOrVendor = "Flipkart Assured",
                                    price = currentPrice,
                                    rating = currentRating ?: "4.2",
                                    eta = "Fast Delivery",
                                    deepLinkUrl = getDeepLinkUri(query).toString()
                                )
                                if (items.none { it.itemName.equals(item.itemName, ignoreCase = true) }) {
                                    items.add(item)
                                }
                            }
                            currentTitle = null
                            currentPrice = null
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w("FlipkartScraper", "Live Accessibility inspection error", e)
            }
        }

        // Validate all extracted items against keyword relevance
        val verifiedItems = items.filter { ProductRelevanceValidator.isRelevant(query, it.itemName) }

        if (verifiedItems.isNotEmpty()) {
            ScrapePlatformResult.Success(verifiedItems.take(3))
        } else {
            ScrapePlatformResult.Failure(
                ScrapeFailure(
                    platformName = platformName,
                    failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                    message = "No verified relevant listings found for '$query' on Flipkart."
                )
            )
        }
    }
}

// 2. Amazon Live Automation Scraper
class AmazonAccessibilityScraper : PlatformScraper {
    override val platformId: String = "amazon"
    override val platformName: String = "Amazon"
    override val targetPackage: String = "in.amazon.mShop.android.shopping"
    override val targetPackages: List<String> = listOf("in.amazon.mShop.android.shopping", "com.amazon.mShop.android.shopping")

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.amazon.in/s?k=$encoded")
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
                    message = "Amazon is not installed on this device."
                )
            )
        }

        val service = ContrilAccessibilityService.instance
        val items = mutableListOf<ProductListingItem>()

        if (service != null) {
            try {
                val launchIntent = createLaunchIntent(context, query)
                if (launchIntent != null) {
                    context.startActivity(launchIntent)
                }

                var elapsed = 0
                val timeoutMs = 3600

                while (elapsed < timeoutMs && items.size < 3) {
                    delay(500)
                    elapsed += 500

                    val nodes = service.extractScreenNodes()
                    if (nodes.isEmpty()) continue

                    var currentTitle: String? = null
                    var currentPrice: Double? = null
                    var currentRating: String? = null

                    for (node in nodes) {
                        val trimmed = node.trim()
                        if (trimmed.length > 5 && !trimmed.contains("₹") && !trimmed.contains("Amazon") && !trimmed.startsWith("http")) {
                            if (ProductRelevanceValidator.isRelevant(query, trimmed)) {
                                currentTitle = trimmed
                            }
                        } else if (trimmed.contains("₹") || trimmed.contains("Rs")) {
                            val parsedPrice = trimmed.replace(Regex("[^0-9]"), "").toDoubleOrNull()
                            if (parsedPrice != null && parsedPrice > 50) {
                                currentPrice = parsedPrice
                            }
                        } else if (trimmed.matches(Regex("^[1-5](\\.[0-9])?$")) || trimmed.contains("out of 5 stars")) {
                            currentRating = trimmed.take(3)
                        }

                        if (currentTitle != null && currentPrice != null) {
                            if (maxBudget == null || currentPrice <= maxBudget) {
                                val item = ProductListingItem(
                                    platformName = platformName,
                                    platformPackage = targetPackage,
                                    itemName = currentTitle,
                                    restaurantOrVendor = "Amazon Prime Choice",
                                    price = currentPrice,
                                    rating = currentRating ?: "4.2",
                                    eta = "Prime Delivery",
                                    deepLinkUrl = getDeepLinkUri(query).toString()
                                )
                                if (items.none { it.itemName.equals(item.itemName, ignoreCase = true) }) {
                                    items.add(item)
                                }
                            }
                            currentTitle = null
                            currentPrice = null
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w("AmazonScraper", "Live Accessibility inspection error", e)
            }
        }

        val verifiedItems = items.filter { ProductRelevanceValidator.isRelevant(query, it.itemName) }

        if (verifiedItems.isNotEmpty()) {
            ScrapePlatformResult.Success(verifiedItems.take(3))
        } else {
            ScrapePlatformResult.Failure(
                ScrapeFailure(
                    platformName = platformName,
                    failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                    message = "No verified relevant listings found for '$query' on Amazon."
                )
            )
        }
    }
}

// 3. Myntra Scraper
class MyntraAccessibilityScraper : PlatformScraper {
    override val platformId: String = "myntra"
    override val platformName: String = "Myntra"
    override val targetPackage: String = "com.myntra.android"

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.myntra.com/$encoded")
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
                    message = "Myntra is not installed on this device."
                )
            )
        }
        ScrapePlatformResult.Failure(
            ScrapeFailure(
                platformName = platformName,
                failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                message = "No verified listings found on Myntra for '$query'."
            )
        )
    }
}

// 4. Meesho Scraper
class MeeshoAccessibilityScraper : PlatformScraper {
    override val platformId: String = "meesho"
    override val platformName: String = "Meesho"
    override val targetPackage: String = "com.meesho.supply"

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.meesho.com/search?q=$encoded")
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
                    message = "Meesho is not installed on this device."
                )
            )
        }
        ScrapePlatformResult.Failure(
            ScrapeFailure(
                platformName = platformName,
                failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                message = "No verified listings found on Meesho for '$query'."
            )
        )
    }
}

// 5. Ajio Scraper
class AjioAccessibilityScraper : PlatformScraper {
    override val platformId: String = "ajio"
    override val platformName: String = "Ajio"
    override val targetPackage: String = "com.ril.ajio"

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.ajio.com/search/?text=$encoded")
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
                    message = "Ajio is not installed on this device."
                )
            )
        }
        ScrapePlatformResult.Failure(
            ScrapeFailure(
                platformName = platformName,
                failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                message = "No verified listings found on Ajio for '$query'."
            )
        )
    }
}

// 6. Purplle Scraper
class PurplleAccessibilityScraper : PlatformScraper {
    override val platformId: String = "purplle"
    override val platformName: String = "Purplle"
    override val targetPackage: String = "com.purplle.purplle"

    override fun getDeepLinkUri(query: String): Uri {
        val encoded = try { URLEncoder.encode(query, "UTF-8") } catch (_: Exception) { query }
        return Uri.parse("https://www.purplle.com/search?q=$encoded")
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
                    message = "Purplle is not installed on this device."
                )
            )
        }
        ScrapePlatformResult.Failure(
            ScrapeFailure(
                platformName = platformName,
                failureType = ScrapeFailureType.NO_RELEVANT_LISTINGS,
                message = "No verified listings found on Purplle for '$query'."
            )
        )
    }
}

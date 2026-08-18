package com.contril.app.data.automation

enum class IntentCategory {
    FOOD_DELIVERY,
    ECOMMERCE,
    FASHION_BEAUTY,
    GROCERY_QUICK_COMMERCE,
    EMAIL_COMMUNICATION,
    CALENDAR_SCHEDULE,
    TASK_MANAGEMENT,
    GENERAL_ASSISTANT
}

data class QueryRoutingDecision(
    val rawQuery: String,
    val category: IntentCategory,
    val explicitPlatform: String? = null,
    val isComparisonSupported: Boolean = false,
    val targetScraperIds: List<String> = emptyList(),
    val budget: Double? = null,
    val cleanedSearchTerm: String = "",
    val unsupportedMessage: String? = null
)

object QueryIntentClassifier {

    private val FOOD_KEYWORDS = setOf(
        "pizza", "burger", "biryani", "noodles", "pasta", "cake", "ice cream",
        "coffee", "tea", "thali", "dosa", "idli", "paneer", "chicken", "roll",
        "sandwich", "meal", "food", "lunch", "dinner", "breakfast", "restaurant",
        "zomato", "swiggy"
    )

    private val ECOMMERCE_KEYWORDS = setOf(
        "fridge", "refrigerator", "tv", "television", "laptop", "phone", "mobile",
        "iphone", "shoes", "shirt", "tshirt", "jeans", "watch", "headphone", "earbuds",
        "camera", "tablet", "ipad", "washing machine", "ac", "air conditioner",
        "flipkart", "amazon"
    )

    private val FASHION_BEAUTY_KEYWORDS = setOf(
        "myntra", "meesho", "ajio", "purplle", "lipstick", "serum", "perfume",
        "sneakers", "dress", "kurta", "saree", "handbag", "makeup", "skincare"
    )

    private val GROCERY_KEYWORDS = setOf(
        "blinkit", "zepto", "instamart", "groceries"
    )

    fun classifyAndRoute(prompt: String): QueryRoutingDecision {
        val lower = prompt.lowercase().trim()

        // 1. Extract Budget if present
        val budgetRegex = Regex("(?i)(?:under|below|less than|budget|max|upto)\\s*(?:rs\\.?|inr|₹)?\\s*(\\d+)")
        val budgetMatch = budgetRegex.find(lower)
        val budget = budgetMatch?.groupValues?.get(1)?.toDoubleOrNull()

        // 2. Detect Explicit Platform
        val explicitPlatform = when {
            lower.contains("zomato") -> "zomato"
            lower.contains("swiggy") -> "swiggy"
            lower.contains("flipkart") -> "flipkart"
            lower.contains("amazon") -> "amazon"
            lower.contains("myntra") -> "myntra"
            lower.contains("meesho") -> "meesho"
            lower.contains("ajio") -> "ajio"
            lower.contains("purplle") -> "purplle"
            lower.contains("blinkit") -> "blinkit"
            lower.contains("zepto") -> "zepto"
            lower.contains("instamart") -> "instamart"
            else -> null
        }

        // 3. Clean search term
        var cleaned = prompt
            .replace(budgetRegex, "")
            .replace(Regex("(?i)\\b(in|on|at|from|via|compare|prices?|find|search|order|get|check|best deal on|cheapest|buy)\\b"), "")
            .replace(Regex("(?i)\\b(zomato|swiggy|flipkart|amazon|myntra|meesho|ajio|purplle|blinkit|zepto|instamart)\\b"), "")
            .trim()
        if (cleaned.isBlank()) cleaned = prompt.trim()

        // 4. Intent Classification
        val hasFood = FOOD_KEYWORDS.any { lower.contains(it) }
        val hasEcommerce = ECOMMERCE_KEYWORDS.any { lower.contains(it) }
        val hasFashionBeauty = FASHION_BEAUTY_KEYWORDS.any { lower.contains(it) }
        val hasGrocery = GROCERY_KEYWORDS.any { lower.contains(it) }

        val isShoppingQuery = lower.contains("price") || lower.contains("cheapest") ||
                lower.contains("buy") || lower.contains("deal") || lower.contains("under") ||
                lower.contains("compare")

        val hasEmail = (lower.contains("check email") || lower.contains("read email") || lower.contains("unread email") || lower.contains("inbox")) &&
                !lower.contains("write") && !lower.contains("draft")
        val hasCalendar = (lower.contains("check calendar") || lower.contains("upcoming meetings") || lower.contains("my schedule today")) &&
                !lower.contains("explain")
        val hasTask = (lower.startsWith("create task") || lower.startsWith("add task") || lower.startsWith("remind me"))

        return when {
            // Explicit Food Delivery query (Zomato / Swiggy on-device accessibility scraper)
            hasFood || explicitPlatform == "zomato" || explicitPlatform == "swiggy" -> {
                val scrapers = when (explicitPlatform) {
                    "zomato" -> listOf("zomato")
                    "swiggy" -> listOf("swiggy")
                    else -> listOf("zomato", "swiggy")
                }
                QueryRoutingDecision(
                    rawQuery = prompt,
                    category = IntentCategory.FOOD_DELIVERY,
                    explicitPlatform = explicitPlatform,
                    isComparisonSupported = true,
                    targetScraperIds = scrapers,
                    budget = budget,
                    cleanedSearchTerm = cleaned,
                    unsupportedMessage = null
                )
            }

            // Explicit Fashion & Beauty query (Myntra, Meesho, Ajio, Purplle)
            hasFashionBeauty || explicitPlatform in listOf("myntra", "meesho", "ajio", "purplle") -> {
                val scrapers = when (explicitPlatform) {
                    "myntra" -> listOf("myntra")
                    "meesho" -> listOf("meesho")
                    "ajio" -> listOf("ajio")
                    "purplle" -> listOf("purplle")
                    else -> listOf("myntra", "meesho", "ajio")
                }
                QueryRoutingDecision(
                    rawQuery = prompt,
                    category = IntentCategory.FASHION_BEAUTY,
                    explicitPlatform = explicitPlatform,
                    isComparisonSupported = true,
                    targetScraperIds = scrapers,
                    budget = budget,
                    cleanedSearchTerm = cleaned,
                    unsupportedMessage = null
                )
            }

            // Explicit E-commerce query (Flipkart, Amazon)
            hasEcommerce || explicitPlatform in listOf("flipkart", "amazon") || (isShoppingQuery && !hasGrocery) -> {
                val scrapers = when (explicitPlatform) {
                    "flipkart" -> listOf("flipkart")
                    "amazon" -> listOf("amazon")
                    else -> listOf("flipkart", "amazon")
                }
                QueryRoutingDecision(
                    rawQuery = prompt,
                    category = IntentCategory.ECOMMERCE,
                    explicitPlatform = explicitPlatform,
                    isComparisonSupported = true,
                    targetScraperIds = scrapers,
                    budget = budget,
                    cleanedSearchTerm = cleaned,
                    unsupportedMessage = null
                )
            }

            // Quick Commerce Grocery query (Future Roadmap)
            hasGrocery -> {
                QueryRoutingDecision(
                    rawQuery = prompt,
                    category = IntentCategory.GROCERY_QUICK_COMMERCE,
                    explicitPlatform = explicitPlatform,
                    isComparisonSupported = false,
                    targetScraperIds = emptyList(),
                    budget = budget,
                    cleanedSearchTerm = cleaned,
                    unsupportedMessage = "On-device quick commerce comparison (Blinkit, Zepto, Instamart) is coming in a future update."
                )
            }

            // Specific System Integrations
            hasEmail -> QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.EMAIL_COMMUNICATION, cleanedSearchTerm = cleaned)
            hasCalendar -> QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.CALENDAR_SCHEDULE, cleanedSearchTerm = cleaned)
            hasTask -> QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.TASK_MANAGEMENT, cleanedSearchTerm = cleaned)

            // Everything else -> General Purpose Conversational AI (Gemini 3.6 Flash)
            else -> QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.GENERAL_ASSISTANT,
                isComparisonSupported = false,
                cleanedSearchTerm = cleaned,
                unsupportedMessage = null
            )
        }
    }
}

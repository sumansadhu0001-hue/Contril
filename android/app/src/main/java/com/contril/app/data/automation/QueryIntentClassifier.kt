package com.contril.app.data.automation

enum class IntentCategory {
    FOOD_DELIVERY,
    ECOMMERCE,
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
        "flipkart", "amazon", "myntra", "meesho", "ajio"
    )

    private val GROCERY_KEYWORDS = setOf(
        "blinkit", "zepto", "instamart", "groceries"
    )

    fun classifyAndRoute(prompt: String): QueryRoutingDecision {
        val lower = prompt.lowercase().trim()

        // 1. Extract Budget if present (e.g. "under 500", "below 300", "for 400")
        val budgetRegex = Regex("(?i)(?:under|below|less than|budget|max|upto)\\s*(?:rs\\.?|inr|₹)?\\s*(\\d+)")
        val budgetMatch = budgetRegex.find(lower)
        val budget = budgetMatch?.groupValues?.get(1)?.toDoubleOrNull()

        // 2. Detect Explicit Platform
        val explicitPlatform = when {
            lower.contains("zomato") -> "zomato"
            lower.contains("swiggy") -> "swiggy"
            lower.contains("flipkart") -> "flipkart"
            lower.contains("amazon") -> "amazon"
            lower.contains("blinkit") -> "blinkit"
            lower.contains("zepto") -> "zepto"
            lower.contains("instamart") -> "instamart"
            else -> null
        }

        // 3. Clean search term
        var cleaned = prompt
            .replace(budgetRegex, "")
            .replace(Regex("(?i)\\b(in|on|at|from|via|compare|prices?|find|search|order|get|check|best deal on|cheapest|buy)\\b"), "")
            .replace(Regex("(?i)\\b(zomato|swiggy|flipkart|amazon|blinkit|zepto|instamart)\\b"), "")
            .trim()
        if (cleaned.isBlank()) cleaned = prompt.trim()

        // 4. Intent Classification
        val hasFood = FOOD_KEYWORDS.any { lower.contains(it) }
        val hasEcommerce = ECOMMERCE_KEYWORDS.any { lower.contains(it) }
        val hasGrocery = GROCERY_KEYWORDS.any { lower.contains(it) }
        val hasEmail = (lower.contains("email") || lower.contains("mail") || lower.contains("inbox")) &&
                (lower.contains("check") || lower.contains("read") || lower.contains("summarize") || lower.contains("send") || lower.contains("draft") || lower.contains("inbox"))
        val hasCalendar = (lower.contains("calendar") || lower.contains("meeting") || lower.contains("schedule")) &&
                (lower.contains("today") || lower.contains("tomorrow") || lower.contains("check") || lower.contains("set") || lower.contains("upcoming") || lower.contains("agenda"))
        val hasTask = (lower.contains("task") || lower.contains("todo") || lower.contains("reminder")) &&
                (lower.contains("create") || lower.contains("add") || lower.contains("list") || lower.contains("complete"))

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

            // Explicit E-commerce query (Flipkart, Amazon, electronic appliances)
            hasEcommerce || explicitPlatform == "flipkart" || explicitPlatform == "amazon" -> {
                val platformDisplay = explicitPlatform?.replaceFirstChar { it.uppercase() } ?: "E-commerce (Flipkart/Amazon)"
                QueryRoutingDecision(
                    rawQuery = prompt,
                    category = IntentCategory.ECOMMERCE,
                    explicitPlatform = explicitPlatform,
                    isComparisonSupported = false,
                    targetScraperIds = emptyList(),
                    budget = budget,
                    cleanedSearchTerm = cleaned,
                    unsupportedMessage = "Contril on-device price comparison currently supports Food Delivery (Zomato & Swiggy). Support for $platformDisplay is coming in a future update."
                )
            }

            // Quick Commerce Grocery query
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

            // Everything else -> General Purpose Conversational AI (Gemini 1.5 Flash)
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

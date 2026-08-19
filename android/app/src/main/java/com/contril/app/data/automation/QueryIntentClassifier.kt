package com.contril.app.data.automation

import android.util.Log
import com.contril.app.data.api.GeminiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

enum class IntentCategory {
    FOOD_DELIVERY,
    ECOMMERCE,
    FASHION_BEAUTY,
    GROCERY_QUICK_COMMERCE,
    EMAIL_COMMUNICATION,
    CALENDAR_SCHEDULE,
    BRIEFING,
    TASK_MANAGEMENT,
    GENERAL_ASSISTANT,
    AMBIGUOUS
}

data class QueryRoutingDecision(
    val rawQuery: String,
    val category: IntentCategory,
    val explicitPlatform: String? = null,
    val isComparisonSupported: Boolean = false,
    val targetScraperIds: List<String> = emptyList(),
    val budget: Double? = null,
    val cleanedSearchTerm: String = "",
    val proposedPlanTitle: String = "",
    val proposedAction: String = "CONVERSATIONAL",
    val clarificationMessage: String? = null,
    val unsupportedMessage: String? = null
)

object QueryIntentClassifier {

    private const val NLU_SYSTEM_PROMPT = """You are Contril AI Universal Intent Classifier and Action Planner.
Your job is to understand user input (which may contain typos, casual shorthand, or incomplete sentences) and classify their intent with ZERO hardcoded rules.

Analyze the user query and output ONLY valid JSON matching this schema:
{
  "intent": "PRICE_COMPARISON" | "EMAIL_ACTION" | "CALENDAR_ACTION" | "BRIEFING" | "TASK_MANAGEMENT" | "GENERAL_CHAT" | "AMBIGUOUS",
  "category": "ECOMMERCE" | "FOOD_DELIVERY" | "FASHION_BEAUTY" | "GROCERY" | "NONE",
  "target_platforms": ["flipkart", "amazon", "zomato", "swiggy", "myntra", "meesho", "ajio", "purplle"],
  "extracted_entity": "corrected product name, subject, or task title with typos fixed",
  "budget_inr": number or null,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "proposed_plan_title": "Clear action plan title",
  "proposed_action": "SEARCH_PRICES" | "READ_EMAILS" | "SEND_DRAFT" | "TRASH_EMAILS" | "ARCHIVE_EMAILS" | "VIEW_CALENDAR" | "CREATE_MEETING" | "CREATE_TASK" | "SYNTHESIZE_BRIEFING" | "CONVERSATIONAL",
  "clarification_message": "message if ambiguous or null"
}

CRITICAL RULES:
1. If the input is genuinely ambiguous (e.g. 'do the thing we talked about'), set intent: 'AMBIGUOUS', confidence: 'LOW', and provide a polite, honest clarification_message asking what they need.
2. Fix typos in extracted_entity (e.g. 'flipkrt' -> 'flipkart', 'piza' -> 'pizza', 'hedphones' -> 'headphones', 'fridge' -> 'refrigerator').
3. For shopping/price comparison, assign the correct target_platforms and category.
4. Output raw JSON only. No markdown ticks, no commentary."""

    /**
     * Real Model-Based Understanding: Sends the user's raw, unmodified input
     * (including typos and casual phrasing) directly to Gemini for intent classification.
     */
    suspend fun classifyAndRouteWithAi(prompt: String): QueryRoutingDecision = withContext(Dispatchers.IO) {
        val cleanInput = prompt.trim()
        if (cleanInput.isBlank()) {
            return@withContext QueryRoutingDecision(
                rawQuery = prompt,
                category = IntentCategory.GENERAL_ASSISTANT,
                cleanedSearchTerm = ""
            )
        }

        try {
            val aiResult = GeminiClient.generateContent(
                prompt = "User Query: \"$cleanInput\"\n\n$NLU_SYSTEM_PROMPT"
            ).getOrNull()

            if (!aiResult.isNullOrBlank()) {
                val cleanJson = aiResult.replace("```json", "").replace("```", "").trim()
                val json = JSONObject(cleanJson)

                val intentStr = json.optString("intent", "GENERAL_CHAT").uppercase()
                val categoryStr = json.optString("category", "NONE").uppercase()
                val extractedEntity = json.optString("extracted_entity", cleanInput)
                val budget = if (json.isNull("budget_inr")) null else json.optDouble("budget_inr")
                val confidence = json.optString("confidence", "HIGH").uppercase()
                val planTitle = json.optString("proposed_plan_title", "Action Plan")
                val actionType = json.optString("proposed_action", "CONVERSATIONAL")
                val clarification = if (json.isNull("clarification_message")) null else json.optString("clarification_message")

                val targetPlatformsArray = json.optJSONArray("target_platforms") ?: JSONArray()
                val platforms = mutableListOf<String>()
                for (i in 0 until targetPlatformsArray.length()) {
                    val p = targetPlatformsArray.optString(i).lowercase()
                    if (p.isNotBlank()) platforms.add(p)
                }

                if (intentStr == "AMBIGUOUS" || confidence == "LOW") {
                    return@withContext QueryRoutingDecision(
                        rawQuery = prompt,
                        category = IntentCategory.AMBIGUOUS,
                        cleanedSearchTerm = cleanInput,
                        proposedPlanTitle = planTitle,
                        proposedAction = actionType,
                        clarificationMessage = clarification ?: "I'm not sure what you're asking — could you clarify whether you'd like to search prices, manage your emails, or check your schedule?"
                    )
                }

                when (intentStr) {
                    "PRICE_COMPARISON" -> {
                        val category = when (categoryStr) {
                            "FOOD_DELIVERY" -> IntentCategory.FOOD_DELIVERY
                            "FASHION_BEAUTY" -> IntentCategory.FASHION_BEAUTY
                            "GROCERY" -> IntentCategory.GROCERY_QUICK_COMMERCE
                            else -> IntentCategory.ECOMMERCE
                        }

                        val targetScrapers = when {
                            platforms.isNotEmpty() -> platforms
                            category == IntentCategory.FOOD_DELIVERY -> listOf("zomato", "swiggy")
                            category == IntentCategory.FASHION_BEAUTY -> listOf("myntra", "meesho", "ajio")
                            category == IntentCategory.GROCERY_QUICK_COMMERCE -> emptyList()
                            else -> listOf("flipkart", "amazon")
                        }

                        val isSupported = category != IntentCategory.GROCERY_QUICK_COMMERCE

                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = category,
                            explicitPlatform = platforms.firstOrNull(),
                            isComparisonSupported = isSupported,
                            targetScraperIds = targetScrapers,
                            budget = budget,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType,
                            unsupportedMessage = if (!isSupported) "Quick commerce grocery comparison (Blinkit, Zepto, Instamart) is coming in a future update." else null
                        )
                    }

                    "EMAIL_ACTION" -> {
                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = IntentCategory.EMAIL_COMMUNICATION,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType
                        )
                    }

                    "CALENDAR_ACTION" -> {
                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = IntentCategory.CALENDAR_SCHEDULE,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType
                        )
                    }

                    "BRIEFING" -> {
                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = IntentCategory.BRIEFING,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType
                        )
                    }

                    "TASK_MANAGEMENT" -> {
                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = IntentCategory.TASK_MANAGEMENT,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType
                        )
                    }

                    else -> {
                        return@withContext QueryRoutingDecision(
                            rawQuery = prompt,
                            category = IntentCategory.GENERAL_ASSISTANT,
                            cleanedSearchTerm = extractedEntity,
                            proposedPlanTitle = planTitle,
                            proposedAction = actionType
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.w("QueryIntentClassifier", "Gemini NLU parsing error, falling back to direct query routing", e)
        }

        // Offline deterministic fallback
        return@withContext classifyAndRoute(prompt)
    }

    /**
     * Lightweight synchronous parser for offline or instant pre-routing.
     */
    fun classifyAndRoute(prompt: String): QueryRoutingDecision {
        val lower = prompt.lowercase().trim()
        val budgetRegex = Regex("(?i)(?:under|below|less than|budget|max|upto)\\s*(?:rs\\.?|inr|₹)?\\s*(\\d+)")
        val budgetMatch = budgetRegex.find(lower)
        val budget = budgetMatch?.groupValues?.get(1)?.toDoubleOrNull()

        val isShopping = lower.contains("price") || lower.contains("compare") ||
                lower.contains("cheapest") || lower.contains("buy") || lower.contains("deal") ||
                lower.contains("under") || lower.contains("flipkart") || lower.contains("amazon") ||
                lower.contains("zomato") || lower.contains("swiggy") || lower.contains("myntra")

        if (isShopping) {
            val isFood = lower.contains("zomato") || lower.contains("swiggy") || lower.contains("pizza") || lower.contains("burger") || lower.contains("food")
            val isFashion = lower.contains("myntra") || lower.contains("meesho") || lower.contains("ajio") || lower.contains("dress") || lower.contains("shirt")
            val category = when {
                isFood -> IntentCategory.FOOD_DELIVERY
                isFashion -> IntentCategory.FASHION_BEAUTY
                else -> IntentCategory.ECOMMERCE
            }
            val scrapers = when (category) {
                IntentCategory.FOOD_DELIVERY -> listOf("zomato", "swiggy")
                IntentCategory.FASHION_BEAUTY -> listOf("myntra", "meesho", "ajio")
                else -> listOf("flipkart", "amazon")
            }
            return QueryRoutingDecision(
                rawQuery = prompt,
                category = category,
                isComparisonSupported = true,
                targetScraperIds = scrapers,
                budget = budget,
                cleanedSearchTerm = prompt
            )
        }

        if (lower.contains("email") || lower.contains("inbox")) {
            return QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.EMAIL_COMMUNICATION, cleanedSearchTerm = prompt)
        }
        if (lower.contains("calendar") || lower.contains("schedule") || lower.contains("meeting")) {
            return QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.CALENDAR_SCHEDULE, cleanedSearchTerm = prompt)
        }
        if (lower.contains("briefing") || lower.contains("brief")) {
            return QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.BRIEFING, cleanedSearchTerm = prompt)
        }
        if (lower.startsWith("task") || lower.startsWith("remind")) {
            return QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.TASK_MANAGEMENT, cleanedSearchTerm = prompt)
        }

        return QueryRoutingDecision(rawQuery = prompt, category = IntentCategory.GENERAL_ASSISTANT, cleanedSearchTerm = prompt)
    }
}

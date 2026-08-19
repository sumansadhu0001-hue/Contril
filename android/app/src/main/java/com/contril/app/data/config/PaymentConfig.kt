package com.contril.app.data.config

object PaymentConfig {
    // Configurable Razorpay Payment Links
    var proPaymentLinkUrl: String = "https://rzp.io/l/contril-pro"
    var elitePaymentLinkUrl: String = "https://rzp.io/l/contril-elite"
    var razorpayPaymentLinkUrl: String
        get() = proPaymentLinkUrl
        set(value) { proPaymentLinkUrl = value }

    // Free Tier (₹0) — 25,000 tokens/day
    const val FREE_PLAN_NAME: String = "Early Access Free"
    const val FREE_PLAN_PRICE_INR: Int = 0
    const val FREE_PLAN_PRICE_FORMATTED: String = "₹0"
    const val FREE_PLAN_DAILY_TOKENS: Long = 25_000L
    const val FREE_PLAN_DAILY_LIMIT: Int = 25_000

    val FREE_PLAN_FEATURES = listOf(
        "25,000 daily AI token quota",
        "Live Gmail & Google Calendar feeds",
        "Native Android voice assistant",
        "Cross-platform price comparison (Zomato & Swiggy)",
        "Action approval safety gates"
    )

    // Starter Executive / Pro Tier (₹899/mo) — 250,000 tokens/day
    const val PRO_PLAN_NAME: String = "Starter Executive"
    const val PRO_PLAN_PRICE_INR: Int = 899
    const val PRO_PLAN_PRICE_FORMATTED: String = "₹899"
    const val PRO_PLAN_BILLING_CYCLE: String = "/month"
    const val PRO_PLAN_DAILY_TOKENS: Long = 250_000L
    const val PRO_PLAN_DAILY_LIMIT: Int = 250_000

    val PRO_PLAN_FEATURES = listOf(
        "250,000 daily AI token quota",
        "Full Gmail & Google Calendar deep integration",
        "Cross-platform on-device price comparison (Zomato & Swiggy)",
        "Priority Gemini 3.6 Flash executive intelligence",
        "Zero-latency automated schedule conflict resolution",
        "AI Email draft composer & reply generator"
    )

    // Autonomous Pro / Elite Tier (₹3,999/mo) — 1,000,000 tokens/day (900k daytime + 100k overnight reserve)
    const val ELITE_PLAN_NAME: String = "Autonomous Elite"
    const val ELITE_PLAN_PRICE_INR: Int = 3999
    const val ELITE_PLAN_PRICE_FORMATTED: String = "₹3,999"
    const val ELITE_PLAN_BILLING_CYCLE: String = "/month"
    const val ELITE_PLAN_TOTAL_TOKENS: Long = 1_000_000L
    const val ELITE_PLAN_DAYTIME_TOKENS: Long = 900_000L
    const val ELITE_PLAN_OVERNIGHT_TOKENS: Long = 100_000L
    const val ELITE_PLAN_DAILY_LIMIT: Int = 900_000

    val ELITE_PLAN_FEATURES = listOf(
        "1,000,000 daily token budget (900k daytime + 100k overnight reserve)",
        "24/7 Overnight Autonomy Mode foreground monitor",
        "Automated Auto-Send email reply dispatch",
        "Continuous inbox triage & priority extraction",
        "VIP dedicated executive intelligence support"
    )

    fun getPrefilledPaymentLink(plan: String = "pro", email: String? = null, name: String? = null): String {
        val base = if (plan.equals("elite", ignoreCase = true)) elitePaymentLinkUrl else proPaymentLinkUrl
        val params = mutableListOf<String>()
        if (!email.isNullOrBlank()) params.add("email=$email")
        if (!name.isNullOrBlank()) params.add("name=$name")

        return if (params.isEmpty()) {
            base
        } else {
            if (base.contains("?")) "$base&${params.joinToString("&")}" else "$base?${params.joinToString("&")}"
        }
    }
}


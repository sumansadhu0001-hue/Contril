package com.contril.app.data.config

object PaymentConfig {
    // Configurable Razorpay Payment Link (Can be overridden via backend remote config)
    var razorpayPaymentLinkUrl: String = "https://rzp.io/l/contril-pro"

    const val PRO_PLAN_NAME: String = "Contril Pro"
    const val PRO_PLAN_PRICE_INR: Int = 499
    const val PRO_PLAN_PRICE_FORMATTED: String = "₹499"
    const val PRO_PLAN_BILLING_CYCLE: String = "/month"

    val PRO_PLAN_FEATURES = listOf(
        "Unlimited autonomous AI command execution",
        "Full Gmail & Google Calendar deep integration",
        "Cross-platform on-device price comparison (Zomato & Swiggy)",
        "Priority Gemini 1.5 Flash executive summarization",
        "Zero-latency automated schedule conflict resolution"
    )

    fun getPrefilledPaymentLink(email: String? = null, name: String? = null): String {
        val base = razorpayPaymentLinkUrl
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

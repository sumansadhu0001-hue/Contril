package com.contril.app.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDate

data class UsageLedger(
    val usedConversations: Int,
    val maxDailyConversations: Int,
    val isLimitReached: Boolean,
    val resetDate: String,
    val tierName: String
)

class UsageEnforcementManager(
    private val prefRepository: PreferenceRepository
) {
    private val _usageLedger = MutableStateFlow(calculateCurrentLedger())
    val usageLedger: StateFlow<UsageLedger> = _usageLedger.asStateFlow()

    fun calculateCurrentLedger(): UsageLedger {
        val (used, max) = prefRepository.getTodayAiUsage()
        val plan = prefRepository.currentPlan.value
        val isLimit = !prefRepository.isProOrExecutive() && used >= max
        return UsageLedger(
            usedConversations = used,
            maxDailyConversations = max,
            isLimitReached = isLimit,
            resetDate = LocalDate.now().toString(),
            tierName = plan
        )
    }

    fun canExecuteChat(): Boolean {
        if (prefRepository.isProOrExecutive()) return true
        val (used, max) = prefRepository.getTodayAiUsage()
        return used < max
    }

    fun recordChatExecution(): Boolean {
        val success = prefRepository.incrementAiUsage()
        _usageLedger.value = calculateCurrentLedger()
        return success
    }

    fun refreshUsage() {
        _usageLedger.value = calculateCurrentLedger()
    }
}

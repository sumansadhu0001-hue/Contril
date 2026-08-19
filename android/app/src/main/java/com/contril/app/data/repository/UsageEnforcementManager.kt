package com.contril.app.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class UsageLedger(
    val usedTokens: Long,
    val maxDailyTokens: Long,
    val remainingTokens: Long,
    val isLimitReached: Boolean,
    val resetDate: String,
    val tierName: String
) {
    // Backward compatibility helpers
    val usedConversations: Int get() = usedTokens.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()
    val maxDailyConversations: Int get() = maxDailyTokens.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()
}

class UsageEnforcementManager(
    private val prefRepository: PreferenceRepository
) {
    private val _usageLedger = MutableStateFlow(calculateCurrentLedger())
    val usageLedger: StateFlow<UsageLedger> = _usageLedger.asStateFlow()

    fun calculateCurrentLedger(): UsageLedger {
        val used = prefRepository.getTodayDaytimeTokensUsed()
        val max = prefRepository.getPlanDailyTokenLimit()
        val remaining = (max - used).coerceAtLeast(0L)
        val isLimit = remaining < 500L
        val plan = prefRepository.currentPlan.value
        return UsageLedger(
            usedTokens = used,
            maxDailyTokens = max,
            remainingTokens = remaining,
            isLimitReached = isLimit,
            resetDate = prefRepository.getTodayDateIST(),
            tierName = plan
        )
    }

    fun canExecuteChat(): Boolean {
        return prefRepository.canExecuteAiAction()
    }

    fun recordTokenConsumption(tokens: Long, isOvernight: Boolean = false): Boolean {
        val success = prefRepository.recordAiTokenUsage(tokens, isOvernight)
        _usageLedger.value = calculateCurrentLedger()
        return success
    }

    fun refreshUsage() {
        _usageLedger.value = calculateCurrentLedger()
    }
}

package com.contril.app.data.api

import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.CommandResponse
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.UsageEnforcementManager

class AIOrchestrator(
    private val contrilRepository: ContrilRepository,
    private val prefRepository: PreferenceRepository,
    private val usageManager: UsageEnforcementManager = UsageEnforcementManager(prefRepository)
) {

    suspend fun orchestrateCommand(prompt: String): CommandResponse {
        val cleanPrompt = prompt.trim()
        if (cleanPrompt.isBlank()) {
            return CommandResponse(
                conversationId = "empty",
                responseText = "Please enter a valid command or request."
            )
        }

        // 1. Quota & Token Governance Check
        if (!usageManager.canExecuteChat()) {
            val used = prefRepository.getTodayDaytimeTokensUsed()
            val limit = prefRepository.getPlanDailyTokenLimit()
            return CommandResponse(
                conversationId = "paywall_limit",
                responseText = "You have reached your daily token budget (${String.format("%,d", used)} / ${String.format("%,d", limit)} tokens used today). Your balance will reset at midnight IST, or you can upgrade in Plans & Billing for a higher allocation."
            )
        }

        // 2. Autonomous Execution & Tool Routing (tokens deducted based on exact usageMetadata)
        val autonomy = prefRepository.autonomyMode.value
        val connectedServices = prefRepository.connectedServices.value
        return contrilRepository.executeCommand(cleanPrompt, autonomy, connectedServices)
    }
}

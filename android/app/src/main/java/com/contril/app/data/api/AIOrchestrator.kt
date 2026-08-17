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

        // 1. Quota & Freemium Governance Check
        if (!usageManager.canExecuteChat()) {
            return CommandResponse(
                conversationId = "paywall_limit",
                responseText = "You have reached your daily Free tier limit (5 AI conversations). Upgrade to Contril Pro in Plans & Billing for unlimited access."
            )
        }

        // 2. Decrement/Record Usage
        usageManager.recordChatExecution()

        // 3. Autonomous Execution & Tool Routing
        val autonomy = prefRepository.autonomyMode.value
        val connectedServices = prefRepository.connectedServices.value
        return contrilRepository.executeCommand(cleanPrompt, autonomy, connectedServices)
    }
}

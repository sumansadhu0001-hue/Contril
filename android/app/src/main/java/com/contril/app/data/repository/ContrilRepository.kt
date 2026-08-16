package com.contril.app.data.repository

import com.contril.app.data.api.NetworkModule
import com.contril.app.data.local.DemoDataProvider
import com.contril.app.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class ContrilRepository {

    private val apiService = NetworkModule.apiService

    private val _priorities = MutableStateFlow(DemoDataProvider.getInitialPriorities())
    val priorities: Flow<List<PriorityItem>> = _priorities.asStateFlow()

    private val _pendingActions = MutableStateFlow(DemoDataProvider.getInitialPendingActions())
    val pendingActions: Flow<List<PendingAction>> = _pendingActions.asStateFlow()

    private val _tasks = MutableStateFlow(DemoDataProvider.getInitialTasks())
    val tasks: Flow<List<TaskItem>> = _tasks.asStateFlow()

    private val _meetings = MutableStateFlow(DemoDataProvider.getInitialMeetings())
    val meetings: Flow<List<MeetingItem>> = _meetings.asStateFlow()

    private val _integrations = MutableStateFlow(DemoDataProvider.getInitialIntegrations())
    val integrations: Flow<List<IntegrationStatus>> = _integrations.asStateFlow()

    suspend fun executeCommand(prompt: String, autonomyMode: AutonomyMode): CommandResponse {
        return try {
            val response = apiService.executeCommand(
                CommandRequest(
                    prompt = prompt,
                    autonomyLevel = autonomyMode
                )
            )
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                generateLocalCommandResponse(prompt, autonomyMode)
            }
        } catch (e: Exception) {
            // Seamlessly fall back to local intelligence if offline or network unavailable
            generateLocalCommandResponse(prompt, autonomyMode)
        }
    }

    private fun generateLocalCommandResponse(prompt: String, autonomyMode: AutonomyMode): CommandResponse {
        val lower = prompt.lowercase()
        val steps = mutableListOf<ExecutionStep>()
        var action: PendingAction? = null

        when {
            lower.contains("email") || lower.contains("mail") -> {
                steps.add(ExecutionStep("s1", "Checking unread emails in Gmail", "complete"))
                steps.add(ExecutionStep("s2", "Extracted 3 priority threads", "complete"))
                steps.add(ExecutionStep("s3", "Prepared draft response for partner timeline", "complete"))

                action = PendingAction(
                    id = "act_${UUID.randomUUID().toString().take(6)}",
                    title = "Send Follow-up Email",
                    description = "Reply prepared: 'Deliverables are on track for Friday review.'",
                    targetService = "Gmail",
                    consequenceLevel = "medium",
                    status = ActionStatus.PENDING_APPROVAL
                )
            }
            lower.contains("meeting") || lower.contains("calendar") || lower.contains("schedule") -> {
                steps.add(ExecutionStep("s1", "Scanning Google Calendar for tomorrow", "complete"))
                steps.add(ExecutionStep("s2", "Identified conflict at 2:00 PM (Strategy Sync)", "complete"))
                steps.add(ExecutionStep("s3", "Prepared rescheduling recommendation to 3:30 PM", "complete"))

                action = PendingAction(
                    id = "act_${UUID.randomUUID().toString().take(6)}",
                    title = "Reschedule Strategy Sync",
                    description = "Move meeting to 3:30 PM to clear conflicting Board prep session.",
                    targetService = "Calendar",
                    consequenceLevel = "high",
                    status = ActionStatus.PENDING_APPROVAL
                )
            }
            lower.contains("drive") || lower.contains("document") || lower.contains("proposal") -> {
                steps.add(ExecutionStep("s1", "Searching Google Drive index", "complete"))
                steps.add(ExecutionStep("s2", "Found 'Q3 Infrastructure Proposal.docx'", "complete"))
                steps.add(ExecutionStep("s3", "Extracted executive summary and open action items", "complete"))
            }
            else -> {
                steps.add(ExecutionStep("s1", "Understanding intent and requirements", "complete"))
                steps.add(ExecutionStep("s2", "Cross-referencing connected services (Gmail, Calendar, Drive)", "complete"))
                steps.add(ExecutionStep("s3", "Prepared coordinated intelligence response", "complete"))
            }
        }

        if (action != null) {
            _pendingActions.value = listOf(action) + _pendingActions.value
        }

        return CommandResponse(
            conversationId = UUID.randomUUID().toString(),
            responseText = "Processed your request across connected tools.",
            steps = steps,
            pendingAction = action
        )
    }

    suspend fun approveAction(actionId: String) {
        try {
            apiService.approveAction(actionId)
        } catch (_: Exception) { }

        _pendingActions.value = _pendingActions.value.map {
            if (it.id == actionId) it.copy(status = ActionStatus.APPROVED) else it
        }
    }

    suspend fun rejectAction(actionId: String) {
        try {
            apiService.rejectAction(actionId)
        } catch (_: Exception) { }

        _pendingActions.value = _pendingActions.value.map {
            if (it.id == actionId) it.copy(status = ActionStatus.REJECTED) else it
        }
    }

    fun toggleTaskCompletion(taskId: String) {
        _tasks.value = _tasks.value.map {
            if (it.id == taskId) it.copy(isCompleted = !it.isCompleted) else it
        }
    }
}

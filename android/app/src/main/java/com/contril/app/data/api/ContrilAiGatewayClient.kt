package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.CommandResponse
import com.contril.app.data.model.ExecutionStep
import com.contril.app.data.model.PendingAction
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import okhttp3.ConnectionPool
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.UUID
import java.util.concurrent.TimeUnit

sealed class AiStreamChunk {
    data class Start(val requestId: String, val conversationId: String) : AiStreamChunk()
    data class Delta(val text: String) : AiStreamChunk()
    data class Complete(
        val requestId: String,
        val conversationId: String,
        val fullText: String,
        val promptTokens: Int = 0,
        val completionTokens: Int = 0,
        val tokensUsed: Int = 0,
        val pendingAction: PendingAction? = null
    ) : AiStreamChunk()
    data class UsageLimitReached(
        val plan: String,
        val dailyLimit: Int,
        val used: Int,
        val resetAt: String,
        val message: String
    ) : AiStreamChunk()
    data class Error(val errorMessage: String) : AiStreamChunk()
}

object ContrilAiGatewayClient {

    private const val TAG = "ContrilCloudAI"
    
    // NVIDIA Cloud Hosted Remote Inference
    private const val CLOUD_INFERENCE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
    private const val CLOUD_API_KEY = "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"
    private const val ACTIVE_CLOUD_MODEL = "meta/llama-3.1-8b-instruct"

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
            .retryOnConnectionFailure(true)
            .build()
    }

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private fun buildSystemPrompt(userName: String, userRole: String, timezone: String, connectedServices: Map<String, String>): String {
        val isGmail = connectedServices.containsKey("gmail") || connectedServices.containsKey("google_workspace") || connectedServices.containsKey("google")
        val isCalendar = connectedServices.containsKey("calendar") || connectedServices.containsKey("google_workspace") || connectedServices.containsKey("google")

        return """
            You are CONTRIL — an elite, highly capable AI Chief of Staff.
            Your role is to help the user understand, organize, decide, and execute work across connected workspace tools.
            
            AUTHENTICATED USER CONTEXT:
            - User: $userName ($userRole)
            - Timezone: $timezone
            - Connected Workspace Tools: [Gmail: ${if (isGmail) "CONNECTED" else "DISCONNECTED"}, Google Calendar: ${if (isCalendar) "CONNECTED" else "DISCONNECTED"}, Tasks: CONNECTED]
            
            SUPPORTED CAPABILITIES:
            1. Gmail: Read, search, summarize unread emails, compose drafts, and prepare email dispatches.
            2. Google Calendar: Inspect today's schedule, scan agenda conflicts, and prepare meeting invites.
            3. Tasks: Create, organize, prioritize, and manage personal and work tasks.
            
            UNSUPPORTED SERVICES:
            - Contril DOES NOT currently support opening YouTube, Spotify, WhatsApp, food delivery (Zomato/Swiggy), booking flights/hotels (MakeMyTrip/Airbnb), or ecommerce shopping.
            - If the user asks for an unsupported app or action (e.g., "open YouTube", "order food from Zomato"), respond simply and directly:
              "I can't perform actions on [Service] because [Service] isn't a connected Contril capability. Contril currently supports Gmail, Google Calendar, and Task management."
            - NEVER tell the user to connect Google Workspace for YouTube or unrelated third-party apps.
            
            CRITICAL RULES:
            1. DRAFTING EMAILS VS SEARCHING:
               - When the user asks to write/draft/compose an email to an address (e.g. "write a greeting email to example@gmail.com"):
                 Immediately write the complete, elegant draft (Subject + Message Body).
                 DO NOT search Gmail first. DO NOT claim that "no emails were found".
            2. SEARCHING EMAILS:
               - When the user asks to "find", "search", "check", or "read" emails:
                 If Gmail is DISCONNECTED: Say "Your Gmail isn't connected yet. Connect it from Profile to let me check your emails."
                 If Gmail is CONNECTED but no emails match: State honestly "No matching emails found."
                 NEVER invent fake emails or fake contacts.
            3. ACTIONS VS SEARCHES:
               - Searching or reading emails/calendar is an informational query, NOT a consequential action.
               - ONLY when the user explicitly requests sending an email or scheduling a new meeting should an actionable dispatch be prepared.
        """.trimIndent()
    }

    /**
     * Determines if a real consequential action approval card should be shown.
     * MUST NEVER trigger on searches, reads, or queries with email addresses.
     */
    fun detectConsequentialAction(prompt: String, aiResponseText: String): PendingAction? {
        val lowerPrompt = prompt.lowercase().trim()

        // 1. Explicit Exclusions: Informational Queries MUST NEVER trigger approval cards
        val isInformational = lowerPrompt.startsWith("find") ||
                lowerPrompt.startsWith("search") ||
                lowerPrompt.startsWith("read") ||
                lowerPrompt.startsWith("check") ||
                lowerPrompt.startsWith("show") ||
                lowerPrompt.startsWith("list") ||
                lowerPrompt.startsWith("what") ||
                lowerPrompt.startsWith("who") ||
                lowerPrompt.startsWith("how") ||
                lowerPrompt.contains("summarize") ||
                lowerPrompt.contains("summary") ||
                lowerPrompt.contains("any email from") ||
                lowerPrompt.contains("any unread")

        if (isInformational) {
            return null
        }

        // 2. Email Dispatch Action (User explicitly asked to write, send, or draft an email to someone)
        val isEmailDispatch = lowerPrompt.startsWith("email ") ||
                lowerPrompt.startsWith("write an email") ||
                lowerPrompt.startsWith("write a greeting email") ||
                lowerPrompt.startsWith("write email") ||
                lowerPrompt.startsWith("send email") ||
                lowerPrompt.startsWith("send an email") ||
                lowerPrompt.startsWith("send mail") ||
                lowerPrompt.startsWith("reply to ") ||
                lowerPrompt.contains("send this email") ||
                lowerPrompt.contains("email saying") ||
                lowerPrompt.contains("draft a reply") ||
                lowerPrompt.contains("draft an email to")

        if (isEmailDispatch) {
            val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
            val targetEmail = emailRegex.find(prompt)?.value ?: emailRegex.find(aiResponseText)?.value ?: "Recipient"
            
            return PendingAction(
                id = "act_send_${UUID.randomUUID().toString().take(6)}",
                title = "Send Email to $targetEmail",
                description = aiResponseText.take(300),
                targetService = "Gmail",
                consequenceLevel = "high",
                status = ActionStatus.PENDING_APPROVAL
            )
        }

        // 3. Calendar Scheduling Action (User explicitly asked to schedule/create a meeting)
        val isCalendarSchedule = lowerPrompt.startsWith("schedule ") ||
                lowerPrompt.startsWith("create meeting") ||
                lowerPrompt.startsWith("book meeting") ||
                lowerPrompt.contains("set up a meeting")

        if (isCalendarSchedule) {
            return PendingAction(
                id = "act_cal_${UUID.randomUUID().toString().take(6)}",
                title = "Schedule Calendar Event",
                description = aiResponseText.take(300),
                targetService = "Google Calendar",
                consequenceLevel = "medium",
                status = ActionStatus.PENDING_APPROVAL
            )
        }

        return null
    }

    /**
     * Streams 100% Remote Cloud Inference via Server-Sent Events (SSE).
     * Explicitly requests and parses terminal usage chunk.
     */
    fun streamAiResponse(
        prompt: String,
        userId: String = "usr_contril_client",
        userName: String = "Suman",
        userRole: String = "Founder / Executive",
        timezone: String = "Asia/Kolkata",
        connectedServices: Map<String, String> = emptyMap(),
        conversationHistory: List<Pair<String, String>> = emptyList(),
        prefRepository: PreferenceRepository? = null
    ): Flow<AiStreamChunk> = flow {
        val cleanPrompt = prompt.trim()
        val requestId = "ctr_req_${UUID.randomUUID().toString().take(8)}"
        val conversationId = "conv_${UUID.randomUUID().toString().take(8)}"

        emit(AiStreamChunk.Start(requestId, conversationId))

        val messagesArray = JSONArray()
        messagesArray.put(JSONObject().apply {
            put("role", "system")
            put("content", buildSystemPrompt(userName, userRole, timezone, connectedServices))
        })

        for ((role, text) in conversationHistory.takeLast(6)) {
            messagesArray.put(JSONObject().apply {
                put("role", if (role == "user") "user" else "assistant")
                put("content", text)
            })
        }

        messagesArray.put(JSONObject().apply {
            put("role", "user")
            put("content", cleanPrompt)
        })

        val streamOptions = JSONObject().apply {
            put("include_usage", true)
        }

        val requestPayload = JSONObject().apply {
            put("model", ACTIVE_CLOUD_MODEL)
            put("messages", messagesArray)
            put("temperature", 0.6)
            put("max_tokens", 1024)
            put("stream", true)
            put("stream_options", streamOptions)
        }

        val req = Request.Builder()
            .url(CLOUD_INFERENCE_URL)
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer $CLOUD_API_KEY")
            .post(requestPayload.toString().toRequestBody(jsonMediaType))
            .build()

        try {
            val response = httpClient.newCall(req).execute()
            if (!response.isSuccessful || response.body == null) {
                emit(AiStreamChunk.Error("Contril couldn't reach the Cloud AI service (HTTP ${response.code}). Check your connection and try again."))
                return@flow
            }

            val reader = BufferedReader(InputStreamReader(response.body!!.byteStream()))
            var line: String?
            var fullAccumulatedText = ""
            var promptTokens = 0
            var completionTokens = 0
            var totalTokens = 0

            while (reader.readLine().also { line = it } != null) {
                val l = line?.trim() ?: continue
                if (l.isEmpty()) continue

                if (l.startsWith("data: ")) {
                    val dataStr = l.substring(6).trim()
                    if (dataStr == "[DONE]") break

                    try {
                        val json = JSONObject(dataStr)
                        
                        // Parse usage chunk (NVIDIA sends usage in final stream chunk)
                        val usage = json.optJSONObject("usage")
                        if (usage != null) {
                            promptTokens = usage.optInt("prompt_tokens", promptTokens)
                            completionTokens = usage.optInt("completion_tokens", completionTokens)
                            totalTokens = usage.optInt("total_tokens", totalTokens)
                        }

                        val choices = json.optJSONArray("choices")
                        if (choices != null && choices.length() > 0) {
                            val delta = choices.optJSONObject(0)?.optJSONObject("delta")?.optString("content", "") ?: ""
                            if (delta.isNotEmpty()) {
                                fullAccumulatedText += delta
                                emit(AiStreamChunk.Delta(delta))
                            }
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "SSE parse error: ${e.message}")
                    }
                }
            }

            if (totalTokens == 0) {
                totalTokens = promptTokens + completionTokens
            }

            // Immediately record authoritatively in preference repository and Supabase
            if (totalTokens > 0 && prefRepository != null) {
                prefRepository.recordAiTokenUsage(totalTokens.toLong(), isOvernight = false)
            }

            val cleanText = sanitizeCleanText(fullAccumulatedText)
            val pendingAction = detectConsequentialAction(cleanPrompt, cleanText)

            emit(AiStreamChunk.Complete(
                requestId = requestId,
                conversationId = conversationId,
                fullText = cleanText,
                promptTokens = promptTokens,
                completionTokens = completionTokens,
                tokensUsed = totalTokens,
                pendingAction = pendingAction
            ))

        } catch (e: Exception) {
            Log.e(TAG, "Cloud streaming error: ${e.message}", e)
            emit(AiStreamChunk.Error("Contril couldn't reach the Cloud AI service right now. Check your connection and try again."))
        }
    }.flowOn(Dispatchers.IO)

    /**
     * 100% Cloud Remote Inference Synchronous Execution.
     */
    suspend fun generateAiResponse(
        prompt: String,
        autonomyMode: AutonomyMode = AutonomyMode.SENSITIVE_ONLY,
        connectedServices: Map<String, String> = emptyMap(),
        userContext: String = "",
        prefRepository: PreferenceRepository? = null
    ): CommandResponse = withContext(Dispatchers.IO) {
        val cleanPrompt = prompt.trim()
        val messagesArray = JSONArray()

        messagesArray.put(JSONObject().apply {
            put("role", "system")
            put("content", buildSystemPrompt("Suman", "Founder / Executive", "Asia/Kolkata", connectedServices))
        })

        val userContent = if (userContext.isNotBlank()) "$cleanPrompt\n\n$userContext" else cleanPrompt
        messagesArray.put(JSONObject().apply {
            put("role", "user")
            put("content", userContent)
        })

        val requestPayload = JSONObject().apply {
            put("model", ACTIVE_CLOUD_MODEL)
            put("messages", messagesArray)
            put("temperature", 0.6)
            put("max_tokens", 1024)
        }

        try {
            val req = Request.Builder()
                .url(CLOUD_INFERENCE_URL)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer $CLOUD_API_KEY")
                .post(requestPayload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(req).execute()
            val body = response.body?.string() ?: ""

            if (response.isSuccessful) {
                val json = JSONObject(body)
                val choices = json.optJSONArray("choices")
                val msgObj = choices?.optJSONObject(0)?.optJSONObject("message")
                val rawText = msgObj?.optString("content", "") ?: ""

                val usage = json.optJSONObject("usage")
                val promptTokens = usage?.optInt("prompt_tokens", 0) ?: 0
                val candidateTokens = usage?.optInt("completion_tokens", 0) ?: 0
                val totalTokens = usage?.optInt("total_tokens", promptTokens + candidateTokens) ?: (promptTokens + candidateTokens)

                // Atomically update usage flow
                if (totalTokens > 0 && prefRepository != null) {
                    prefRepository.recordAiTokenUsage(totalTokens.toLong(), isOvernight = false)
                }

                val cleanText = sanitizeCleanText(rawText)
                val convId = "conv_${UUID.randomUUID().toString().take(8)}"
                val pendingAction = detectConsequentialAction(cleanPrompt, cleanText)

                return@withContext CommandResponse(
                    conversationId = convId,
                    responseText = cleanText,
                    steps = emptyList(),
                    pendingAction = pendingAction,
                    tokensUsed = totalTokens
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Cloud AI execution error: ${e.message}")
        }

        return@withContext CommandResponse(
            conversationId = "err_${UUID.randomUUID().toString().take(6)}",
            responseText = "Contril couldn't reach the Cloud AI service right now. Check your connection and try again.",
            steps = emptyList(),
            pendingAction = null,
            tokensUsed = 0
        )
    }

    fun sanitizeCleanText(text: String): String {
        return text
            .replace(Regex("^#{1,6}\\s*\\*\\*", RegexOption.MULTILINE), "")
            .replace(Regex("^#{1,6}\\s*", RegexOption.MULTILINE), "")
            .replace(Regex("^\\s*\\*{3,}\\s*$", RegexOption.MULTILINE), "")
            .replace(Regex("^\\s*-{3,}\\s*$", RegexOption.MULTILINE), "")
            .replace(Regex("^\\s*_{3,}\\s*$", RegexOption.MULTILINE), "")
            .replace(Regex("\\*\\*([^*]+)\\*\\*"), "$1")
            .replace(Regex("^\\*\\s+", RegexOption.MULTILINE), "• ")
            .trim()
    }
}

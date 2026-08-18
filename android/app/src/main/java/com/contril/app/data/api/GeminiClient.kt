package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.CommandResponse
import com.contril.app.data.model.ExecutionStep
import com.contril.app.data.model.PendingAction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.TimeUnit

data class ChatMessageTurn(
    val role: String, // "user" or "model"
    val text: String
)

object GeminiClient {

    private const val GEMINI_API_KEY = "AIzaSyDC72lXEVy-YnooYhSOiADOLiDFXkll6tg"
    private const val GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"

    // Multi-turn conversational memory
    private val conversationHistory = mutableListOf<ChatMessageTurn>()

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(25, TimeUnit.SECONDS)
            .readTimeout(35, TimeUnit.SECONDS)
            .writeTimeout(25, TimeUnit.SECONDS)
            .build()
    }

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    fun clearConversationMemory() {
        synchronized(conversationHistory) {
            conversationHistory.clear()
        }
    }

    suspend fun generateContent(prompt: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("contents", JSONArray().put(JSONObject().apply {
                    put("parts", JSONArray().put(JSONObject().put("text", prompt)))
                }))
            }
            val req = Request.Builder()
                .url("$GEMINI_ENDPOINT?key=$GEMINI_API_KEY")
                .header("Content-Type", "application/json")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()
            val res = httpClient.newCall(req).execute()
            if (res.isSuccessful) {
                val body = res.body?.string() ?: ""
                val json = JSONObject(body)
                val text = json.optJSONArray("candidates")
                    ?.optJSONObject(0)
                    ?.optJSONObject("content")
                    ?.optJSONArray("parts")
                    ?.optJSONObject(0)
                    ?.optString("text") ?: ""
                Result.success(text)
            } else {
                Result.failure(Exception("HTTP ${res.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generateAiResponse(
        prompt: String,
        autonomyMode: AutonomyMode = AutonomyMode.SENSITIVE_ONLY,
        connectedServices: Map<String, String> = emptyMap(),
        userContext: String = ""
    ): CommandResponse = withContext(Dispatchers.IO) {
        val cleanPrompt = prompt.trim()
        val connectedNames = connectedServices.keys.joinToString(", ").ifBlank { "None connected" }

        val systemPrompt = """
            You are CONTRIL — an elite, highly capable AI Chief of Staff and universal conversational reasoning assistant.
            You have complete, general-purpose intelligence identical to state-of-the-art AI systems (like ChatGPT, Claude, and Gemini).
            
            CORE DIRECTIVES:
            1. UNIVERSAL CONVERSATIONAL ABILITY: Answer ANY user inquiry with thoroughness, precision, intellectual depth, or creative flair. Whether the user asks a quick factual question, asks to solve a complex math/logic problem, requests creative writing, asks for an explanation of advanced scientific concepts, or simply engages in casual discussion, provide an authentic, high-quality, comprehensive response.
            2. WORKSPACE INTELLIGENCE: When workspace integrations (${connectedNames}) are available and relevant to the user's prompt, proactively leverage that context to draft communications, synthesize agendas, or recommend actions.
            3. ACTION SAFETY & AUTONOMY: Autonomy Mode is [${autonomyMode.name}]. If the user asks to send an email, schedule a meeting, or perform an external action, draft the complete payload and present it cleanly for review.
            4. ZERO UNNECESSARY GATING: Never claim you cannot answer general knowledge, analytical, or conversational questions simply because an external integration (like Gmail or Calendar) is not connected.
            5. EXECUTIVE FORMATTING: Use clean, polished GitHub-flavored Markdown (bolding, clear bullet points, concise sections) to deliver maximum clarity.
        """.trimIndent()

        val contentsArray = JSONArray()

        // Append recent multi-turn context (last 6 turns)
        synchronized(conversationHistory) {
            val recentTurns = conversationHistory.takeLast(6)
            for (turn in recentTurns) {
                contentsArray.put(JSONObject().apply {
                    put("role", turn.role)
                    put("parts", JSONArray().put(JSONObject().put("text", turn.text)))
                })
            }
        }

        // Append current user prompt
        contentsArray.put(JSONObject().apply {
            put("role", "user")
            put("parts", JSONArray().put(JSONObject().put("text", cleanPrompt)))
        })

        val requestBodyJson = JSONObject().apply {
            put("system_instruction", JSONObject().apply {
                put("parts", JSONArray().put(JSONObject().put("text", systemPrompt)))
            })
            put("contents", contentsArray)
            put("generationConfig", JSONObject().apply {
                put("temperature", 0.7)
                put("maxOutputTokens", 2048)
            })
        }

        try {
            val startTime = System.currentTimeMillis()
            val url = "$GEMINI_ENDPOINT?key=$GEMINI_API_KEY"
            val request = Request.Builder()
                .url(url)
                .header("Content-Type", "application/json")
                .post(requestBodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val latencyMs = System.currentTimeMillis() - startTime
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                Log.e("GeminiClient", "Gemini API HTTP Error (${response.code}): $resBody")
                val errorMsg = if (response.code == 429) {
                    "AI rate limit reached. Please wait a brief moment before sending another prompt."
                } else {
                    "Unable to connect to Gemini AI services (HTTP ${response.code}). Please verify your network connection and retry."
                }
                return@withContext CommandResponse(
                    conversationId = "err_${UUID.randomUUID().toString().take(8)}",
                    responseText = errorMsg,
                    steps = listOf(
                        ExecutionStep("s1", "Contacted Gemini 3.6 Flash API", "error"),
                        ExecutionStep("s2", "HTTP ${response.code} Gateway Response", "error")
                    ),
                    pendingAction = null
                )
            }

            val json = JSONObject(resBody)
            val candidates = json.optJSONArray("candidates")
            val firstCandidate = candidates?.optJSONObject(0)
            val content = firstCandidate?.optJSONObject("content")
            val parts = content?.optJSONArray("parts")
            val text = parts?.optJSONObject(0)?.optString("text", "") ?: ""

            if (text.isNotBlank()) {
                val cleanResponse = text.trim()

                // Save turns to conversation history
                synchronized(conversationHistory) {
                    conversationHistory.add(ChatMessageTurn("user", cleanPrompt))
                    conversationHistory.add(ChatMessageTurn("model", cleanResponse))
                    if (conversationHistory.size > 20) {
                        conversationHistory.removeAt(0)
                        conversationHistory.removeAt(0)
                    }
                }

                val lower = cleanPrompt.lowercase()
                var pendingAction: PendingAction? = null

                if (lower.startsWith("send ") || lower.contains("send email") || lower.contains("draft email") || lower.contains("schedule a meeting")) {
                    pendingAction = PendingAction(
                        id = "act_${UUID.randomUUID().toString().take(6)}",
                        title = if (lower.contains("schedule") || lower.contains("meeting")) "Confirm Calendar Schedule" else "Approve Email Dispatch",
                        description = "Prepared by Gemini Chief of Staff based on your instruction:\n\n${cleanResponse.take(240)}...",
                        targetService = if (lower.contains("schedule") || lower.contains("meeting")) "Google Calendar" else "Gmail",
                        consequenceLevel = "medium",
                        status = ActionStatus.PENDING_APPROVAL
                    )
                }

                val steps = listOf(
                    ExecutionStep("s1", "Processed prompt via Gemini 3.6 Flash (${latencyMs}ms)", "complete"),
                    ExecutionStep("s2", "Synthesized contextual intelligence", "complete")
                )

                return@withContext CommandResponse(
                    conversationId = "conv_${UUID.randomUUID().toString().take(8)}",
                    responseText = cleanResponse,
                    steps = steps,
                    pendingAction = pendingAction
                )
            } else {
                return@withContext CommandResponse(
                    conversationId = "empty_${UUID.randomUUID().toString().take(8)}",
                    responseText = "Gemini returned an empty response candidate. Please rephrase or submit your prompt again.",
                    steps = listOf(ExecutionStep("s1", "Processed prompt via Gemini 3.6 Flash", "error")),
                    pendingAction = null
                )
            }
        } catch (e: Exception) {
            Log.e("GeminiClient", "Network exception reaching Gemini", e)
            return@withContext CommandResponse(
                conversationId = "net_err_${UUID.randomUUID().toString().take(8)}",
                responseText = "Network connection failure: Unable to reach Gemini AI services (${e.localizedMessage ?: "Unknown Error"}). Please check your device internet connection and retry.",
                steps = listOf(
                    ExecutionStep("s1", "Attempting connection to Gemini endpoint", "error"),
                    ExecutionStep("s2", "Network error encountered", "error")
                ),
                pendingAction = null
            )
        }
    }

    suspend fun summarizeEmailThread(
        sender: String,
        subject: String,
        snippet: String
    ): String = withContext(Dispatchers.IO) {
        val prompt = "Briefly summarize this email thread and recommend the next action in 2 bullet points:\nFrom: $sender\nSubject: $subject\nContent: $snippet"
        val requestBodyJson = JSONObject().apply {
            put("contents", JSONArray().put(
                JSONObject().apply {
                    put("role", "user")
                    put("parts", JSONArray().put(JSONObject().put("text", prompt)))
                }
            ))
            put("generationConfig", JSONObject().apply {
                put("temperature", 0.4)
                put("maxOutputTokens", 512)
            })
        }

        try {
            val url = "$GEMINI_ENDPOINT?key=$GEMINI_API_KEY"
            val request = Request.Builder()
                .url(url)
                .header("Content-Type", "application/json")
                .post(requestBodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""
            if (response.isSuccessful) {
                val json = JSONObject(resBody)
                val candidates = json.optJSONArray("candidates")
                val parts = candidates?.optJSONObject(0)?.optJSONObject("content")?.optJSONArray("parts")
                val text = parts?.optJSONObject(0)?.optString("text", "") ?: ""
                if (text.isNotBlank()) return@withContext text.trim()
            }
        } catch (e: Exception) {
            Log.e("GeminiClient", "Email summary error", e)
        }
        return@withContext "Summary for \"$subject\" from $sender:\n• $snippet"
    }
}

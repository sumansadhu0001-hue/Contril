package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.EmailSummary
import com.contril.app.data.model.MeetingItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val isAuthExpired: Boolean = false) : ApiResult<Nothing>()
}

class ContrilBackendClient(
    private val baseUrl: String = "https://qjyowojnvbfezznezxrr.supabase.co",
    private val anonKey: String = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"
) {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Fetch real sanitized Gmail threads from backend service using the Contril user session token
     */
    suspend fun fetchGmailInbox(sessionToken: String): ApiResult<List<EmailSummary>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/functions/v1/gmail-inbox")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $sessionToken")
                .header("Content-Type", "application/json")
                .get()
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (response.code == 401 || response.code == 403) {
                return@withContext ApiResult.Error("Gmail authorization expired. Please reconnect.", isAuthExpired = true)
            }

            if (!response.isSuccessful) {
                val errMsg = try {
                    JSONObject(resBody).optString("error", "Failed to retrieve Gmail inbox.")
                } catch (_: Exception) {
                    "Failed to retrieve Gmail inbox (HTTP ${response.code})."
                }
                return@withContext ApiResult.Error(errMsg)
            }

            val jsonArray = try {
                val rootObj = JSONObject(resBody)
                rootObj.optJSONArray("threads") ?: JSONArray()
            } catch (_: Exception) {
                JSONArray(resBody)
            }

            val emails = mutableListOf<EmailSummary>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                emails.add(
                    EmailSummary(
                        id = obj.optString("id", "msg_$i"),
                        sender = obj.optString("sender", "Unknown Sender"),
                        subject = obj.optString("subject", "No Subject"),
                        summarySnippet = obj.optString("snippet", obj.optString("preview", "")),
                        isUrgent = obj.optBoolean("is_urgent", obj.optBoolean("unread", false)),
                        hasDraftReady = obj.optBoolean("has_draft_ready", false)
                    )
                )
            }

            ApiResult.Success(emails)
        } catch (e: Exception) {
            Log.e("ContrilBackend", "Error fetching Gmail inbox", e)
            ApiResult.Error("Unable to connect to Gmail service: ${e.message}")
        }
    }

    /**
     * Fetch real sanitized Calendar events from backend service using the Contril user session token
     */
    suspend fun fetchCalendarEvents(sessionToken: String): ApiResult<List<MeetingItem>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/functions/v1/calendar-events")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $sessionToken")
                .header("Content-Type", "application/json")
                .get()
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (response.code == 401 || response.code == 403) {
                return@withContext ApiResult.Error("Google Calendar authorization expired. Please reconnect.", isAuthExpired = true)
            }

            if (!response.isSuccessful) {
                val errMsg = try {
                    JSONObject(resBody).optString("error", "Failed to retrieve Calendar events.")
                } catch (_: Exception) {
                    "Failed to retrieve Calendar events (HTTP ${response.code})."
                }
                return@withContext ApiResult.Error(errMsg)
            }

            val jsonArray = try {
                val rootObj = JSONObject(resBody)
                rootObj.optJSONArray("events") ?: JSONArray()
            } catch (_: Exception) {
                JSONArray(resBody)
            }

            val events = mutableListOf<MeetingItem>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val attendeesArray = obj.optJSONArray("attendees")
                val attendeesList = mutableListOf<String>()
                if (attendeesArray != null) {
                    for (j in 0 until attendeesArray.length()) {
                        attendeesList.add(attendeesArray.getString(j))
                    }
                }

                events.add(
                    MeetingItem(
                        id = obj.optString("id", "evt_$i"),
                        title = obj.optString("title", "Scheduled Event"),
                        timeRange = obj.optString("time_range", obj.optString("start_time", "All Day")),
                        attendees = attendeesList,
                        locationOrLink = obj.optString("location", obj.optString("meeting_link", "Google Meet")),
                        hasConflict = obj.optBoolean("has_conflict", false),
                        briefingReady = obj.optBoolean("briefing_ready", true)
                    )
                )
            }

            ApiResult.Success(events)
        } catch (e: Exception) {
            Log.e("ContrilBackend", "Error fetching Calendar events", e)
            ApiResult.Error("Unable to connect to Calendar service: ${e.message}")
        }
    }
}

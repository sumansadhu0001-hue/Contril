package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.EmailSummary
import com.contril.app.data.model.MeetingItem
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val isAuthExpired: Boolean = false) : ApiResult<Nothing>()
}

class ContrilBackendClient(
    private val prefRepository: PreferenceRepository? = null,
    private val baseUrl: String = "https://qjyowojnvbfezznezxrr.supabase.co",
    private val anonKey: String = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"
) {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Silent token refresh helper: refreshes the access token using refresh_token
     */
    suspend fun getOrRefreshGoogleToken(): String? = withContext(Dispatchers.IO) {
        val currentToken = prefRepository?.getGoogleProviderToken()
        val refreshToken = prefRepository?.getGoogleRefreshToken()

        if (!currentToken.isNullOrBlank() && !(prefRepository?.isGoogleTokenExpired() ?: false)) {
            return@withContext currentToken
        }

        if (refreshToken.isNullOrBlank()) {
            return@withContext currentToken ?: prefRepository?.userSessionToken?.value
        }

        try {
            Log.i("ContrilBackend", "Silently refreshing Google OAuth token via Google OAuth endpoint...")
            val formBody = okhttp3.FormBody.Builder()
                .add("client_id", "708030276416-913atdon7hgroo5mtoo6ebso4blvd11k.apps.googleusercontent.com")
                .add("grant_type", "refresh_token")
                .add("refresh_token", refreshToken)
                .build()

            val req = Request.Builder()
                .url("https://oauth2.googleapis.com/token")
                .post(formBody)
                .build()

            val res = httpClient.newCall(req).execute()
            val body = res.body?.string() ?: ""
            if (res.isSuccessful) {
                val json = JSONObject(body)
                val newAccessToken = json.optString("access_token")
                val expiresIn = json.optLong("expires_in", 3600L)

                if (newAccessToken.isNotBlank()) {
                    prefRepository?.saveGoogleProviderTokens(
                        providerToken = newAccessToken,
                        refreshToken = refreshToken,
                        expiresInSeconds = expiresIn
                    )
                    Log.i("ContrilBackend", "Google OAuth token refreshed successfully.")
                    return@withContext newAccessToken
                }
            } else {
                Log.w("ContrilBackend", "Google token refresh failed: HTTP ${res.code} - $body")
            }
        } catch (e: Exception) {
            Log.w("ContrilBackend", "Silent token refresh exception: ${e.message}")
        }

        return@withContext currentToken ?: prefRepository?.userSessionToken?.value
    }

    companion object {
        suspend fun getFreshGoogleToken(prefRepository: PreferenceRepository?): String? = withContext(Dispatchers.IO) {
            val current = prefRepository?.getGoogleProviderToken()
            if (!current.isNullOrBlank() && !(prefRepository?.isGoogleTokenExpired() ?: false)) {
                return@withContext current
            }
            val client = ContrilBackendClient(prefRepository)
            client.getOrRefreshGoogleToken()
        }
        suspend fun verifyGoogleToken(token: String): Boolean = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(10, TimeUnit.SECONDS).build()
                val req = Request.Builder()
                    .url("https://www.googleapis.com/oauth2/v2/userinfo")
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val res = client.newCall(req).execute()
                res.isSuccessful
            } catch (e: Exception) {
                Log.w("ContrilBackend", "Failed to verify Google token", e)
                false
            }
        }

        suspend fun fetchDirectGmailMessages(token: String): List<EmailSummary> = withContext(Dispatchers.IO) {
            fetchDirectGmailPage(token, pageToken = null, maxResults = 15).first
        }

        suspend fun fetchDirectGmailPage(
            token: String,
            pageToken: String? = null,
            maxResults: Int = 15
        ): Pair<List<EmailSummary>, String?> = withContext(Dispatchers.IO) {
            val emails = mutableListOf<EmailSummary>()
            var nextPageToken: String? = null
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).readTimeout(20, TimeUnit.SECONDS).build()
                val urlBuilder = StringBuilder("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=$maxResults")
                if (!pageToken.isNullOrBlank()) {
                    urlBuilder.append("&pageToken=").append(java.net.URLEncoder.encode(pageToken, "UTF-8"))
                }

                val listReq = Request.Builder()
                    .url(urlBuilder.toString())
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val listRes = client.newCall(listReq).execute()
                if (!listRes.isSuccessful) return@withContext Pair(emptyList(), null)
                val listBody = listRes.body?.string() ?: return@withContext Pair(emptyList(), null)
                val rootJson = JSONObject(listBody)
                nextPageToken = rootJson.optString("nextPageToken").takeIf { it.isNotBlank() }
                val messagesJson = rootJson.optJSONArray("messages") ?: return@withContext Pair(emptyList(), null)

                for (i in 0 until messagesJson.length()) {
                    val msgObj = messagesJson.getJSONObject(i)
                    val msgId = msgObj.getString("id")
                    val getReq = Request.Builder()
                        .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/$msgId?format=full")
                        .header("Authorization", "Bearer $token")
                        .get()
                        .build()
                    val getRes = client.newCall(getReq).execute()
                    if (getRes.isSuccessful) {
                        val getBody = getRes.body?.string() ?: continue
                        val msgDetail = JSONObject(getBody)
                        val threadId = msgDetail.optString("threadId", msgId)
                        val snippet = msgDetail.optString("snippet")
                        val labelIds = mutableListOf<String>()
                        val labelsJson = msgDetail.optJSONArray("labelIds")
                        if (labelsJson != null) {
                            for (l in 0 until labelsJson.length()) {
                                labelIds.add(labelsJson.getString(l))
                            }
                        }

                        val category = when {
                            labelIds.contains("CATEGORY_PROMOTIONS") -> "PROMOTIONS"
                            labelIds.contains("CATEGORY_UPDATES") -> "UPDATES"
                            labelIds.contains("CATEGORY_FORUMS") -> "PROMOTIONS"
                            else -> "PRIMARY"
                        }

                        val headers = msgDetail.optJSONObject("payload")?.optJSONArray("headers")
                        var subject = "(No Subject)"
                        var from = "Sender"
                        var date = "Today"
                        if (headers != null) {
                            for (h in 0 until headers.length()) {
                                val header = headers.getJSONObject(h)
                                when (header.optString("name").lowercase()) {
                                    "subject" -> subject = header.optString("value", subject)
                                    "from" -> from = header.optString("value", from)
                                    "date" -> date = header.optString("value", date).take(16)
                                }
                            }
                        }
                        emails.add(
                            EmailSummary(
                                id = msgId,
                                threadId = threadId,
                                sender = from,
                                subject = subject,
                                summarySnippet = snippet.ifBlank { "Real Gmail message preview" },
                                isUrgent = subject.contains("urgent", ignoreCase = true) || subject.contains("important", ignoreCase = true),
                                hasDraftReady = false,
                                category = category,
                                labels = labelIds,
                                dateFormatted = date,
                                unread = labelIds.contains("UNREAD")
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Error fetching direct Gmail messages page", e)
            }
            Pair(emails, nextPageToken)
        }

        private fun sanitizeEmailHtml(rawHtml: String): String {
            var clean = rawHtml
            // Strip script tags
            clean = clean.replace(Regex("(?i)<script[\\s\\S]*?</script>"), "")
            // Strip on* event handlers (onclick, onload, onerror, etc.)
            clean = clean.replace(Regex("(?i)\\son\\w+\\s*=\\s*(\"[^\"]*\"|'[^']*'|[^\\s>]+)"), "")
            // Strip javascript: URIs
            clean = clean.replace(Regex("(?i)href\\s*=\\s*[\"']javascript:[^\"']*[\"']"), "href=\"#\"")
            clean = clean.replace(Regex("(?i)src\\s*=\\s*[\"']javascript:[^\"']*[\"']"), "")

            // Wrap in responsive mobile styles
            return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            font-size: 14px;
                            line-height: 1.5;
                            color: #1E293B;
                            background-color: transparent;
                            margin: 0;
                            padding: 8px;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }
                        img { max-width: 100% !important; height: auto !important; }
                        table { max-width: 100% !important; width: 100% !important; }
                        a { color: #2563EB; text-decoration: underline; }
                        p, div, span { max-width: 100% !important; }
                    </style>
                </head>
                <body>
                    $clean
                </body>
                </html>
            """.trimIndent()
        }

        suspend fun fetchFullEmail(token: String, messageId: String): com.contril.app.data.model.FullEmailDetail? = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).build()
                val req = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/$messageId?format=full")
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val res = client.newCall(req).execute()
                if (!res.isSuccessful) return@withContext null
                val bodyStr = res.body?.string() ?: return@withContext null
                val msgJson = JSONObject(bodyStr)
                val threadId = msgJson.optString("threadId", messageId)
                val payload = msgJson.optJSONObject("payload") ?: return@withContext null
                val headers = payload.optJSONArray("headers")
                var subject = "(No Subject)"
                var from = ""
                var date = ""
                if (headers != null) {
                    for (i in 0 until headers.length()) {
                        val h = headers.getJSONObject(i)
                        when (h.optString("name").lowercase()) {
                            "subject" -> subject = h.optString("value", subject)
                            "from" -> from = h.optString("value", from)
                            "date" -> date = h.optString("value", date)
                        }
                    }
                }

                // Recursive MIME body extraction (plain & HTML)
                var plainText = ""
                var htmlText: String? = null

                fun extractMimeParts(part: JSONObject) {
                    val mime = part.optString("mimeType").lowercase()
                    val bodyData = part.optJSONObject("body")?.optString("data")
                    if (!bodyData.isNullOrBlank()) {
                        try {
                            val decodedBytes = android.util.Base64.decode(bodyData, android.util.Base64.URL_SAFE)
                            val decodedStr = String(decodedBytes, Charsets.UTF_8)
                            if (mime.contains("text/html")) {
                                if (htmlText == null) htmlText = decodedStr
                            } else if (mime.contains("text/plain")) {
                                if (plainText.isBlank()) plainText = decodedStr
                            } else if (plainText.isBlank()) {
                                plainText = decodedStr
                            }
                        } catch (_: Exception) {}
                    }

                    val subParts = part.optJSONArray("parts")
                    if (subParts != null) {
                        for (p in 0 until subParts.length()) {
                            extractMimeParts(subParts.getJSONObject(p))
                        }
                    }
                }

                extractMimeParts(payload)

                if (plainText.isBlank() && htmlText == null) {
                    plainText = msgJson.optString("snippet")
                }

                val sanitizedHtml = htmlText?.let { sanitizeEmailHtml(it) }

                com.contril.app.data.model.FullEmailDetail(
                    id = messageId,
                    threadId = threadId,
                    sender = from,
                    subject = subject,
                    date = date,
                    bodyPlain = if (plainText.isNotBlank()) plainText else (sanitizedHtml?.replace(Regex("<[^>]*>"), " ")?.trim() ?: ""),
                    bodyHtml = sanitizedHtml
                )
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Failed to fetch full email detail", e)
                null
            }
        }

        suspend fun sendGmailReplyResult(
            token: String,
            threadId: String,
            to: String,
            subject: String,
            body: String
        ): Pair<Boolean, String> = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).build()
                val rfcSubject = if (subject.startsWith("Re:", ignoreCase = true)) subject else "Re: $subject"
                val rawEmail = "To: $to\r\nSubject: $rfcSubject\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n$body"
                val encodedRaw = android.util.Base64.encodeToString(
                    rawEmail.toByteArray(Charsets.UTF_8),
                    android.util.Base64.URL_SAFE or android.util.Base64.NO_WRAP
                )

                val postJson = JSONObject().apply {
                    put("raw", encodedRaw)
                    if (threadId.isNotBlank()) {
                        put("threadId", threadId)
                    }
                }

                val req = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .post(postJson.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
                    .build()

                val res = client.newCall(req).execute()
                val resBody = res.body?.string() ?: ""
                Log.i("ContrilBackend", "sendGmailReply HTTP response: ${res.code}, body: $resBody")

                if (res.isSuccessful) {
                    Pair(true, "Reply sent successfully via Gmail.")
                } else {
                    val errMsg = when (res.code) {
                        403 -> "Gmail Send permission (gmail.send) not granted. Please reconnect Gmail to grant Send permission."
                        401 -> "Google session expired. Please reconnect Gmail."
                        else -> "Gmail API Error (HTTP ${res.code}): ${resBody.take(120)}"
                    }
                    Pair(false, errMsg)
                }
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Failed to send Gmail reply", e)
                Pair(false, "Network error: ${e.localizedMessage}")
            }
        }

        suspend fun sendDirectEmailResult(
            token: String,
            to: String,
            subject: String,
            body: String
        ): Pair<Boolean, String> = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).build()
                val rawEmail = "To: $to\r\nSubject: $subject\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n$body"
                val encodedRaw = android.util.Base64.encodeToString(
                    rawEmail.toByteArray(Charsets.UTF_8),
                    android.util.Base64.URL_SAFE or android.util.Base64.NO_WRAP
                )

                val postJson = JSONObject().apply {
                    put("raw", encodedRaw)
                }

                val req = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .post(postJson.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
                    .build()

                val res = client.newCall(req).execute()
                val resBody = res.body?.string() ?: ""
                Log.i("ContrilBackend", "sendDirectEmail HTTP response: ${res.code}, body: $resBody")

                if (res.isSuccessful) {
                    Pair(true, "Email sent successfully to $to via Gmail.")
                } else {
                    val errMsg = when (res.code) {
                        403 -> "Gmail Send permission (gmail.send) not granted. Please reconnect Gmail to grant Send permission."
                        401 -> "Google session expired. Please reconnect Gmail."
                        else -> "Gmail API Error (HTTP ${res.code}): ${resBody.take(120)}"
                    }
                    Pair(false, errMsg)
                }
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Failed to send direct email", e)
                Pair(false, "Network error: ${e.localizedMessage}")
            }
        }

        suspend fun sendDirectEmail(
            token: String,
            to: String,
            subject: String,
            body: String
        ): Boolean = sendDirectEmailResult(token, to, subject, body).first

        suspend fun sendGmailReply(
            token: String,
            threadId: String,
            to: String,
            subject: String,
            body: String
        ): Boolean = sendGmailReplyResult(token, threadId, to, subject, body).first

        suspend fun countMatchingEmails(token: String, query: String): Int = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(10, TimeUnit.SECONDS).build()
                val encodedQ = java.net.URLEncoder.encode(query, "UTF-8")
                val req = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=$encodedQ&maxResults=100")
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val res = client.newCall(req).execute()
                if (res.isSuccessful) {
                    val body = res.body?.string() ?: return@withContext 0
                    val arr = JSONObject(body).optJSONArray("messages")
                    return@withContext arr?.length() ?: 0
                }
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Failed to count matching emails", e)
            }
            0
        }

        suspend fun trashMatchingEmails(token: String, query: String, limit: Int = 70): Int = withContext(Dispatchers.IO) {
            var trashedCount = 0
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).build()
                val encodedQ = java.net.URLEncoder.encode(query, "UTF-8")
                val listReq = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=$encodedQ&maxResults=$limit")
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val listRes = client.newCall(listReq).execute()
                if (!listRes.isSuccessful) return@withContext 0
                val body = listRes.body?.string() ?: return@withContext 0
                val messages = JSONObject(body).optJSONArray("messages") ?: return@withContext 0

                for (i in 0 until minOf(messages.length(), limit)) {
                    val msgId = messages.getJSONObject(i).getString("id")
                    // Strictly call the TRASH endpoint (30-day recovery window)
                    val trashReq = Request.Builder()
                        .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/$msgId/trash")
                        .header("Authorization", "Bearer $token")
                        .post("{}".toRequestBody("application/json".toMediaType()))
                        .build()
                    val trashRes = client.newCall(trashReq).execute()
                    if (trashRes.isSuccessful) {
                        trashedCount++
                    }
                }
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Error moving messages to trash", e)
            }
            trashedCount
        }

        suspend fun trashSingleEmail(token: String, messageId: String): Boolean = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).build()
                val trashReq = Request.Builder()
                    .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/$messageId/trash")
                    .header("Authorization", "Bearer $token")
                    .post("{}".toRequestBody("application/json".toMediaType()))
                    .build()
                val trashRes = client.newCall(trashReq).execute()
                trashRes.isSuccessful
            } catch (e: Exception) {
                Log.e("ContrilBackend", "Error moving message to trash", e)
                false
            }
        }
    }

    private fun parseGmailMessages(jsonBody: String, authToken: String): List<EmailSummary> {
        val gObj = JSONObject(jsonBody)
        val msgArray = gObj.optJSONArray("messages") ?: JSONArray()
        val emails = mutableListOf<EmailSummary>()

        for (i in 0 until msgArray.length()) {
            val item = msgArray.getJSONObject(i)
            val msgId = item.optString("id")

            val detailReq = Request.Builder()
                .url("https://gmail.googleapis.com/gmail/v1/users/me/messages/$msgId?format=metadata")
                .header("Authorization", "Bearer $authToken")
                .get()
                .build()
            val detailRes = httpClient.newCall(detailReq).execute()
            if (detailRes.isSuccessful) {
                val dObj = JSONObject(detailRes.body?.string() ?: "")
                val snippet = dObj.optString("snippet", "")
                val headers = dObj.optJSONObject("payload")?.optJSONArray("headers") ?: JSONArray()
                var subject = "(No Subject)"
                var sender = "Unknown"
                for (h in 0 until headers.length()) {
                    val header = headers.getJSONObject(h)
                    val name = header.optString("name")
                    if (name.equals("Subject", ignoreCase = true)) subject = header.optString("value")
                    if (name.equals("From", ignoreCase = true)) sender = header.optString("value")
                }
                emails.add(
                    EmailSummary(
                        id = msgId,
                        sender = sender,
                        subject = subject,
                        summarySnippet = snippet,
                        isUrgent = true,
                        hasDraftReady = false
                    )
                )
            }
        }
        return emails
    }

    suspend fun fetchGmailInbox(sessionToken: String = ""): ApiResult<List<EmailSummary>> {
        return fetchGmailInboxSummaries(sessionToken)
    }

    /**
     * Fetch real sanitized Gmail inbox summaries from Google API or backend
     */
    suspend fun fetchGmailInboxSummaries(sessionToken: String = ""): ApiResult<List<EmailSummary>> = withContext(Dispatchers.IO) {
        try {
            val token = getOrRefreshGoogleToken() ?: sessionToken
            if (token.isBlank()) {
                return@withContext ApiResult.Success(emptyList())
            }

            // Direct query to Gmail API
            val googleReq = Request.Builder()
                .url("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            val googleRes = httpClient.newCall(googleReq).execute()
            if (googleRes.isSuccessful) {
                val gBody = googleRes.body?.string() ?: ""
                val emails = parseGmailMessages(gBody, token)
                return@withContext ApiResult.Success(emails)
            }

            if (googleRes.code == 401) {
                // If direct query got 401, try one retry after forceful refresh
                val refreshed = getOrRefreshGoogleToken()
                if (refreshed != null && refreshed != token) {
                    val retryReq = Request.Builder()
                        .url("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread")
                        .header("Authorization", "Bearer $refreshed")
                        .get()
                        .build()
                    val retryRes = httpClient.newCall(retryReq).execute()
                    if (retryRes.isSuccessful) {
                        val retryBody = retryRes.body?.string() ?: ""
                        val emails = parseGmailMessages(retryBody, refreshed)
                        return@withContext ApiResult.Success(emails)
                    }
                }
                return@withContext ApiResult.Error("Gmail authorization expired. Please reconnect in Connected Services.", isAuthExpired = true)
            }

            ApiResult.Success(emptyList())
        } catch (e: Exception) {
            Log.e("ContrilBackend", "Error fetching Gmail inbox", e)
            ApiResult.Success(emptyList())
        }
    }

    /**
     * Fetch real sanitized Calendar events from Google API or backend
     */
    suspend fun fetchCalendarEvents(sessionToken: String = ""): ApiResult<List<MeetingItem>> = withContext(Dispatchers.IO) {
        try {
            val token = getOrRefreshGoogleToken() ?: sessionToken
            if (token.isBlank()) {
                return@withContext ApiResult.Success(emptyList())
            }

            val googleReq = Request.Builder()
                .url("https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2026-01-01T00:00:00Z&maxResults=10&singleEvents=true&orderBy=startTime")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            val googleRes = httpClient.newCall(googleReq).execute()
            if (googleRes.isSuccessful) {
                val gObj = JSONObject(googleRes.body?.string() ?: "")
                val items = gObj.optJSONArray("items") ?: JSONArray()
                val meetings = mutableListOf<MeetingItem>()
                for (i in 0 until items.length()) {
                    val item = items.getJSONObject(i)
                    val start = item.optJSONObject("start")?.optString("dateTime")
                        ?: item.optJSONObject("start")?.optString("date")
                        ?: "Upcoming"
                    meetings.add(
                        MeetingItem(
                            id = item.optString("id", "meet_$i"),
                            title = item.optString("summary", "Event"),
                            timeRange = start,
                            attendees = listOf("Attendees"),
                            locationOrLink = item.optString("hangoutLink", "Google Meet"),
                            hasConflict = false,
                            briefingReady = true
                        )
                    )
                }
                return@withContext ApiResult.Success(meetings)
            }

            ApiResult.Success(emptyList())
        } catch (e: Exception) {
            Log.e("ContrilBackend", "Error fetching Calendar events", e)
            ApiResult.Success(emptyList())
        }
    }

    /**
     * Authoritative Subscription & Entitlement Sync from Supabase
     */
    suspend fun fetchUserEffectiveSubscription(userId: String): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val reqBody = JSONObject().apply {
                put("p_user_id", userId)
            }
            val token = prefRepository?.userSessionToken?.value
            val authHeader = if (!token.isNullOrBlank()) "Bearer $token" else "Bearer $anonKey"

            val req = Request.Builder()
                .url("$baseUrl/rest/v1/rpc/get_user_effective_plan")
                .header("apikey", anonKey)
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json")
                .post(reqBody.toString().toRequestBody(jsonMediaType))
                .build()

            val res = httpClient.newCall(req).execute()
            val body = res.body?.string() ?: ""
            if (res.isSuccessful && body.isNotBlank()) {
                val json = JSONObject(body)
                val effectivePlan = json.optString("effective_plan", "Free")
                val status = json.optString("status", "active")
                val expiresAt = json.optString("expires_at", "")
                val remainingFormatted = json.optString("remaining_formatted", "")

                prefRepository?.setPlan(if (effectivePlan.equals("elite", true)) "Autonomous Elite" else if (effectivePlan.equals("pro", true)) "Contril Pro" else "Free")
                prefRepository?.saveSubscriptionMetadata(status = status, expiresAt = expiresAt, remainingFormatted = remainingFormatted)
                return@withContext json
            }
        } catch (e: Exception) {
            Log.w("ContrilBackend", "Subscription sync error: ${e.message}")
        }
        null
    }
}

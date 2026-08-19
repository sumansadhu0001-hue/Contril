package com.contril.app.service

import android.content.Context
import android.util.Log
import com.contril.app.data.model.ActivityEventType
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.time.Instant
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Real-Time Admin Notification Synchronization Engine.
 * Actively monitors Supabase `notifications` table for broadcasts and direct admin pushes,
 * displaying high-priority Android system notifications and syncing them to the Unified Feed.
 */
object NotificationSyncEngine {

    private const val TAG = "NotificationSyncEngine"
    private const val SUPABASE_URL = "https://qjyowojnvbfezznezxrr.supabase.co"
    private const val ANON_KEY = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"

    private val isRunning = AtomicBoolean(false)
    private var syncJob: Job? = null

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    fun start(context: Context) {
        if (isRunning.getAndSet(true)) {
            Log.d(TAG, "NotificationSyncEngine is already active.")
            return
        }

        Log.i(TAG, "Starting Real-Time NotificationSyncEngine...")
        syncJob = CoroutineScope(Dispatchers.IO).launch {
            val appContext = context.applicationContext
            val prefRepo = PreferenceRepository(appContext)
            val prefs = appContext.getSharedPreferences("contril_notification_sync", Context.MODE_PRIVATE)

            // Initial baseline timestamp: default to 15 minutes ago on startup so recent admin notifications are displayed
            var lastSeenTimestamp = prefs.getLong("last_seen_notification_ts", 0L)
            if (lastSeenTimestamp == 0L) {
                lastSeenTimestamp = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(15)
                prefs.edit().putLong("last_seen_notification_ts", lastSeenTimestamp).apply()
            }

            while (isActive) {
                try {
                    pollAndDispatchNotifications(appContext, prefRepo, prefs)
                } catch (e: Exception) {
                    Log.w(TAG, "Error in notification polling loop: ${e.message}")
                }
                delay(6000L) // Poll every 6 seconds for instantaneous real-time delivery
            }
        }
    }

    fun stop() {
        isRunning.set(false)
        syncJob?.cancel()
        syncJob = null
        Log.i(TAG, "NotificationSyncEngine stopped.")
    }

    suspend fun pollOnce(context: Context) = withContext(Dispatchers.IO) {
        val appContext = context.applicationContext
        val prefRepo = PreferenceRepository(appContext)
        val prefs = appContext.getSharedPreferences("contril_notification_sync", Context.MODE_PRIVATE)
        pollAndDispatchNotifications(appContext, prefRepo, prefs)
    }

    private fun pollAndDispatchNotifications(
        context: Context,
        prefRepo: PreferenceRepository,
        prefs: android.content.SharedPreferences
    ) {
        val lastSeenTs = prefs.getLong("last_seen_notification_ts", System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(15))
        val seenIds = prefs.getStringSet("seen_notification_ids", emptySet())?.toMutableSet() ?: mutableSetOf()

        val url = "$SUPABASE_URL/rest/v1/notifications?order=created_at.desc&limit=10"
        val request = Request.Builder()
            .url(url)
            .header("apikey", ANON_KEY)
            .header("Authorization", "Bearer $ANON_KEY")
            .header("Content-Type", "application/json")
            .get()
            .build()

        val response = httpClient.newCall(request).execute()
        val responseBody = response.body?.string() ?: return

        if (!response.isSuccessful) {
            Log.w(TAG, "Supabase notifications fetch returned HTTP ${response.code}")
            return
        }

        val jsonArray = JSONArray(responseBody)
        var maxObservedTs = lastSeenTs

        for (i in 0 until jsonArray.length()) {
            val item = jsonArray.getJSONObject(i)
            val id = item.optString("id", "")
            val title = item.optString("title", "Contril Executive Alert")
            val message = item.optString("message", "")
            val createdAtStr = item.optString("created_at", "")

            if (id.isBlank() || message.isBlank() || seenIds.contains(id)) {
                continue
            }

            val createdEpochMs = try {
                Instant.parse(createdAtStr).toEpochMilli()
            } catch (_: Exception) {
                System.currentTimeMillis()
            }

            // If this is a new notification after the last seen timestamp
            if (createdEpochMs >= lastSeenTs) {
                Log.i(TAG, "🚀 New Admin Notification Received: [$title] $message (ID: $id)")

                // 1. Trigger High-Priority Android OS Notification
                ContrilFirebaseMessagingService.showNotification(
                    context = context,
                    title = title,
                    body = message,
                    data = mapOf("notification_id" to id, "type" to item.optString("type", "admin_push"))
                )

                // 2. Add to Unified Activity & Notification Feed
                prefRepo.addActivityLog(
                    OvernightActivityLog(
                        id = id,
                        timestamp = createdEpochMs,
                        eventType = ActivityEventType.EMAILS_SCANNED,
                        title = title,
                        description = message
                    )
                )

                seenIds.add(id)
                if (createdEpochMs > maxObservedTs) {
                    maxObservedTs = createdEpochMs
                }
            }
        }

        // Save progress
        prefs.edit()
            .putLong("last_seen_notification_ts", maxObservedTs)
            .putStringSet("seen_notification_ids", seenIds.toList().takeLast(100).toSet())
            .apply()
    }
}

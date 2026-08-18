package com.contril.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.contril.app.MainActivity
import com.contril.app.R
import com.contril.app.data.api.ContrilBackendClient
import com.contril.app.data.api.GeminiClient
import com.contril.app.data.model.ActivityEventType
import com.contril.app.data.model.ExtractedEvent
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.data.model.OvernightServiceState
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject

class OvernightAutonomyService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private lateinit var prefRepository: PreferenceRepository

    companion object {
        const val CHANNEL_ID = "contril_overnight_channel"
        const val ALERTS_CHANNEL_ID = "contril_alerts_channel"
        const val NOTIFICATION_ID = 9001
        const val ACTION_START_MONITORING = "com.contril.app.action.START_OVERNIGHT"
        const val ACTION_STOP_MONITORING = "com.contril.app.action.STOP_OVERNIGHT"

        fun startService(context: Context) {
            val intent = Intent(context, OvernightAutonomyService::class.java).apply {
                action = ACTION_START_MONITORING
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, OvernightAutonomyService::class.java).apply {
                action = ACTION_STOP_MONITORING
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        prefRepository = PreferenceRepository(applicationContext)
        createNotificationChannels()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_MONITORING) {
            stopMonitoringService()
            return START_NOT_STICKY
        }

        if (!prefRepository.isElitePlan()) {
            Log.w("OvernightService", "Overnight Autonomy is restricted to Elite plan. Terminating service.")
            prefRepository.setOvernightAutonomyEnabled(false)
            stopMonitoringService()
            return START_NOT_STICKY
        }

        val notification = buildForegroundNotification("Active • Monitoring inbox, meetings & deadlines")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        prefRepository.updateOvernightServiceState { it.copy(isRunning = true) }
        startMonitoringLoop()

        return START_STICKY
    }

    private fun startMonitoringLoop() {
        serviceScope.launch {
            Log.d("OvernightService", "Overnight Autonomy Monitoring Loop started.")
            
            // Auto-purge logs older than 30 days on loop start
            prefRepository.purgeOldActivityLogs(days = 30)

            while (isActive && prefRepository.isOvernightAutonomyEnabled.value && prefRepository.isElitePlan()) {
                try {
                    performAutonomousCycle()
                } catch (e: Throwable) {
                    Log.e("OvernightService", "Error during autonomous cycle: ${e.message}", e)
                }

                // 20 minutes interval (1,200,000 ms)
                val intervalMs = 20 * 60 * 1000L
                val steps = 20
                val stepDelay = intervalMs / steps
                for (i in 0 until steps) {
                    if (!isActive || !prefRepository.isOvernightAutonomyEnabled.value) break
                    delay(stepDelay)
                }
            }

            stopSelf()
        }
    }

    private suspend fun performAutonomousCycle() {
        val state = prefRepository.overnightServiceState.value
        val maxBudget = state.tokenBudgetMax

        // Check overnight token budget
        if (state.tokensUsedTonight >= maxBudget) {
            Log.w("OvernightService", "Overnight token budget limit reached (${state.tokensUsedTonight}/$maxBudget). Pausing.")
            prefRepository.addActivityLog(
                OvernightActivityLog(
                    eventType = ActivityEventType.TOKEN_BUDGET_EXHAUSTED,
                    title = "Overnight Token Budget Reached",
                    description = "Capped at $maxBudget tokens for tonight. Autonomous actions paused until morning.",
                    tokensConsumed = 0
                )
            )
            postAlertNotification(
                id = 9002,
                title = "Overnight Monitoring Paused",
                body = "Daily token limit ($maxBudget tokens) reached. Autonomous actions paused."
            )
            return
        }

        prefRepository.addActivityLog(
            OvernightActivityLog(
                eventType = ActivityEventType.SCAN_STARTED,
                title = "Inbox Scan Cycle Started",
                description = "Checking for new unread messages and scheduling requests..."
            )
        )

        val providerToken = prefRepository.getGoogleProviderToken()
        if (providerToken.isNullOrBlank()) {
            Log.d("OvernightService", "No active Google provider token available.")
            return
        }

        val (emails, _) = ContrilBackendClient.fetchDirectGmailPage(providerToken, pageToken = null, maxResults = 10)
        if (emails.isEmpty()) {
            prefRepository.addActivityLog(
                OvernightActivityLog(
                    eventType = ActivityEventType.NO_NEW_EMAILS,
                    title = "Inbox Clean",
                    description = "No new unread messages detected in this cycle."
                )
            )
            return
        }

        var tokensUsedInCycle = 0
        var meetingsFound = 0
        var draftsCreated = 0
        var repliesAutoSent = 0

        for (email in emails) {
            if (prefRepository.hasExtractedForEmail(email.id)) {
                continue
            }

            if (state.tokensUsedTonight + tokensUsedInCycle >= maxBudget) {
                break
            }

            tokensUsedInCycle += 1

            val prompt = """
                Analyze this email for executive triage.
                Sender: ${email.sender}
                Subject: ${email.subject}
                Snippet: ${email.summarySnippet}

                Respond ONLY with a valid JSON object matching this schema:
                {
                  "is_meeting_or_deadline": boolean,
                  "meeting_title": string or null,
                  "date_time": string or null,
                  "confidence": "HIGH" or "MEDIUM" or "LOW",
                  "is_urgent_response_required": boolean,
                  "suggested_reply": string or null
                }
            """.trimIndent()

            val aiResult = GeminiClient.generateContent(prompt).getOrNull()
            if (!aiResult.isNullOrBlank()) {
                try {
                    val cleanJson = aiResult.replace("```json", "").replace("```", "").trim()
                    val json = JSONObject(cleanJson)

                    val isMeeting = json.optBoolean("is_meeting_or_deadline", false)
                    val meetingTitle = json.optString("meeting_title", email.subject)
                    val dateTime = json.optString("date_time", "Upcoming")
                    val confidence = json.optString("confidence", "MEDIUM")
                    val isUrgent = json.optBoolean("is_urgent_response_required", false)
                    val suggestedReply = json.optString("suggested_reply", null)

                    // 1. Handle Meeting/Deadline extraction
                    if (isMeeting && confidence != "LOW" && !dateTime.isNullOrBlank() && dateTime != "null") {
                        meetingsFound += 1
                        val event = ExtractedEvent(
                            title = meetingTitle,
                            dateOrDeadline = dateTime,
                            sender = email.sender,
                            sourceEmailId = email.id,
                            confidence = confidence
                        )
                        prefRepository.addExtractedEvent(event)
                        prefRepository.addActivityLog(
                            OvernightActivityLog(
                                eventType = ActivityEventType.MEETING_EXTRACTED,
                                title = "Meeting Extracted: $meetingTitle",
                                description = "Scheduled: $dateTime from ${email.sender}",
                                emailSender = email.sender,
                                emailSubject = email.subject,
                                tokensConsumed = 1
                            )
                        )
                        postAlertNotification(
                            id = email.id.hashCode(),
                            title = "Meeting Detected: $meetingTitle",
                            body = "Time: $dateTime • From: ${email.sender}"
                        )
                    }

                    // 2. Handle Urgent Response Requirement (Strict adherence to Auto-Send Mode)
                    if (isUrgent && !suggestedReply.isNullOrBlank() && suggestedReply != "null") {
                        val isAutoSendOn = prefRepository.isAutoSendEnabled.value
                        if (isAutoSendOn) {
                            // AUTO-SEND MODE IS ON: Dispatch reply and log
                            val (sendSuccess, _) = ContrilBackendClient.sendGmailReplyResult(
                                token = providerToken,
                                threadId = email.threadId,
                                to = email.sender,
                                subject = email.subject,
                                body = suggestedReply
                            )
                            if (sendSuccess) {
                                repliesAutoSent += 1
                                prefRepository.addActivityLog(
                                    OvernightActivityLog(
                                        eventType = ActivityEventType.REPLY_AUTO_SENT,
                                        title = "Auto-Reply Sent: ${email.subject}",
                                        description = "Autonomous response sent to ${email.sender}",
                                        emailSender = email.sender,
                                        emailSubject = email.subject,
                                        payloadSnippet = suggestedReply,
                                        tokensConsumed = 1
                                    )
                                )
                                postAlertNotification(
                                    id = (email.id + "_sent").hashCode(),
                                    title = "Auto-Sent Reply: ${email.subject}",
                                    body = "Sent reply to ${email.sender}"
                                )
                            }
                        } else {
                            // AUTO-SEND MODE IS OFF (DEFAULT): Create draft for morning review, do NOT send
                            draftsCreated += 1
                            prefRepository.addActivityLog(
                                OvernightActivityLog(
                                    eventType = ActivityEventType.DRAFT_CREATED,
                                    title = "Draft Reply Ready: ${email.subject}",
                                    description = "AI draft prepared for your morning review. Awaiting manual confirmation.",
                                    emailSender = email.sender,
                                    emailSubject = email.subject,
                                    payloadSnippet = suggestedReply,
                                    tokensConsumed = 1
                                )
                            )
                            postAlertNotification(
                                id = (email.id + "_draft").hashCode(),
                                title = "Draft Reply Ready for Review",
                                body = "Urgent email from ${email.sender}: '${email.subject}'"
                            )
                        }
                    }
                } catch (jsonErr: Throwable) {
                    Log.e("OvernightService", "Failed to parse AI response: ${jsonErr.message}")
                }
            }
        }

        prefRepository.updateOvernightServiceState {
            it.copy(
                lastScanTime = System.currentTimeMillis(),
                tokensUsedTonight = it.tokensUsedTonight + tokensUsedInCycle,
                unreadProcessedCount = it.unreadProcessedCount + emails.size,
                meetingsFoundCount = it.meetingsFoundCount + meetingsFound,
                draftsCreatedCount = it.draftsCreatedCount + draftsCreated,
                repliesAutoSentCount = it.repliesAutoSentCount + repliesAutoSent
            )
        }
    }

    private fun buildForegroundNotification(statusText: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, OvernightAutonomyService::class.java).apply {
            action = ACTION_STOP_MONITORING
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Contril is monitoring your inbox")
            .setContentText(statusText)
            .setSmallIcon(R.drawable.ic_notification_contril)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(openAppPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Monitoring", stopPendingIntent)
            .build()
    }

    private fun postAlertNotification(id: Int, title: String, body: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val alert = NotificationCompat.Builder(this, ALERTS_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_notification_contril)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(id, alert)
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val monitorChannel = NotificationChannel(
                CHANNEL_ID,
                "Overnight Autonomy Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent indicator while Contril monitors overnight"
                setShowBadge(false)
            }

            val alertsChannel = NotificationChannel(
                ALERTS_CHANNEL_ID,
                "Contril Executive Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High-priority meeting extractions and draft reviews"
                setShowBadge(true)
                enableVibration(true)
            }

            notificationManager.createNotificationChannel(monitorChannel)
            notificationManager.createNotificationChannel(alertsChannel)
        }
    }

    private fun stopMonitoringService() {
        prefRepository.setOvernightAutonomyEnabled(false)
        prefRepository.updateOvernightServiceState { it.copy(isRunning = false) }
        serviceJob.cancel()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        serviceJob.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

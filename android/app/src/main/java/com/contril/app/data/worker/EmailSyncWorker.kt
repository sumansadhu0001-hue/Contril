package com.contril.app.data.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.contril.app.MainActivity
import com.contril.app.data.api.ContrilBackendClient
import com.contril.app.data.repository.PreferenceRepository

class EmailSyncWorker(
    private val appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        const val WORK_NAME = "contril_periodic_email_sync"
        const val CHANNEL_ID = "contril_priority_emails"
        private const val TAG = "EmailSyncWorker"
    }

    override suspend fun doWork(): Result {
        Log.i(TAG, "Starting periodic background email synchronization...")

        val prefRepository = PreferenceRepository(appContext)
        val token = prefRepository.getGoogleProviderToken()

        if (token.isNullOrBlank()) {
            Log.d(TAG, "No active Google token found; skipping sync.")
            return Result.success()
        }

        try {
            val emails = ContrilBackendClient.fetchDirectGmailMessages(token)
            val unreadPriority = emails.filter { it.unread && it.isUrgent }

            for (email in unreadPriority) {
                if (!prefRepository.isEmailNotified(email.id)) {
                    postPriorityNotification(email.sender, email.subject, email.id)
                    prefRepository.markEmailNotified(email.id)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Background email sync check error", e)
        }

        return Result.success()
    }

    private fun postPriorityNotification(sender: String, subject: String, emailId: String) {
        val notificationManager = appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Contril Priority Emails",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifies when high-priority incoming emails require executive attention."
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(appContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            data = Uri.parse("contril://inbox?emailId=$emailId")
        }

        val pendingIntent = PendingIntent.getActivity(
            appContext,
            emailId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setSmallIcon(com.contril.app.R.drawable.ic_notification_contril)
            .setContentTitle("Contril Priority: $sender")
            .setContentText(subject)
            .setStyle(NotificationCompat.BigTextStyle().bigText("From: $sender\nSubject: $subject"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(emailId.hashCode(), notification)
    }
}

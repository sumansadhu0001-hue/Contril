package com.contril.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log

class ContrilApplication : Application() {

    companion object {
        const val CHANNEL_ID_ALERTS = "contril_action_alerts"
        const val CHANNEL_ID_BRIEFINGS = "contril_daily_briefings"
    }

    override fun onCreate() {
        super.onCreate()
        try {
            createNotificationChannels()
            schedulePeriodicEmailSync()
            com.contril.app.service.NotificationSyncEngine.start(this)
        } catch (e: Exception) {
            Log.e("ContrilApp", "Failed to initialize app components: ${e.message}", e)
        }
    }

    private fun schedulePeriodicEmailSync() {
        try {
            val constraints = androidx.work.Constraints.Builder()
                .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                .build()

            val workRequest = androidx.work.PeriodicWorkRequestBuilder<com.contril.app.data.worker.EmailSyncWorker>(
                15, java.util.concurrent.TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .build()

            androidx.work.WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                com.contril.app.data.worker.EmailSyncWorker.WORK_NAME,
                androidx.work.ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
            Log.i("ContrilApp", "Periodic EmailSyncWorker enqueued successfully.")
        } catch (e: Exception) {
            Log.w("ContrilApp", "Failed to schedule EmailSyncWorker: ${e.message}")
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val actionChannel = NotificationChannel(
                CHANNEL_ID_ALERTS,
                "Action Approvals & Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High-priority notifications for sensitive action approvals"
                enableLights(true)
                enableVibration(true)
            }

            val briefingChannel = NotificationChannel(
                CHANNEL_ID_BRIEFINGS,
                "Daily Intelligence Briefings",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Morning summaries and daily priority updates"
            }

            notificationManager.createNotificationChannel(actionChannel)
            notificationManager.createNotificationChannel(briefingChannel)
        }
    }
}

package com.contril.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class ContrilApplication : Application() {

    companion object {
        const val CHANNEL_ID_ALERTS = "contril_action_alerts"
        const val CHANNEL_ID_BRIEFINGS = "contril_daily_briefings"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

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

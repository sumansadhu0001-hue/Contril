package com.contril.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.contril.app.MainActivity
import com.contril.app.R
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Contril Real-Time Push Notification Engine (Firebase Cloud Messaging + Supabase Device Token Sync)
 */
class ContrilFirebaseMessagingService {

    companion object {
        const val TAG = "ContrilFCM"
        const val FCM_CHANNEL_ID = "contril_push_channel"

        /**
         * Synchronizes device push registration token to Supabase device_tokens table
         */
        fun registerDeviceToken(context: Context, token: String) {
            val prefRepository = PreferenceRepository(context.applicationContext)
            val user = prefRepository.getUserProfile()
            val userId = user?.id ?: "anonymous_device"
            val email = user?.email ?: "unregistered"
            registerDeviceTokenDirect(userId, email, token)
        }

        fun registerDeviceTokenDirect(userId: String, email: String, token: String) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val client = OkHttpClient()
                    val jsonMediaType = "application/json; charset=utf-8".toMediaType()
                    val payload = JSONObject().apply {
                        put("user_id", userId)
                        put("email", email)
                        put("fcm_token", token)
                        put("device_type", "android")
                        put("updated_at", java.time.Instant.now().toString())
                    }
                    val req = Request.Builder()
                        .url("https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/device_tokens?on_conflict=fcm_token")
                        .header("apikey", "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT")
                        .header("Authorization", "Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT")
                        .header("Content-Type", "application/json")
                        .header("Prefer", "resolution=merge-duplicates")
                        .post(payload.toString().toRequestBody(jsonMediaType))
                        .build()
                    val res = client.newCall(req).execute()
                    val responseBody = res.body?.string()
                    Log.i(TAG, "Device token registered with Supabase: HTTP ${res.code} - Body: $responseBody")
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to register FCM device token: ${e.message}")
                }
            }
        }

        fun showNotification(context: Context, title: String, body: String, data: Map<String, String> = emptyMap()) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    FCM_CHANNEL_ID,
                    "Contril Executive Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Real-time alerts for priority emails, meeting briefs & plan approvals"
                }
                notificationManager.createNotificationChannel(channel)
            }

            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                data.forEach { (k, v) -> putExtra(k, v) }
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val notification = NotificationCompat.Builder(context, FCM_CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .build()

            notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), notification)
        }
    }
}

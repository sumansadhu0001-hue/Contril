package com.contril.app.ui.components

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.contril.app.data.automation.ContrilAccessibilityService
import com.contril.app.data.repository.PreferenceRepository

enum class ContrilCapability(
    val id: String,
    val title: String,
    val category: String,
    val description: String,
    val plainEnglishRationale: String,
    val riskLevel: String // "Low", "Medium", "High"
) {
    ACCESSIBILITY_AUTOMATION(
        id = "accessibility",
        title = "On-Device App Automation",
        category = "Automation",
        description = "Inspects product prices across installed food & shopping apps in real time.",
        plainEnglishRationale = "Contril opens your installed shopping/food apps, searches on-screen for the exact item you requested, and brings the best deal back to your screen. No passwords or private chats are ever recorded.",
        riskLevel = "Medium"
    ),
    GMAIL_READ(
        id = "gmail_read",
        title = "Gmail Read Access",
        category = "Communication",
        description = "Reads unread message headers and snippets to generate morning executive briefings.",
        plainEnglishRationale = "Contril scans incoming executive emails to highlight urgent threads and pending approvals. Your emails remain strictly private on your device.",
        riskLevel = "Medium"
    ),
    GMAIL_SEND(
        id = "gmail_send",
        title = "Gmail Send Authorization",
        category = "High-Risk Action",
        description = "Allows Contril to dispatch drafted emails after your explicit tap approval.",
        plainEnglishRationale = "When you instruct Contril to send an email, Contril prepares the exact text and recipient for your review. No email is sent without your manual confirmation.",
        riskLevel = "High"
    ),
    CALENDAR_READ(
        id = "calendar_read",
        title = "Calendar Schedule Access",
        category = "Productivity",
        description = "Reads upcoming meetings to synthesize your daily agenda and detect schedule conflicts.",
        plainEnglishRationale = "Contril accesses your Google Calendar events to give you a clear daily itinerary and meeting preparation notes.",
        riskLevel = "Low"
    ),
    BACKGROUND_EXECUTION(
        id = "background_service",
        title = "Night Mode & Background Processing",
        category = "System",
        description = "Runs autonomous morning briefing preparation before your workday begins.",
        plainEnglishRationale = "Allows Contril to prepare your daily briefing and sync urgent items silently overnight so your summary is ready the moment you wake up.",
        riskLevel = "Low"
    ),
    NOTIFICATIONS(
        id = "notifications",
        title = "Push Notifications & Urgent Alerts",
        category = "Alerts",
        description = "Delivers urgent action item notifications and briefing alerts.",
        plainEnglishRationale = "Contril notifies you when an action requires your immediate executive approval or when your daily briefing is ready.",
        riskLevel = "Low"
    )
}

object PermissionManager {

    fun isCapabilityGranted(context: Context, capability: ContrilCapability, prefRepository: PreferenceRepository?): Boolean {
        return when (capability) {
            ContrilCapability.ACCESSIBILITY_AUTOMATION -> ContrilAccessibilityService.isServiceEnabled(context)
            ContrilCapability.NOTIFICATIONS -> hasNotificationPermission(context)
            ContrilCapability.GMAIL_READ -> prefRepository?.isPermissionGranted("gmail_read") ?: true
            ContrilCapability.GMAIL_SEND -> prefRepository?.isPermissionGranted("gmail_send") ?: false
            ContrilCapability.CALENDAR_READ -> prefRepository?.isPermissionGranted("calendar_read") ?: true
            ContrilCapability.BACKGROUND_EXECUTION -> prefRepository?.isPermissionGranted("background_service") ?: false
        }
    }

    fun hasRecordAudioPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun openAccessibilitySettings(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {}
    }

    fun openAppSettings(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", context.packageName, null)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {}
    }
}

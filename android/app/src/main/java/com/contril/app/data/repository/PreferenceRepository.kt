package com.contril.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.contril.app.data.model.ActivityEventType
import com.contril.app.data.model.AutonomyMode
import com.contril.app.data.model.EmailSummary
import com.contril.app.data.model.ExtractedEvent
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.data.model.OvernightServiceState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class PreferenceRepository(context: Context? = null) {

    private val prefs: SharedPreferences? = try {
        context?.getSharedPreferences("contril_native_prefs", Context.MODE_PRIVATE)
    } catch (e: Throwable) {
        Log.e("ContrilPref", "Failed to access SharedPreferences: ${e.message}", e)
        null
    }

    private val _autonomyMode = MutableStateFlow(getSavedAutonomyMode())
    val autonomyMode: StateFlow<AutonomyMode> = _autonomyMode.asStateFlow()

    private val _isDarkTheme = MutableStateFlow(getSavedDarkTheme())
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    private val _isAutoSendEnabled = MutableStateFlow(getSavedAutoSendMode())
    val isAutoSendEnabled: StateFlow<Boolean> = _isAutoSendEnabled.asStateFlow()

    private val _isOvernightAutonomyEnabled = MutableStateFlow(getSavedOvernightAutonomyMode())
    val isOvernightAutonomyEnabled: StateFlow<Boolean> = _isOvernightAutonomyEnabled.asStateFlow()

    private val _overnightServiceState = MutableStateFlow(OvernightServiceState())
    val overnightServiceState: StateFlow<OvernightServiceState> = _overnightServiceState.asStateFlow()

    private val _activityLogs = MutableStateFlow(getSavedActivityLogs())
    val activityLogs: StateFlow<List<OvernightActivityLog>> = _activityLogs.asStateFlow()

    private val _extractedEvents = MutableStateFlow(getSavedExtractedEvents())
    val extractedEvents: StateFlow<List<ExtractedEvent>> = _extractedEvents.asStateFlow()

    private val _userSessionToken = MutableStateFlow(getSavedAuthToken())
    val userSessionToken: StateFlow<String?> = _userSessionToken.asStateFlow()

    private fun getSavedAutonomyMode(): AutonomyMode {
        return try {
            val saved = prefs?.getString("autonomy_mode", AutonomyMode.SENSITIVE_ONLY.name)
            AutonomyMode.valueOf(saved ?: AutonomyMode.SENSITIVE_ONLY.name)
        } catch (_: Throwable) {
            AutonomyMode.SENSITIVE_ONLY
        }
    }

    private fun getSavedDarkTheme(): Boolean {
        return try {
            prefs?.getBoolean("is_dark_theme", false) ?: false
        } catch (_: Throwable) {
            false
        }
    }

    fun getSavedAutoSendMode(): Boolean {
        return try {
            prefs?.getBoolean("contril_auto_send_mode_enabled", false) ?: false
        } catch (_: Throwable) {
            false
        }
    }

    fun setAutoSendEnabled(enabled: Boolean) {
        try {
            prefs?.edit()?.putBoolean("contril_auto_send_mode_enabled", enabled)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write autoSendMode: ${e.message}")
        }
        _isAutoSendEnabled.value = enabled
    }

    private fun getSavedAuthToken(): String? {
        return try {
            prefs?.getString("auth_token", null)
        } catch (_: Throwable) {
            null
        }
    }

    fun setAutonomyMode(mode: AutonomyMode) {
        try {
            prefs?.edit()?.putString("autonomy_mode", mode.name)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write autonomyMode: ${e.message}")
        }
        _autonomyMode.value = mode
    }

    fun setDarkTheme(isDark: Boolean) {
        try {
            prefs?.edit()?.putBoolean("is_dark_theme", isDark)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write darkTheme: ${e.message}")
        }
        _isDarkTheme.value = isDark
    }

    private val _currentUser = MutableStateFlow(getSavedUserProfile())
    val currentUser: StateFlow<com.contril.app.data.model.UserProfile?> = _currentUser.asStateFlow()

    fun getUserProfile(): com.contril.app.data.model.UserProfile? = _currentUser.value

    private fun getSavedUserProfile(): com.contril.app.data.model.UserProfile? {
        return try {
            val id = prefs?.getString("user_id", null) ?: return null
            val email = prefs?.getString("user_email", "") ?: ""
            val name = prefs?.getString("user_name", "") ?: ""
            val avatar = prefs?.getString("user_avatar", null)
            val createdAt = prefs?.getString("user_created_at", null)
            val hasCompleted = prefs?.getBoolean("has_completed_onboarding", false) ?: false
            val role = prefs?.getString("user_role", "Executive") ?: "Executive"
            val goalsStr = prefs?.getString("user_goals", "") ?: ""
            val goals = if (goalsStr.isNotBlank()) goalsStr.split(",").map { it.trim() } else emptyList()
            com.contril.app.data.model.UserProfile(
                id = id,
                email = email,
                name = name,
                avatarUrl = avatar,
                createdAt = createdAt,
                hasCompletedOnboarding = hasCompleted,
                role = role,
                goals = goals
            )
        } catch (_: Throwable) {
            null
        }
    }

    fun saveUserSession(token: String?, user: com.contril.app.data.model.UserProfile?) {
        try {
            val editor = prefs?.edit()
            if (token != null) {
                editor?.putString("auth_token", token)
            } else {
                editor?.remove("auth_token")
            }
            if (user != null) {
                editor?.putString("user_id", user.id)
                editor?.putString("user_email", user.email)
                editor?.putString("user_name", user.name)
                if (user.avatarUrl != null) {
                    editor?.putString("user_avatar", user.avatarUrl)
                } else {
                    editor?.remove("user_avatar")
                }
                if (user.createdAt != null) {
                    editor?.putString("user_created_at", user.createdAt)
                }
                if (user.hasCompletedOnboarding) {
                    editor?.putBoolean("has_completed_onboarding", true)
                    editor?.putString("user_role", user.role)
                    editor?.putString("user_goals", user.goals.joinToString(","))
                    _hasCompletedOnboarding.value = true
                    _userRole.value = user.role
                }
            } else {
                editor?.remove("user_id")
                editor?.remove("user_email")
                editor?.remove("user_name")
                editor?.remove("user_avatar")
                editor?.remove("user_created_at")
            }
            editor?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write user session: ${e.message}")
        }
        _userSessionToken.value = token
        _currentUser.value = user
    }

    fun getUserPhone(): String {
        return prefs?.getString("user_phone", "") ?: ""
    }

    fun setUserPhone(phone: String) {
        try {
            prefs?.edit()?.putString("user_phone", phone)?.apply()
        } catch (_: Throwable) {}
    }

    private val _connectedServices = MutableStateFlow<Map<String, String>>(getSavedConnectedServices())
    val connectedServices: StateFlow<Map<String, String>> = _connectedServices.asStateFlow()

    private fun getSavedConnectedServices(): Map<String, String> {
        val raw = prefs?.getString("connected_services_map", null) ?: return emptyMap()
        return try {
            raw.split(";").filter { it.contains(":") }.associate {
                val p = it.split(":")
                p[0] to p[1]
            }
        } catch (_: Exception) {
            emptyMap()
        }
    }

    fun connectService(serviceId: String, account: String) {
        val current = _connectedServices.value.toMutableMap()
        current[serviceId] = account
        saveConnectedServices(current)
    }

    fun disconnectService(serviceId: String) {
        val current = _connectedServices.value.toMutableMap()
        current.remove(serviceId)
        saveConnectedServices(current)
    }

    private fun saveConnectedServices(map: Map<String, String>) {
        val serialized = map.entries.joinToString(";") { "${it.key}:${it.value}" }
        try {
            prefs?.edit()?.putString("connected_services_map", serialized)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write connected services: ${e.message}")
        }
        _connectedServices.value = map
    }

    private val _tasks = MutableStateFlow<List<com.contril.app.data.model.TaskItem>>(getSavedTasks())
    val tasks: StateFlow<List<com.contril.app.data.model.TaskItem>> = _tasks.asStateFlow()

    private fun getSavedTasks(): List<com.contril.app.data.model.TaskItem> {
        val raw = prefs?.getString("persisted_tasks_json", null) ?: return emptyList()
        return try {
            val jsonArray = org.json.JSONArray(raw)
            val list = mutableListOf<com.contril.app.data.model.TaskItem>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(
                    com.contril.app.data.model.TaskItem(
                        id = obj.getString("id"),
                        title = obj.getString("title"),
                        dueDate = obj.optString("dueDate", "Today"),
                        category = obj.optString("category", "General"),
                        isCompleted = obj.optBoolean("isCompleted", false),
                        serviceSource = obj.optString("serviceSource", "Contril")
                    )
                )
            }
            list
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun saveTasks(taskList: List<com.contril.app.data.model.TaskItem>) {
        try {
            val jsonArray = org.json.JSONArray()
            taskList.forEach { task ->
                val obj = org.json.JSONObject().apply {
                    put("id", task.id)
                    put("title", task.title)
                    put("dueDate", task.dueDate)
                    put("category", task.category)
                    put("isCompleted", task.isCompleted)
                    put("serviceSource", task.serviceSource)
                }
                jsonArray.put(obj)
            }
            prefs?.edit()?.putString("persisted_tasks_json", jsonArray.toString())?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write tasks: ${e.message}")
        }
        _tasks.value = taskList
    }

    fun addTask(title: String, category: String = "Action", serviceSource: String = "Contril") {
        val current = _tasks.value.toMutableList()
        val newTask = com.contril.app.data.model.TaskItem(
            id = "task_${System.currentTimeMillis()}",
            title = title,
            dueDate = "Today",
            category = category,
            isCompleted = false,
            serviceSource = serviceSource
        )
        current.add(0, newTask)
        saveTasks(current)
    }

    fun toggleTask(taskId: String) {
        val current = _tasks.value.map {
            if (it.id == taskId) it.copy(isCompleted = !it.isCompleted) else it
        }
        saveTasks(current)
    }

    fun deleteTask(taskId: String) {
        val current = _tasks.value.filter { it.id != taskId }
        saveTasks(current)
    }

    private val _hasCompletedOnboarding = MutableStateFlow(getSavedOnboardingState())
    val hasCompletedOnboarding: StateFlow<Boolean> = _hasCompletedOnboarding.asStateFlow()

    private val _userRole = MutableStateFlow(getSavedUserRole())
    val userRole: StateFlow<String> = _userRole.asStateFlow()

    private fun getSavedOnboardingState(): Boolean {
        return prefs?.getBoolean("has_completed_onboarding", false) ?: false
    }

    private fun getSavedUserRole(): String {
        return prefs?.getString("user_role", "Executive") ?: "Executive"
    }

    fun setOnboardingCompleted(completed: Boolean, role: String = "Executive", goals: List<String> = emptyList()) {
        try {
            prefs?.edit()
                ?.putBoolean("has_completed_onboarding", completed)
                ?.putString("user_role", role)
                ?.putString("user_goals", goals.joinToString(","))
                ?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write onboarding state: ${e.message}")
        }
        _hasCompletedOnboarding.value = completed
        _userRole.value = role

        val token = _userSessionToken.value
        if (!token.isNullOrBlank()) {
            kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                try {
                    com.contril.app.data.api.SupabaseAuthClient.updateUserMetadata(
                        accessToken = token,
                        completed = completed,
                        role = role,
                        goals = goals,
                        fullName = _currentUser.value?.name
                    )
                } catch (e: Throwable) {
                    Log.w("ContrilPref", "Background onboarding metadata sync failed: ${e.message}")
                }
            }
        }
    }

    suspend fun syncOnboardingStatusFromCloud(): Boolean = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
        val token = _userSessionToken.value ?: return@withContext false
        try {
            val user = com.contril.app.data.api.SupabaseAuthClient.getUserProfile(token)
            if (user != null) {
                if (user.hasCompletedOnboarding) {
                    setOnboardingCompleted(true, user.role, user.goals)
                    saveUserSession(token, user)
                    return@withContext true
                }
            }
        } catch (e: Throwable) {
            Log.w("ContrilPref", "syncOnboardingStatusFromCloud error: ${e.message}")
        }
        false
    }

    suspend fun syncSubscriptionStatusFromCloud(): Boolean = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
        try {
            val subManager = com.contril.app.data.repository.SubscriptionRequestManager(this@PreferenceRepository)
            val result = subManager.checkBackendApprovalStatus()
            Log.i("ContrilPref", "syncSubscriptionStatusFromCloud completed: status=${result.status}, plan=${result.planName}, isPaid=${result.isPaidActive}")
            result.isPaidActive
        } catch (e: Throwable) {
            Log.w("ContrilPref", "syncSubscriptionStatusFromCloud error: ${e.message}")
            false
        }
    }

    fun updateUserRole(role: String) {
        try {
            prefs?.edit()?.putString("user_role", role)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write user role: ${e.message}")
        }
        _userRole.value = role
    }

    fun getSavedSubscriptionStatus(): com.contril.app.data.model.SubscriptionStatus {
        val raw = prefs?.getString("subscription_status", "FREE") ?: "FREE"
        return try {
            com.contril.app.data.model.SubscriptionStatus.valueOf(raw)
        } catch (_: Exception) {
            com.contril.app.data.model.SubscriptionStatus.FREE
        }
    }

    fun setSubscriptionStatus(status: com.contril.app.data.model.SubscriptionStatus) {
        try {
            prefs?.edit()?.putString("subscription_status", status.name)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write subscription status: ${e.message}")
        }
    }

    private val _currentPlan = MutableStateFlow(getSavedPlan())
    val currentPlan: StateFlow<String> = _currentPlan.asStateFlow()

    private fun getSavedPlan(): String {
        val saved = prefs?.getString("user_plan", null)
        if (!saved.isNullOrBlank()) return saved
        val status = getSavedSubscriptionStatus()
        return if (status == com.contril.app.data.model.SubscriptionStatus.ACTIVE_PRO) "Pro" else "Free"
    }

    fun setPlan(plan: String) {
        try {
            prefs?.edit()?.putString("user_plan", plan)?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write user plan: ${e.message}")
        }
        _currentPlan.value = plan
    }

    fun isElitePlan(): Boolean {
        val plan = _currentPlan.value
        return plan.contains("Elite", ignoreCase = true) || 
               plan.equals("Autonomous Elite", ignoreCase = true) ||
               plan.equals("Autonomous Pro", ignoreCase = true) ||
               plan.equals("Elite Plan", ignoreCase = true)
    }

    fun isProOrExecutive(): Boolean {
        val plan = _currentPlan.value
        if (isElitePlan()) return true
        if (plan.equals("Pro", ignoreCase = true) || plan.equals("Starter Executive", ignoreCase = true)) return true
        val status = getSavedSubscriptionStatus()
        return status == com.contril.app.data.model.SubscriptionStatus.ACTIVE_PRO
    }

    fun getTodayDateIST(): String {
        return try {
            val istZone = java.time.ZoneId.of("Asia/Kolkata")
            java.time.LocalDate.now(istZone).toString()
        } catch (_: Throwable) {
            java.time.LocalDate.now().toString()
        }
    }

    fun getPlanDailyTokenLimit(): Long {
        return when {
            isElitePlan() -> com.contril.app.data.config.PaymentConfig.ELITE_PLAN_DAYTIME_TOKENS
            isProOrExecutive() -> com.contril.app.data.config.PaymentConfig.PRO_PLAN_DAILY_TOKENS
            else -> com.contril.app.data.config.PaymentConfig.FREE_PLAN_DAILY_TOKENS
        }
    }

    fun getOvernightTokenLimit(): Long {
        return if (isElitePlan()) com.contril.app.data.config.PaymentConfig.ELITE_PLAN_OVERNIGHT_TOKENS else 0L
    }

    fun getTodayDaytimeTokensUsed(): Long {
        val today = getTodayDateIST()
        val savedDate = prefs?.getString("token_usage_date", "") ?: ""
        return if (savedDate == today) {
            prefs?.getLong("daytime_tokens_used", 0L) ?: 0L
        } else {
            0L
        }
    }

    fun getTodayOvernightTokensUsed(): Long {
        val today = getTodayDateIST()
        val savedDate = prefs?.getString("token_usage_date", "") ?: ""
        return if (savedDate == today) {
            prefs?.getLong("overnight_tokens_used", 0L) ?: 0L
        } else {
            0L
        }
    }

    private val _aiTokenUsageFlow = MutableStateFlow(getTodayDaytimeTokensUsed())
    val aiTokenUsageFlow: StateFlow<Long> = _aiTokenUsageFlow.asStateFlow()

    fun getTodayAiUsage(): Pair<Int, Int> {
        val used = getTodayDaytimeTokensUsed().coerceAtMost(Int.MAX_VALUE.toLong()).toInt()
        val limit = getPlanDailyTokenLimit().coerceAtMost(Int.MAX_VALUE.toLong()).toInt()
        return Pair(used, limit)
    }

    fun canExecuteAiAction(isOvernight: Boolean = false, minRequired: Long = 500L): Boolean {
        return if (isOvernight) {
            if (!isElitePlan()) return false
            val used = getTodayOvernightTokensUsed()
            val limit = getOvernightTokenLimit()
            (limit - used) >= minRequired
        } else {
            val used = getTodayDaytimeTokensUsed()
            val limit = getPlanDailyTokenLimit()
            (limit - used) >= minRequired
        }
    }

    fun recordAiTokenUsage(tokensConsumed: Long, isOvernight: Boolean = false): Boolean {
        val today = getTodayDateIST()
        val savedDate = prefs?.getString("token_usage_date", "") ?: ""
        
        var daytimeUsed = if (savedDate == today) prefs?.getLong("daytime_tokens_used", 0L) ?: 0L else 0L
        var overnightUsed = if (savedDate == today) prefs?.getLong("overnight_tokens_used", 0L) ?: 0L else 0L

        if (isOvernight) {
            overnightUsed += tokensConsumed
        } else {
            daytimeUsed += tokensConsumed
        }

        try {
            prefs?.edit()
                ?.putString("token_usage_date", today)
                ?.putLong("daytime_tokens_used", daytimeUsed)
                ?.putLong("overnight_tokens_used", overnightUsed)
                ?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write token usage: ${e.message}")
        }

        _aiTokenUsageFlow.value = daytimeUsed

        // Background server-side persistence to Supabase auth user metadata
        val token = _userSessionToken.value
        if (!token.isNullOrBlank()) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val client = okhttp3.OkHttpClient()
                    val jsonMediaType = "application/json; charset=utf-8".toMediaType()
                    val body = org.json.JSONObject().apply {
                        put("data", org.json.JSONObject().apply {
                            put("daily_token_usage", org.json.JSONObject().apply {
                                put("date", today)
                                put("daytime_tokens_used", daytimeUsed)
                                put("overnight_tokens_used", overnightUsed)
                                put("plan", _currentPlan.value)
                                put("updated_at", java.time.Instant.now().toString())
                            })
                        })
                    }
                    val req = okhttp3.Request.Builder()
                        .url("https://qjyowojnvbfezznezxrr.supabase.co/auth/v1/user")
                        .header("apikey", "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT")
                        .header("Authorization", "Bearer $token")
                        .header("Content-Type", "application/json")
                        .put(body.toString().toRequestBody(jsonMediaType))
                        .build()
                    val res = client.newCall(req).execute()
                    Log.i("ContrilPref", "Synced token usage to Supabase: code=${res.code}")
                } catch (e: Throwable) {
                    Log.w("ContrilPref", "Background Supabase token sync error: ${e.message}")
                }
            }
        }

        return true
    }

    fun incrementAiUsage(): Boolean {
        return canExecuteAiAction()
    }

    // --- Google OAuth Provider Token Management ---
    fun saveGoogleProviderTokens(providerToken: String?, refreshToken: String?, expiresInSeconds: Long = 3600) {
        val expiryTimestamp = System.currentTimeMillis() + (expiresInSeconds * 1000)
        try {
            val editor = prefs?.edit()
            if (providerToken != null) {
                editor?.putString("google_provider_token", providerToken)
                editor?.putLong("google_token_expiry", expiryTimestamp)
            } else {
                editor?.remove("google_provider_token")
                editor?.remove("google_token_expiry")
            }
            if (refreshToken != null) {
                editor?.putString("google_refresh_token", refreshToken)
            }
            editor?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to save Google provider tokens: ${e.message}")
        }
    }

    fun getGoogleProviderToken(): String? = prefs?.getString("google_provider_token", null)
    fun getGoogleRefreshToken(): String? = prefs?.getString("google_refresh_token", null)

    fun isGoogleTokenExpired(): Boolean {
        val expiry = prefs?.getLong("google_token_expiry", 0L) ?: 0L
        // Return true if expired or expiring in under 2 minutes
        return System.currentTimeMillis() > (expiry - 120_000)
    }

    // --- Granular Permissions State ---
    private val _isAccessibilityGranted = MutableStateFlow(prefs?.getBoolean("perm_accessibility", false) ?: false)
    val isAccessibilityGranted: StateFlow<Boolean> = _isAccessibilityGranted.asStateFlow()

    private val _isGmailReadGranted = MutableStateFlow(prefs?.getBoolean("perm_gmail_read", true) ?: true)
    val isGmailReadGranted: StateFlow<Boolean> = _isGmailReadGranted.asStateFlow()

    private val _isGmailSendGranted = MutableStateFlow(prefs?.getBoolean("perm_gmail_send", false) ?: false)
    val isGmailSendGranted: StateFlow<Boolean> = _isGmailSendGranted.asStateFlow()

    private val _isCalendarReadGranted = MutableStateFlow(prefs?.getBoolean("perm_calendar_read", true) ?: true)
    val isCalendarReadGranted: StateFlow<Boolean> = _isCalendarReadGranted.asStateFlow()

    private val _isBackgroundServiceGranted = MutableStateFlow(prefs?.getBoolean("perm_background_service", false) ?: false)
    val isBackgroundServiceGranted: StateFlow<Boolean> = _isBackgroundServiceGranted.asStateFlow()

    private val _isNotificationsGranted = MutableStateFlow(prefs?.getBoolean("perm_notifications", true) ?: true)
    val isNotificationsGranted: StateFlow<Boolean> = _isNotificationsGranted.asStateFlow()

    fun setPermission(permissionKey: String, granted: Boolean) {
        try {
            prefs?.edit()?.putBoolean("perm_$permissionKey", granted)?.apply()
        } catch (_: Throwable) {}

        when (permissionKey) {
            "accessibility" -> _isAccessibilityGranted.value = granted
            "gmail_read" -> _isGmailReadGranted.value = granted
            "gmail_send" -> _isGmailSendGranted.value = granted
            "calendar_read" -> _isCalendarReadGranted.value = granted
            "background_service" -> _isBackgroundServiceGranted.value = granted
            "notifications" -> _isNotificationsGranted.value = granted
        }
    }

    fun isPermissionGranted(permissionKey: String): Boolean {
        return prefs?.getBoolean("perm_$permissionKey", false) ?: false
    }

    // --- OVERNIGHT AUTONOMY PERSISTENCE & LOGGING (30-DAY PURGE) ---
    private fun getSavedOvernightAutonomyMode(): Boolean {
        return prefs?.getBoolean("overnight_autonomy_enabled", false) ?: false
    }

    fun setOvernightAutonomyEnabled(enabled: Boolean) {
        try {
            prefs?.edit()?.putBoolean("overnight_autonomy_enabled", enabled)?.apply()
        } catch (_: Throwable) {}
        _isOvernightAutonomyEnabled.value = enabled
        if (enabled) {
            addActivityLog(
                OvernightActivityLog(
                    eventType = ActivityEventType.SERVICE_STARTED,
                    title = "Overnight Autonomy Mode Activated",
                    description = "Monitoring initiated for unread messages, priority meetings, and AI draft actions."
                )
            )
        } else {
            addActivityLog(
                OvernightActivityLog(
                    eventType = ActivityEventType.SERVICE_STOPPED,
                    title = "Overnight Autonomy Mode Deactivated",
                    description = "Monitoring manually stopped by user."
                )
            )
        }
    }

    fun updateOvernightServiceState(transform: (OvernightServiceState) -> OvernightServiceState) {
        _overnightServiceState.value = transform(_overnightServiceState.value)
    }

    fun addActivityLog(log: OvernightActivityLog) {
        val current = _activityLogs.value.toMutableList()
        current.add(0, log) // prepend newest
        
        // 30-Day Auto-Purge policy
        val cutoff = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30)
        val purged = current.filter { it.timestamp >= cutoff }
        
        _activityLogs.value = purged
        saveActivityLogs(purged)
    }

    fun purgeOldActivityLogs(days: Int = 30) {
        val cutoff = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(days.toLong())
        val purged = _activityLogs.value.filter { it.timestamp >= cutoff }
        _activityLogs.value = purged
        saveActivityLogs(purged)
    }

    private fun getSavedActivityLogs(): List<OvernightActivityLog> {
        val jsonStr = prefs?.getString("overnight_activity_logs_json", null) ?: return emptyList()
        return try {
            val arr = JSONArray(jsonStr)
            val list = mutableListOf<OvernightActivityLog>()
            val cutoff = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                val ts = obj.optLong("timestamp", System.currentTimeMillis())
                if (ts >= cutoff) {
                    list.add(
                        OvernightActivityLog(
                            id = obj.optString("id", ""),
                            timestamp = ts,
                            eventType = try { ActivityEventType.valueOf(obj.optString("eventType", "SCAN_STARTED")) } catch (_: Throwable) { ActivityEventType.SCAN_STARTED },
                            title = obj.optString("title", ""),
                            description = obj.optString("description", ""),
                            emailSender = obj.optString("emailSender", null),
                            emailSubject = obj.optString("emailSubject", null),
                            payloadSnippet = obj.optString("payloadSnippet", null),
                            tokensConsumed = obj.optInt("tokensConsumed", 0)
                        )
                    )
                }
            }
            list
        } catch (_: Throwable) {
            emptyList()
        }
    }

    private fun saveActivityLogs(logs: List<OvernightActivityLog>) {
        try {
            val arr = JSONArray()
            logs.take(200).forEach { log ->
                val obj = JSONObject()
                obj.put("id", log.id)
                obj.put("timestamp", log.timestamp)
                obj.put("eventType", log.eventType.name)
                obj.put("title", log.title)
                obj.put("description", log.description)
                obj.put("emailSender", log.emailSender)
                obj.put("emailSubject", log.emailSubject)
                obj.put("payloadSnippet", log.payloadSnippet)
                obj.put("tokensConsumed", log.tokensConsumed)
                arr.put(obj)
            }
            prefs?.edit()?.putString("overnight_activity_logs_json", arr.toString())?.apply()
        } catch (_: Throwable) {}
    }

    fun addExtractedEvent(event: ExtractedEvent) {
        val current = _extractedEvents.value.toMutableList()
        if (current.none { it.sourceEmailId == event.sourceEmailId }) {
            current.add(0, event)
            _extractedEvents.value = current
            saveExtractedEvents(current)
        }
    }

    fun hasExtractedForEmail(emailId: String): Boolean {
        return _extractedEvents.value.any { it.sourceEmailId == emailId }
    }

    private fun getSavedExtractedEvents(): List<ExtractedEvent> {
        val jsonStr = prefs?.getString("extracted_events_json", null) ?: return emptyList()
        return try {
            val arr = JSONArray(jsonStr)
            val list = mutableListOf<ExtractedEvent>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                list.add(
                    ExtractedEvent(
                        id = obj.optString("id", ""),
                        title = obj.optString("title", ""),
                        dateOrDeadline = obj.optString("dateOrDeadline", ""),
                        sender = obj.optString("sender", ""),
                        sourceEmailId = obj.optString("sourceEmailId", ""),
                        confidence = obj.optString("confidence", "HIGH"),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis())
                    )
                )
            }
            list
        } catch (_: Throwable) {
            emptyList()
        }
    }

    private fun saveExtractedEvents(events: List<ExtractedEvent>) {
        try {
            val arr = JSONArray()
            events.take(50).forEach { event ->
                val obj = JSONObject()
                obj.put("id", event.id)
                obj.put("title", event.title)
                obj.put("dateOrDeadline", event.dateOrDeadline)
                obj.put("sender", event.sender)
                obj.put("sourceEmailId", event.sourceEmailId)
                obj.put("confidence", event.confidence)
                obj.put("timestamp", event.timestamp)
                arr.put(obj)
            }
            prefs?.edit()?.putString("extracted_events_json", arr.toString())?.apply()
        } catch (_: Throwable) {}
    }

    // --- Persistent Local Inbox Cache & Sync Timestamps ---
    private val _lastInboxSyncTime = MutableStateFlow(prefs?.getLong("last_inbox_sync_timestamp", 0L) ?: 0L)
    val lastInboxSyncTime: StateFlow<Long> = _lastInboxSyncTime.asStateFlow()

    fun getLastInboxSyncTime(): Long = _lastInboxSyncTime.value

    fun saveCachedInboxEmails(emails: List<EmailSummary>) {
        try {
            val arr = JSONArray()
            emails.forEach { email ->
                val obj = JSONObject()
                obj.put("id", email.id)
                obj.put("threadId", email.threadId)
                obj.put("sender", email.sender)
                obj.put("subject", email.subject)
                obj.put("summarySnippet", email.summarySnippet)
                obj.put("isUrgent", email.isUrgent)
                obj.put("hasDraftReady", email.hasDraftReady)
                obj.put("category", email.category)
                obj.put("dateFormatted", email.dateFormatted)
                obj.put("unread", email.unread)
                arr.put(obj)
            }
            val now = System.currentTimeMillis()
            prefs?.edit()
                ?.putString("cached_inbox_emails_json", arr.toString())
                ?.putLong("last_inbox_sync_timestamp", now)
                ?.apply()
            _lastInboxSyncTime.value = now
        } catch (_: Throwable) {}
    }

    fun getCachedInboxEmails(): List<EmailSummary> {
        val jsonStr = prefs?.getString("cached_inbox_emails_json", null) ?: return emptyList()
        return try {
            val arr = JSONArray(jsonStr)
            val list = mutableListOf<EmailSummary>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                list.add(
                    EmailSummary(
                        id = obj.optString("id", ""),
                        threadId = obj.optString("threadId", obj.optString("id", "")),
                        sender = obj.optString("sender", "Unknown"),
                        subject = obj.optString("subject", "(No Subject)"),
                        summarySnippet = obj.optString("summarySnippet", ""),
                        isUrgent = obj.optBoolean("isUrgent", false),
                        hasDraftReady = obj.optBoolean("hasDraftReady", false),
                        category = obj.optString("category", "PRIMARY"),
                        dateFormatted = obj.optString("dateFormatted", "Cached"),
                        unread = obj.optBoolean("unread", false)
                    )
                )
            }
            list
        } catch (_: Throwable) {
            emptyList()
        }
    }

    fun clearSession() {
        saveUserSession(null, null)
        saveGoogleProviderTokens(null, null, 0)
        try {
            prefs?.edit()
                ?.remove("has_completed_onboarding")
                ?.remove("user_role")
                ?.remove("user_goals")
                ?.remove("connected_services_map")
                ?.remove("overnight_autonomy_enabled")
                ?.remove("overnight_activity_logs_json")
                ?.remove("extracted_events_json")
                ?.remove("cached_inbox_emails_json")
                ?.remove("last_inbox_sync_timestamp")
                ?.apply()
        } catch (_: Throwable) {}
        _hasCompletedOnboarding.value = false
        _userRole.value = "Executive"
        _connectedServices.value = emptyMap()
        _isOvernightAutonomyEnabled.value = false
        _lastInboxSyncTime.value = 0L
    }

    fun getOrCreateDeviceToken(): String {
        val existing = prefs?.getString("device_fcm_token", null)
        if (!existing.isNullOrBlank()) return existing
        val newToken = "contril_android_" + java.util.UUID.randomUUID().toString().replace("-", "")
        prefs?.edit()?.putString("device_fcm_token", newToken)?.apply()
        return newToken
    }

    fun getSavedDeviceToken(): String? {
        return prefs?.getString("device_fcm_token", null)
    }

    fun isEmailNotified(emailId: String): Boolean {
        val notifiedSet = prefs?.getStringSet("notified_email_ids", emptySet()) ?: emptySet()
        return notifiedSet.contains(emailId)
    }

    fun markEmailNotified(emailId: String) {
        try {
            val notifiedSet = (prefs?.getStringSet("notified_email_ids", emptySet()) ?: emptySet()).toMutableSet()
            notifiedSet.add(emailId)
            prefs?.edit()?.putStringSet("notified_email_ids", notifiedSet)?.apply()
        } catch (_: Throwable) {}
    }
}



package com.contril.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.contril.app.data.model.AutonomyMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

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
            com.contril.app.data.model.UserProfile(
                id = id,
                email = email,
                name = name,
                avatarUrl = avatar,
                createdAt = createdAt
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

    fun isProOrExecutive(): Boolean {
        val status = getSavedSubscriptionStatus()
        return status == com.contril.app.data.model.SubscriptionStatus.ACTIVE_PRO
    }

    fun getTodayAiUsage(): Pair<Int, Int> {
        val today = java.time.LocalDate.now().toString()
        val savedDate = prefs?.getString("ai_usage_date", "") ?: ""
        val count = if (savedDate == today) {
            prefs?.getInt("ai_usage_count", 0) ?: 0
        } else {
            0
        }
        val maxLimit = if (isProOrExecutive()) 100 else 5
        return Pair(count, maxLimit)
    }

    fun incrementAiUsage(): Boolean {
        if (isProOrExecutive()) return true
        val today = java.time.LocalDate.now().toString()
        val savedDate = prefs?.getString("ai_usage_date", "") ?: ""
        var count = if (savedDate == today) prefs?.getInt("ai_usage_count", 0) ?: 0 else 0
        if (count >= 5) {
            return false // Free limit reached
        }
        count += 1
        try {
            prefs?.edit()
                ?.putString("ai_usage_date", today)
                ?.putInt("ai_usage_count", count)
                ?.apply()
        } catch (e: Throwable) {
            Log.e("ContrilPref", "Failed to write AI usage: ${e.message}")
        }
        return true
    }

    fun clearSession() {
        saveUserSession(null, null)
        try {
            prefs?.edit()
                ?.remove("has_completed_onboarding")
                ?.remove("user_role")
                ?.remove("user_goals")
                ?.apply()
        } catch (_: Throwable) {}
        _hasCompletedOnboarding.value = false
        _userRole.value = "Executive"
    }
}



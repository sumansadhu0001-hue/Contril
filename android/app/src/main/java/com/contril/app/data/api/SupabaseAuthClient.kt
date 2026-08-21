package com.contril.app.data.api

import android.util.Log
import com.contril.app.data.model.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object SupabaseAuthClient {

    private const val SUPABASE_URL = "https://qjyowojnvbfezznezxrr.supabase.co"
    private const val SUPABASE_ANON_KEY = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"
    private const val OAUTH_REDIRECT_URI = "https://contril-ai.vercel.app/auth/callback"

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val encodedRedirectUri: String
        get() = java.net.URLEncoder.encode(OAUTH_REDIRECT_URI, "UTF-8")

    /**
     * Flow A: Contril User Authentication (Clean standard Supabase Google OAuth)
     */
    fun getGoogleOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleLoginOAuthUrl(): String = getGoogleOAuthUrl()

    /**
     * Flow B: Google Workspace Integration (Gmail, Calendar, Drive)
     */
    fun getGoogleWorkspaceOAuthUrl(): String {
        val rawScopes = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        val scopes = java.net.URLEncoder.encode(rawScopes, "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getGmailOAuthUrl(): String {
        val rawScopes = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        val scopes = java.net.URLEncoder.encode(rawScopes, "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleCalendarOAuthUrl(): String {
        val rawScopes = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        val scopes = java.net.URLEncoder.encode(rawScopes, "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleDriveOAuthUrl(): String {
        val rawScopes = "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        val scopes = java.net.URLEncoder.encode(rawScopes, "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getMicrosoftOAuthUrl(): String {
        val scopes = java.net.URLEncoder.encode("openid email profile Mail.Read Calendars.Read", "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=azure&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getGitHubOAuthUrl(): String {
        val scopes = java.net.URLEncoder.encode("read:user repo", "UTF-8")
        return "$SUPABASE_URL/auth/v1/authorize?provider=github&scopes=$scopes&redirect_to=$encodedRedirectUri"
    }

    fun getOAuthUrlForService(serviceId: String): String {
        return when (serviceId.lowercase()) {
            "google_workspace", "workspace" -> getGoogleWorkspaceOAuthUrl()
            "gmail" -> getGmailOAuthUrl()
            "calendar", "google_calendar" -> getGoogleCalendarOAuthUrl()
            "drive", "google_drive" -> getGoogleDriveOAuthUrl()
            "outlook", "microsoft" -> getMicrosoftOAuthUrl()
            "github" -> getGitHubOAuthUrl()
            "notion" -> "$SUPABASE_URL/auth/v1/authorize?provider=notion&redirect_to=$encodedRedirectUri"
            else -> "$SUPABASE_URL/auth/v1/authorize?provider=$serviceId&redirect_to=$encodedRedirectUri"
        }
    }

    data class AuthResult(
        val success: Boolean,
        val token: String? = null,
        val user: UserProfile? = null,
        val error: String? = null
    )

    suspend fun signInWithPassword(email: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("password", password)
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/token?grant_type=password")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    val errJson = JSONObject(resBody)
                    errJson.optString("error_description", errJson.optString("msg", "Invalid email or password."))
                } catch (_: Exception) {
                    "Invalid email or password."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            val json = JSONObject(resBody)
            val accessToken = json.getString("access_token")
            val userObj = json.getJSONObject("user")
            val profile = parseUserProfileFromUserJson(userObj)

            AuthResult(success = true, token = accessToken, user = profile)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "Login network exception", e)
            AuthResult(success = false, error = e.message ?: "Unable to connect. Check your internet connection.")
        }
    }

    suspend fun signUp(email: String, fullName: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("password", password)
                put("data", JSONObject().apply {
                    put("full_name", fullName.trim())
                })
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/signup")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    val errJson = JSONObject(resBody)
                    errJson.optString("error_description", errJson.optString("msg", "Registration failed."))
                } catch (_: Exception) {
                    "Registration failed."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            val json = JSONObject(resBody)
            val accessToken = json.optString("access_token", null)
            val userObj = json.optJSONObject("user")
            val userId = userObj?.optString("id", "usr_${System.currentTimeMillis()}") ?: "usr_${System.currentTimeMillis()}"

            val profile = UserProfile(
                id = userId,
                email = email.trim(),
                name = fullName.trim()
            )

            AuthResult(success = true, token = accessToken, user = profile)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "Signup exception", e)
            AuthResult(success = false, error = e.message ?: "Network error during signup.")
        }
    }

    suspend fun sendEmailOtp(email: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("create_user", true)
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/otp")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    val errJson = JSONObject(resBody)
                    errJson.optString("error_description", errJson.optString("msg", "Unable to send verification code."))
                } catch (_: Exception) {
                    "Unable to send verification code."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            AuthResult(success = true)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "sendEmailOtp error", e)
            AuthResult(success = false, error = e.message ?: "Network error.")
        }
    }

    suspend fun verifyEmailOtp(email: String, token: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("token", token.trim())
                put("type", "email")
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/verify")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    val errJson = JSONObject(resBody)
                    errJson.optString("error_description", errJson.optString("msg", "Invalid or expired verification code."))
                } catch (_: Exception) {
                    "Invalid or expired verification code."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            val json = JSONObject(resBody)
            val accessToken = json.getString("access_token")
            val userObj = json.getJSONObject("user")
            val userId = userObj.getString("id")
            val metadata = userObj.optJSONObject("user_metadata")
            val fullName = metadata?.optString("full_name", metadata.optString("name", "")) ?: ""

            val profile = parseUserProfileFromUserJson(userObj)
            AuthResult(success = true, token = accessToken, user = profile)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "verifyEmailOtp error", e)
            AuthResult(success = false, error = e.message ?: "Verification error.")
        }
    }

    suspend fun sendResendOtp(email: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/functions/v1/send-otp")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                // Graceful fallback to Supabase standard OTP
                return@withContext sendEmailOtp(email)
            }

            AuthResult(success = true)
        } catch (e: Exception) {
            Log.w("SupabaseAuth", "sendResendOtp failed, falling back to Supabase standard OTP: ${e.message}")
            sendEmailOtp(email)
        }
    }

    suspend fun verifyResendOtp(email: String, otp: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("otp", otp.trim())
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/functions/v1/verify-otp")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                // Graceful fallback to Supabase standard OTP verify
                return@withContext verifyEmailOtp(email, otp)
            }

            val json = JSONObject(resBody)
            val token = json.optString("session_token", json.optString("access_token", ""))
            val userObj = json.optJSONObject("user") ?: JSONObject()
            val profile = parseUserProfileFromUserJson(userObj)

            AuthResult(success = true, token = token, user = profile)
        } catch (e: Exception) {
            Log.w("SupabaseAuth", "verifyResendOtp error, falling back to verifyEmailOtp", e)
            verifyEmailOtp(email, otp)
        }
    }

    suspend fun sendPasswordRecovery(email: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/recover")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    val errJson = JSONObject(resBody)
                    errJson.optString("error_description", errJson.optString("msg", "Unable to send password recovery email."))
                } catch (_: Exception) {
                    "Unable to send password recovery email."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            AuthResult(success = true)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "sendPasswordRecovery error", e)
            AuthResult(success = false, error = e.message ?: "Network error.")
        }
    }

    suspend fun getUserProfile(accessToken: String): UserProfile? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/user")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Authorization", "Bearer $accessToken")
                .get()
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) return@withContext null

            val resBody = response.body?.string() ?: return@withContext null
            val userObj = JSONObject(resBody)
            parseUserProfileFromUserJson(userObj)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "Failed to fetch user profile", e)
            null
        }
    }

    /**
     * Persist onboarding completion, role, and goals directly to Supabase User Metadata
     */
    suspend fun updateUserMetadata(
        accessToken: String,
        completed: Boolean,
        role: String = "Executive",
        goals: List<String> = emptyList(),
        fullName: String? = null
    ): Boolean = withContext(Dispatchers.IO) {
        if (accessToken.isBlank()) return@withContext false
        try {
            val dataObj = JSONObject().apply {
                put("has_completed_onboarding", completed)
                put("onboarding_completed", completed)
                put("user_role", role)
                put("role", role)
                val goalsArray = org.json.JSONArray()
                goals.forEach { goalsArray.put(it) }
                put("user_goals", goalsArray)
                if (!fullName.isNullOrBlank()) {
                    put("full_name", fullName)
                }
            }

            val jsonBody = JSONObject().apply {
                put("data", dataObj)
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/user")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Authorization", "Bearer $accessToken")
                .header("Content-Type", "application/json")
                .put(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val success = response.isSuccessful
            Log.i("SupabaseAuth", "updateUserMetadata response: ${response.code}, success=$success")
            success
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "Failed to update user metadata on Supabase", e)
            false
        }
    }

    private fun parseUserProfileFromUserJson(userObj: JSONObject): UserProfile {
        val userId = userObj.optString("id", "")
        val email = userObj.optString("email", "")
        val metadata = userObj.optJSONObject("user_metadata")
        val fullName = metadata?.optString("full_name", metadata.optString("name", "")) ?: ""
        val avatarUrl = metadata?.optString("avatar_url", metadata.optString("picture", ""))
        val hasCompleted = metadata?.optBoolean("has_completed_onboarding", false)
            ?: (metadata?.optBoolean("onboarding_completed", false) ?: false)
        val role = metadata?.optString("user_role", metadata.optString("role", "Executive")).takeIf { !it.isNullOrBlank() } ?: "Executive"
        
        val goals = mutableListOf<String>()
        val goalsArr = metadata?.optJSONArray("user_goals")
        if (goalsArr != null) {
            for (i in 0 until goalsArr.length()) {
                goals.add(goalsArr.getString(i))
            }
        } else {
            val goalsStr = metadata?.optString("user_goals", "")
            if (!goalsStr.isNullOrBlank()) {
                goals.addAll(goalsStr.split(",").map { it.trim() }.filter { it.isNotBlank() })
            }
        }

        return UserProfile(
            id = userId,
            email = email,
            name = fullName.ifBlank { email.substringBefore("@") },
            avatarUrl = avatarUrl?.takeIf { it.isNotBlank() },
            hasCompletedOnboarding = hasCompleted,
            role = role,
            goals = goals
        )
    }

    /**
     * Forward provider tokens securely to backend vault over authenticated HTTPS connection
     */
    suspend fun vaultGoogleProviderCredentials(
        contrilSessionToken: String,
        providerToken: String,
        providerRefreshToken: String?
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("provider", "google")
                put("provider_token", providerToken)
                if (providerRefreshToken != null) {
                    put("provider_refresh_token", providerRefreshToken)
                }
            }

            val request = Request.Builder()
                .url("$SUPABASE_URL/functions/v1/vault-provider-credentials")
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Authorization", "Bearer $contrilSessionToken")
                .header("Content-Type", "application/json")
                .post(json.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            Log.w("SupabaseAuth", "Vault provider credentials call error: ${e.message}")
            false
        }
    }
}

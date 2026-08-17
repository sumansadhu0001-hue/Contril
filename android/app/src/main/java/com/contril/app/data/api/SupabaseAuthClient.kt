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

    const val SUPABASE_URL = "https://qjyowojnvbfezznezxrr.supabase.co"
    const val SUPABASE_ANON_KEY = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"
    const val OAUTH_REDIRECT_URI = "contril://login-callback"

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val encodedRedirectUri: String
        get() = java.net.URLEncoder.encode(OAUTH_REDIRECT_URI, "UTF-8")

    fun getGoogleOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleWorkspaceOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/drive.readonly&redirect_to=$encodedRedirectUri"
    }

    fun getGmailOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/gmail.readonly&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleCalendarOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/calendar&redirect_to=$encodedRedirectUri"
    }

    fun getGoogleDriveOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/drive.readonly&redirect_to=$encodedRedirectUri"
    }

    fun getMicrosoftOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=azure&scopes=email+openid+profile+Mail.Read+Calendars.Read&redirect_to=$encodedRedirectUri"
    }

    fun getGitHubOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=github&scopes=read:user+repo&redirect_to=$encodedRedirectUri"
    }

    fun getOAuthUrlForService(serviceId: String): String {
        return when (serviceId.lowercase()) {
            "google_workspace", "workspace" -> getGoogleWorkspaceOAuthUrl()
            "gmail" -> getGmailOAuthUrl()
            "calendar", "google_calendar" -> getGoogleCalendarOAuthUrl()
            "drive", "google_drive" -> getGoogleDriveOAuthUrl()
            "outlook", "microsoft" -> getMicrosoftOAuthUrl()
            "github" -> getGitHubOAuthUrl()
            else -> getGoogleOAuthUrl()
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
            val userId = userObj.getString("id")
            val userEmail = userObj.optString("email", email)
            val metadata = userObj.optJSONObject("user_metadata")
            val fullName = metadata?.optString("full_name", metadata.optString("name", "")) ?: ""
            val avatarUrl = metadata?.optString("avatar_url", metadata.optString("picture", ""))

            val profile = UserProfile(
                id = userId,
                email = userEmail,
                name = fullName.ifBlank { userEmail.substringBefore("@") },
                avatarUrl = avatarUrl?.takeIf { it.isNotBlank() }
            )

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
                    errJson.optString("error_description", errJson.optString("msg", "Failed to send code."))
                } catch (_: Exception) {
                    "Failed to send code."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            AuthResult(success = true)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "sendEmailOtp error", e)
            AuthResult(success = false, error = e.message ?: "Unable to dispatch verification code.")
        }
    }

    suspend fun sendResendOtp(email: String, isRecovery: Boolean = false): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("isRecovery", isRecovery)
            }

            val request = Request.Builder()
                .url("https://contril.netlify.app/.netlify/functions/auth-otp")
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    JSONObject(resBody).optString("error", "Failed to send code via Resend.")
                } catch (_: Exception) {
                    "Failed to send code via Resend."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            AuthResult(success = true)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "sendResendOtp error", e)
            AuthResult(success = false, error = e.message ?: "Unable to send verification code.")
        }
    }

    suspend fun verifyResendOtp(email: String, code: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("email", email.trim())
                put("code", code.trim())
            }

            val request = Request.Builder()
                .url("https://contril.netlify.app/.netlify/functions/auth-otp")
                .header("Content-Type", "application/json")
                .post(jsonBody.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = try {
                    JSONObject(resBody).optString("error", "That code isn't correct. Try again.")
                } catch (_: Exception) {
                    "That code isn't correct. Try again."
                }
                return@withContext AuthResult(success = false, error = errMsg)
            }

            val json = JSONObject(resBody)
            val userObj = json.optJSONObject("user")
            val token = json.optString("token", "token_${System.currentTimeMillis()}")
            val userId = userObj?.optString("id", "usr_${System.currentTimeMillis()}") ?: "usr_${System.currentTimeMillis()}"
            val userEmail = userObj?.optString("email", email) ?: email
            val userName = userObj?.optString("name", email.substringBefore("@")) ?: email.substringBefore("@")

            val profile = UserProfile(
                id = userId,
                email = userEmail,
                name = userName
            )

            AuthResult(success = true, token = token, user = profile)
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "verifyResendOtp error", e)
            AuthResult(success = false, error = e.message ?: "Verification error.")
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
            val userId = userObj.getString("id")
            val email = userObj.optString("email", "")
            val metadata = userObj.optJSONObject("user_metadata")
            val fullName = metadata?.optString("full_name", metadata.optString("name", "")) ?: ""
            val avatarUrl = metadata?.optString("avatar_url", metadata.optString("picture", ""))

            UserProfile(
                id = userId,
                email = email,
                name = fullName.ifBlank { email.substringBefore("@") },
                avatarUrl = avatarUrl?.takeIf { it.isNotBlank() }
            )
        } catch (e: Exception) {
            Log.e("SupabaseAuth", "Failed to fetch user profile", e)
            null
        }
    }
}

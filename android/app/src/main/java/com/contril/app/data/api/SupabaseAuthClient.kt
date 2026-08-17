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

    fun getGoogleOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getGoogleWorkspaceOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/drive.readonly&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getGmailOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/gmail.readonly&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getGoogleCalendarOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/calendar&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getGoogleDriveOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=google&scopes=https://www.googleapis.com/auth/drive.readonly&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getMicrosoftOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=azure&scopes=email+openid+profile+Mail.Read+Calendars.Read&redirect_to=$OAUTH_REDIRECT_URI"
    }

    fun getGitHubOAuthUrl(): String {
        return "$SUPABASE_URL/auth/v1/authorize?provider=github&scopes=read:user+repo&redirect_to=$OAUTH_REDIRECT_URI"
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
                    errJson.optString("error_description", errJson.optString("msg", "Authentication failed."))
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
            AuthResult(success = false, error = e.message ?: "Network error during authentication.")
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
            AuthResult(success = response.isSuccessful)
        } catch (e: Exception) {
            AuthResult(success = false, error = e.message)
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

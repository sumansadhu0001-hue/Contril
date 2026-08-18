package com.contril.app.data.api

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import net.openid.appauth.*
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume

/**
 * Native Android RFC 7636 PKCE Google OAuth Manager.
 * Uses official AppAuth-Android SDK with direct PKCE code exchange,
 * EncryptedSharedPreferences persistence, and silent background token renewal.
 */
class GoogleOAuthManager(private val context: Context) {

    companion object {
        private const val TAG = "GoogleOAuthManager"
        private const val PREFS_NAME = "contril_encrypted_auth_prefs"
        private const val KEY_AUTH_STATE = "google_auth_state_json"

        // Official Google OAuth 2.0 Endpoints
        val AUTH_ENDPOINT: Uri = Uri.parse("https://accounts.google.com/o/oauth2/v2/auth")
        val TOKEN_ENDPOINT: Uri = Uri.parse("https://oauth2.googleapis.com/token")

        // Redirect URI registered identically in Google Cloud Console & AndroidManifest.xml
        val REDIRECT_URI: Uri = Uri.parse("com.contril.app.debug:/oauth2redirect")

        // Scopes for Gmail Intelligence, Sending, and Trash Deletion
        val GMAIL_SCOPES = listOf(
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "openid"
        )
    }

    private val authService = AuthorizationService(context)
    private val serviceConfig = AuthorizationServiceConfiguration(AUTH_ENDPOINT, TOKEN_ENDPOINT)

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private var authState: AuthState = loadAuthState()

    private fun loadAuthState(): AuthState {
        val json = encryptedPrefs.getString(KEY_AUTH_STATE, null)
        return if (!json.isNullOrBlank()) {
            try {
                AuthState.jsonDeserialize(json)
            } catch (e: Exception) {
                Log.w(TAG, "Failed to deserialize AuthState, starting fresh", e)
                AuthState(serviceConfig)
            }
        } else {
            AuthState(serviceConfig)
        }
    }

    private fun persistAuthState(state: AuthState) {
        authState = state
        encryptedPrefs.edit()
            .putString(KEY_AUTH_STATE, state.jsonSerializeString())
            .apply()
    }

    /**
     * Creates an RFC 7636 PKCE Authorization Request Intent
     */
    fun createAuthorizationIntent(clientId: String = "896172605886-contril-android.apps.googleusercontent.com"): Intent {
        val authRequestBuilder = AuthorizationRequest.Builder(
            serviceConfig,
            clientId,
            ResponseTypeValues.CODE,
            REDIRECT_URI
        ).apply {
            setScopes(GMAIL_SCOPES)
            setPrompt("consent")
            setAdditionalParameters(mapOf("access_type" to "offline"))
        }

        val authRequest = authRequestBuilder.build()
        return authService.getAuthorizationRequestIntent(authRequest)
    }

    /**
     * Exchanges the authorization code for access & refresh tokens via PKCE
     */
    suspend fun handleAuthorizationResponse(intent: Intent): Boolean = withContext(Dispatchers.IO) {
        val response = AuthorizationResponse.fromIntent(intent)
        val exception = AuthorizationException.fromIntent(intent)

        if (response == null) {
            Log.e(TAG, "Authorization failed or cancelled: ${exception?.message}")
            return@withContext false
        }

        authState.update(response, exception)
        persistAuthState(authState)

        suspendCancellableCoroutine { continuation ->
            authService.performTokenRequest(response.createTokenExchangeRequest()) { tokenResponse, tokenEx ->
                authState.update(tokenResponse, tokenEx)
                persistAuthState(authState)

                if (tokenResponse != null && authState.isAuthorized) {
                    Log.i(TAG, "Successfully exchanged PKCE code for tokens. Valid: ${authState.isAuthorized}")
                    continuation.resume(true)
                } else {
                    Log.e(TAG, "Token exchange failed: ${tokenEx?.message}")
                    continuation.resume(false)
                }
            }
        }
    }

    /**
     * Silent token retrieval: automatically refreshes expired access token using refresh token
     */
    suspend fun getFreshAccessToken(): String? = withContext(Dispatchers.IO) {
        if (!authState.isAuthorized) {
            Log.w(TAG, "Cannot get token: AuthState is not authorized")
            return@withContext null
        }

        suspendCancellableCoroutine { continuation ->
            authState.performActionWithFreshTokens(authService) { accessToken, _, ex ->
                if (ex != null) {
                    Log.e(TAG, "Silent token refresh failed: ${ex.message}")
                    continuation.resume(null)
                } else {
                    persistAuthState(authState)
                    continuation.resume(accessToken)
                }
            }
        }
    }

    /**
     * Direct test helper: verifies if current account is connected and token is valid
     */
    fun isConnected(): Boolean {
        return authState.isAuthorized && authState.refreshToken != null
    }

    /**
     * Disconnects and purges credentials securely
     */
    fun disconnect() {
        encryptedPrefs.edit().remove(KEY_AUTH_STATE).apply()
        authState = AuthState(serviceConfig)
    }

    /**
     * Force-test token expiry helper: invalidates current access token to test silent refresh
     */
    fun forceExpireAccessTokenForTesting() {
        // Overwrite access token with invalid test string while preserving refresh token
        val currentJson = authState.jsonSerializeString()
        try {
            val jsonObj = JSONObject(currentJson)
            jsonObj.put("mAccessToken", "invalid_expired_token_for_testing")
            jsonObj.put("mAccessTokenExpirationTime", System.currentTimeMillis() - 60000)
            val expiredState = AuthState.jsonDeserialize(jsonObj.toString())
            persistAuthState(expiredState)
            Log.i(TAG, "Access token forcefully marked expired for testing.")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to force expire token", e)
        }
    }
}

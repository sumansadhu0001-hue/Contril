package com.contril.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.contril.app.data.api.SupabaseAuthClient
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.theme.ContrilTheme
import com.contril.app.ui.navigation.ContrilAppContent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val repository by lazy { ContrilRepository() }
    private val prefRepository by lazy { PreferenceRepository(applicationContext) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            enableEdgeToEdge()
        } catch (e: Throwable) {
            Log.w("ContrilMain", "enableEdgeToEdge failed: ${e.message}")
        }

        handleAuthDeepLink(intent)

        setContent {
            val isDark by prefRepository.isDarkTheme.collectAsState()
            ContrilTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = androidx.compose.material3.MaterialTheme.colorScheme.background
                ) {
                    ContrilAppContent(
                        repository = repository,
                        prefRepository = prefRepository
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleAuthDeepLink(intent)
    }

    private fun handleAuthDeepLink(intent: Intent?) {
        val uri: Uri = intent?.data ?: return
        Log.i("ContrilMain", "OAuth deep link received: ${uri.scheme}://${uri.host}${uri.path}")

        if (uri.scheme == "contril" && ((uri.host == "auth" && uri.path == "/callback") || uri.host == "login-callback" || uri.host == "auth")) {
            lifecycleScope.launch(Dispatchers.IO) {
                var token: String? = null
                var providerToken: String? = null
                var providerRefreshToken: String? = null

                // 1. Try URL fragment (#access_token=...&provider_token=...)
                val fragment = uri.fragment
                if (!fragment.isNullOrBlank()) {
                    val params = fragment.split("&").associate {
                        val pair = it.split("=")
                        if (pair.size >= 2) pair[0] to pair[1] else "" to ""
                    }
                    token = params["access_token"]
                    providerToken = params["provider_token"]
                    providerRefreshToken = params["provider_refresh_token"] ?: params["refresh_token"]
                }

                // 2. Try query parameters (?access_token=...)
                if (token.isNullOrBlank()) {
                    token = uri.getQueryParameter("access_token") ?: uri.getQueryParameter("token")
                }
                if (providerToken.isNullOrBlank()) {
                    providerToken = uri.getQueryParameter("provider_token")
                }
                if (providerRefreshToken.isNullOrBlank()) {
                    providerRefreshToken = uri.getQueryParameter("provider_refresh_token")
                }

                val activeSessionToken = token ?: prefRepository.userSessionToken.value

                if (!token.isNullOrBlank()) {
                    val user = SupabaseAuthClient.getUserProfile(token)
                    if (user != null) {
                        Log.i("ContrilMain", "OAuth authentication succeeded for user: ${user.name} (${user.email})")
                        prefRepository.saveUserSession(token, user)

                        if (!providerToken.isNullOrBlank()) {
                            // Securely vault provider credentials to backend
                            SupabaseAuthClient.vaultGoogleProviderCredentials(
                                contrilSessionToken = token,
                                providerToken = providerToken,
                                providerRefreshToken = providerRefreshToken
                            )
                            prefRepository.connectService("google_workspace", user.email)
                            prefRepository.connectService("gmail", user.email)
                            prefRepository.connectService("calendar", user.email)
                        }
                    } else {
                        Log.w("ContrilMain", "Failed to retrieve user profile for token")
                    }
                } else if (!activeSessionToken.isNullOrBlank() && !providerToken.isNullOrBlank()) {
                    // Authenticated user connected additional provider (e.g. Workspace)
                    val currentUser = prefRepository.currentUser.value
                    val email = currentUser?.email ?: "connected"
                    SupabaseAuthClient.vaultGoogleProviderCredentials(
                        contrilSessionToken = activeSessionToken,
                        providerToken = providerToken,
                        providerRefreshToken = providerRefreshToken
                    )
                    prefRepository.connectService("google_workspace", email)
                    prefRepository.connectService("gmail", email)
                    prefRepository.connectService("calendar", email)
                    Log.i("ContrilMain", "Google Workspace integration credentials vaulted successfully.")
                }
            }
        }
    }
}

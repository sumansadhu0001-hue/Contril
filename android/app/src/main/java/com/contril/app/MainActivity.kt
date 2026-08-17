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
            ContrilTheme {
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
        Log.i("ContrilMain", "Deep link received: $uri")

        if (uri.scheme == "contril" && uri.host == "login-callback") {
            lifecycleScope.launch(Dispatchers.IO) {
                var token: String? = null

                // 1. Try URL fragment (#access_token=...&refresh_token=...)
                val fragment = uri.fragment
                if (!fragment.isNullOrBlank()) {
                    val params = fragment.split("&").associate {
                        val pair = it.split("=")
                        if (pair.size == 2) pair[0] to pair[1] else "" to ""
                    }
                    token = params["access_token"]
                }

                // 2. Try query parameter
                if (token.isNullOrBlank()) {
                    token = uri.getQueryParameter("access_token") ?: uri.getQueryParameter("token")
                }

                if (!token.isNullOrBlank()) {
                    val user = SupabaseAuthClient.getUserProfile(token)
                    if (user != null) {
                        Log.i("ContrilMain", "OAuth authentication succeeded for: ${user.name} (${user.email})")
                        prefRepository.saveUserSession(token, user)
                    } else {
                        Log.w("ContrilMain", "Failed to retrieve user profile for token")
                    }
                }
            }
        }
    }
}

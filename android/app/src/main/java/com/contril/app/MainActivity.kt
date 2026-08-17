package com.contril.app

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
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.theme.ContrilTheme
import com.contril.app.ui.navigation.ContrilAppContent

class MainActivity : ComponentActivity() {

    private var repository: ContrilRepository? = null
    private var prefRepository: PreferenceRepository? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Edge-to-edge: wrap safely — some OEM ROMs or older SDKs can throw
        try {
            enableEdgeToEdge()
        } catch (e: Exception) {
            Log.w("ContrilMain", "enableEdgeToEdge failed, skipping: ${e.message}")
        }

        // Repository initialization must never crash the activity
        try {
            repository = ContrilRepository()
        } catch (e: Exception) {
            Log.e("ContrilMain", "ContrilRepository init failed: ${e.message}", e)
            repository = null
        }

        try {
            prefRepository = PreferenceRepository(applicationContext)
        } catch (e: Exception) {
            Log.e("ContrilMain", "PreferenceRepository init failed: ${e.message}", e)
            prefRepository = null
        }

        val safeRepository = repository ?: try {
            ContrilRepository()
        } catch (e: Exception) {
            Log.e("ContrilMain", "ContrilRepository fallback init also failed", e)
            ContrilRepository()
        }

        val safePrefRepository = prefRepository ?: try {
            PreferenceRepository(this)
        } catch (e: Exception) {
            Log.e("ContrilMain", "PreferenceRepository fallback init also failed", e)
            PreferenceRepository(this)
        }

        setContent {
            val isDarkTheme by safePrefRepository.isDarkTheme.collectAsState()

            ContrilTheme(darkTheme = isDarkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = androidx.compose.material3.MaterialTheme.colorScheme.background
                ) {
                    ContrilAppContent(
                        repository = safeRepository,
                        prefRepository = safePrefRepository
                    )
                }
            }
        }
    }
}

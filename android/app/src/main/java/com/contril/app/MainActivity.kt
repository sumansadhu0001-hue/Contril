package com.contril.app

import android.os.Bundle
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

    private lateinit var repository: ContrilRepository
    private lateinit var prefRepository: PreferenceRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            enableEdgeToEdge()
        } catch (e: Exception) {
            // Edge-to-edge fallback for custom ROMs
        }

        try {
            repository = ContrilRepository()
            prefRepository = PreferenceRepository(applicationContext)
        } catch (e: Exception) {
            // Failsafe initialization
            repository = ContrilRepository()
            prefRepository = PreferenceRepository(this)
        }

        setContent {
            val isDarkTheme by prefRepository.isDarkTheme.collectAsState()

            ContrilTheme(darkTheme = isDarkTheme) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    ContrilAppContent(
                        repository = repository,
                        prefRepository = prefRepository
                    )
                }
            }
        }
    }
}

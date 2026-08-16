package com.contril.app.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.contril.app.data.model.AutonomyMode
import com.contril.app.theme.*

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val currentAutonomy by viewModel.autonomyMode.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "CONTROLS & PERMISSIONS",
                    style = MaterialTheme.typography.labelSmall,
                    color = ContrilBlue
                )
                Text(
                    text = "Settings",
                    style = MaterialTheme.typography.displayMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Configure how much autonomy Contril has when coordinating work.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            Text(
                text = "AUTONOMY LEVEL",
                style = MaterialTheme.typography.labelSmall,
                color = ContrilBlue,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        item {
            AutonomyOptionCard(
                title = "Always Ask",
                description = "Every draft, calendar update, and state change requires explicit confirmation.",
                isSelected = currentAutonomy == AutonomyMode.ALWAYS_ASK,
                onClick = { viewModel.setAutonomyMode(AutonomyMode.ALWAYS_ASK) }
            )
        }

        item {
            AutonomyOptionCard(
                title = "Ask for Sensitive Actions",
                description = "Routine summaries and reads run automatically; emails and reschedules ask first.",
                isSelected = currentAutonomy == AutonomyMode.SENSITIVE_ONLY,
                onClick = { viewModel.setAutonomyMode(AutonomyMode.SENSITIVE_ONLY) }
            )
        }

        item {
            AutonomyOptionCard(
                title = "Auto-Approve Trusted",
                description = "High autonomy mode for pre-verified routines and frequent collaborator workflows.",
                isSelected = currentAutonomy == AutonomyMode.AUTO_APPROVE,
                onClick = { viewModel.setAutonomyMode(AutonomyMode.AUTO_APPROVE) }
            )
        }

        item {
            Text(
                text = "SECURITY & STORAGE",
                style = MaterialTheme.typography.labelSmall,
                color = ContrilBlue,
                modifier = Modifier.padding(top = 16.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Shield,
                            contentDescription = "Encrypted",
                            tint = ContrilBlue,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Hardware-Backed Security",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Text(
                        text = "Session keys and sensitive authentication tokens are stored securely in Android Keystore. Gemini API credentials are kept server-side.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun AutonomyOptionCard(
    title: String,
    description: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = if (isSelected) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface,
        border = BorderStroke(
            1.dp,
            if (isSelected) ContrilBlue else MaterialTheme.colorScheme.outline
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (isSelected) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = "Selected",
                    tint = ContrilBlue,
                    modifier = Modifier
                        .padding(start = 12.dp)
                        .size(20.dp)
                )
            }
        }
    }
}

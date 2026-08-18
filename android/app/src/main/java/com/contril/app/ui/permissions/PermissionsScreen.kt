package com.contril.app.ui.permissions

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.theme.*
import com.contril.app.ui.components.ContrilCapability
import com.contril.app.ui.components.PermissionManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PermissionsScreen(
    prefRepository: PreferenceRepository,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    var selectedCapabilityForModal by remember { mutableStateOf<ContrilCapability?>(null) }

    val capabilities = ContrilCapability.entries

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Granular Permissions",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "Manage system access and privacy controls",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondaryLight
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimaryLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 10.dp, bottom = 32.dp)
        ) {
            // Header Information Card
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = ContrilLightSurface,
                    shadowElevation = 6.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Security,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Zero Unapproved Actions",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "Contril requires explicit permission per capability. You can revoke any capability anytime.",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondaryLight
                            )
                        }
                    }
                }
            }

            // Capability List Items
            items(capabilities) { capability ->
                val isGranted = PermissionManager.isCapabilityGranted(context, capability, prefRepository)

                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = ContrilLightSurface,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = when (capability.riskLevel) {
                                        "High" -> StatusError.copy(alpha = 0.12f)
                                        "Medium" -> StatusWarning.copy(alpha = 0.12f)
                                        else -> StatusActive.copy(alpha = 0.12f)
                                    }
                                ) {
                                    Text(
                                        text = "${capability.category.uppercase()} • ${capability.riskLevel.uppercase()} RISK",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                        color = when (capability.riskLevel) {
                                            "High" -> StatusError
                                            "Medium" -> StatusWarning
                                            else -> StatusActive
                                        },
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                    )
                                }
                            }

                            // Toggle Switch
                            Switch(
                                checked = isGranted,
                                onCheckedChange = { checked ->
                                    if (capability == ContrilCapability.ACCESSIBILITY_AUTOMATION) {
                                        PermissionManager.openAccessibilitySettings(context)
                                    } else if (capability == ContrilCapability.NOTIFICATIONS) {
                                        PermissionManager.openAppSettings(context)
                                    } else {
                                        prefRepository.setPermission(capability.id, checked)
                                    }
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = ContrilBlue,
                                    uncheckedThumbColor = TextSecondaryLight,
                                    uncheckedTrackColor = ContrilLightBgBottom
                                )
                            )
                        }

                        Text(
                            text = capability.title,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryLight
                        )

                        Text(
                            text = capability.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondaryLight
                        )

                        // Plain English Rationale Accordion/Link
                        TextButton(
                            onClick = { selectedCapabilityForModal = capability },
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text(
                                text = "Why does Contril need this? →",
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                color = ContrilBlue
                            )
                        }
                    }
                }
            }
        }
    }

    // Capability Detail & Rationale Modal
    selectedCapabilityForModal?.let { cap ->
        AlertDialog(
            onDismissRequest = { selectedCapabilityForModal = null },
            confirmButton = {
                Button(
                    onClick = { selectedCapabilityForModal = null },
                    colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                ) {
                    Text("Got It", color = Color.White)
                }
            },
            title = {
                Text(
                    text = cap.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimaryLight
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = cap.plainEnglishRationale,
                        style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                        color = TextPrimaryLight
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = ContrilLightBgBottom,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Privacy Guarantee: Data processed under this permission is never sold or used for model training.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondaryLight,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            },
            containerColor = ContrilLightSurface,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

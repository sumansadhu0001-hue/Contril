package com.contril.app.ui.settings

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowForwardIos
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.contril.app.data.model.AutonomyMode
import com.contril.app.theme.*

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val currentAutonomy by viewModel.autonomyMode.collectAsState()
    val isAutoSendEnabled by viewModel.isAutoSendEnabled.collectAsState()
    val isOvernightAutonomyEnabled by viewModel.isOvernightAutonomyEnabled.collectAsState()
    val user by viewModel.currentUser.collectAsState()
    val connectedMap by viewModel.connectedServices.collectAsState()
    val currentPlan by viewModel.currentPlan.collectAsState()

    val context = LocalContext.current
    var showSignOutDialog by remember { mutableStateOf(false) }

    val powerManager = remember { context.getSystemService(Context.POWER_SERVICE) as? PowerManager }
    val isIgnoringBattery = remember(context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            powerManager?.isIgnoringBatteryOptimizations(context.packageName) == true
        } else true
    }

    var hasNotificationPermission by remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            } else true
        )
    }

    var hasMicrophonePermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        )
    }

    val notificationLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { hasNotificationPermission = it }

    val micLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { hasMicrophonePermission = it }

    val openGoogleOAuth = {
        try {
            val oauthUrl = com.contril.app.data.api.SupabaseAuthClient.getGoogleWorkspaceOAuthUrl()
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl))
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(browserIntent)
        } catch (_: Exception) {}
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 40.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(top = 4.dp)) {
                Text(
                    text = "SETTINGS & PROFILE",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.4.sp,
                        fontSize = 11.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "System Controls",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = TextPrimaryLight
                )
            }
        }

        // 1. Executive Profile Card
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(ContrilMidnight),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = user?.initials ?: "CO",
                                color = Color.White,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = user?.name?.ifBlank { "Executive User" } ?: "Executive User",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimaryLight
                            )
                            Text(
                                text = user?.email ?: "sumansadhu0001@gmail.com",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondaryLight
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = ContrilBlue.copy(alpha = 0.10f)
                        ) {
                            Text(
                                text = currentPlan.ifBlank { "Autonomous Elite" },
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                ),
                                color = ContrilBlue,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = { showSignOutDialog = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusError),
                        border = BorderStroke(1.dp, StatusError.copy(alpha = 0.3f)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().height(42.dp)
                    ) {
                        Icon(Icons.Outlined.Logout, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Sign Out", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                }
            }
        }

        // 2. Connected Workspace Tools
        item {
            Text(
                text = "CONNECTED TOOLS",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp,
                    fontSize = 11.sp
                ),
                color = TextSecondaryLight,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    val isGmail = connectedMap.containsKey("gmail") || connectedMap.containsKey("google_workspace")
                    val isCal = connectedMap.containsKey("calendar") || connectedMap.containsKey("google_workspace")

                    SettingsIntegrationRow(
                        title = "Gmail Intelligence",
                        subtitle = if (isGmail) "Synced & Active" else "Not Connected",
                        isConnected = isGmail,
                        onConnect = openGoogleOAuth
                    )
                    HorizontalDivider(color = Color(0xFFF4F4F5))
                    SettingsIntegrationRow(
                        title = "Google Calendar",
                        subtitle = if (isCal) "Schedule Sync Active" else "Not Connected",
                        isConnected = isCal,
                        onConnect = openGoogleOAuth
                    )
                }
            }
        }

        // 3. System Permissions & Background Enclave
        item {
            Text(
                text = "SYSTEM ENCLAVE & PERMISSIONS",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp,
                    fontSize = 11.sp
                ),
                color = TextSecondaryLight,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    SettingsPermissionRow(
                        title = "Push Notifications",
                        subtitle = "Priority briefings & urgent email alerts",
                        isGranted = hasNotificationPermission,
                        onRequest = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            }
                        }
                    )
                    HorizontalDivider(color = Color(0xFFF4F4F5))
                    SettingsPermissionRow(
                        title = "Voice Input & Mic",
                        subtitle = "Instant executive dictation & voice reasoning",
                        isGranted = hasMicrophonePermission,
                        onRequest = { micLauncher.launch(Manifest.permission.RECORD_AUDIO) }
                    )
                    HorizontalDivider(color = Color(0xFFF4F4F5))
                    SettingsPermissionRow(
                        title = "Overnight Background Sync",
                        subtitle = "Allows scheduled overnight scan while device rests",
                        isGranted = isIgnoringBattery,
                        onRequest = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:${context.packageName}")
                                }
                                context.startActivity(intent)
                            }
                        }
                    )
                }
            }
        }

        // 4. Autonomy Mode
        item {
            Text(
                text = "AI AUTONOMY LEVEL",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp,
                    fontSize = 11.sp
                ),
                color = TextSecondaryLight,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AutonomyModeOption(
                        mode = AutonomyMode.AUTO_APPROVE,
                        title = "Full Autonomous Executive",
                        desc = "Prepares and executes non-destructive actions with real-time audit logging.",
                        isSelected = currentAutonomy == AutonomyMode.AUTO_APPROVE,
                        onSelect = { viewModel.setAutonomyMode(AutonomyMode.AUTO_APPROVE) }
                    )
                    AutonomyModeOption(
                        mode = AutonomyMode.SENSITIVE_ONLY,
                        title = "Sensitive Only (Recommended)",
                        desc = "Auto-executes internal queries; asks confirmation before sending emails.",
                        isSelected = currentAutonomy == AutonomyMode.SENSITIVE_ONLY,
                        onSelect = { viewModel.setAutonomyMode(AutonomyMode.SENSITIVE_ONLY) }
                    )
                    AutonomyModeOption(
                        mode = AutonomyMode.ALWAYS_ASK,
                        title = "Manual Approval Required",
                        desc = "Prompts for confirmation before every single action or draft reply.",
                        isSelected = currentAutonomy == AutonomyMode.ALWAYS_ASK,
                        onSelect = { viewModel.setAutonomyMode(AutonomyMode.ALWAYS_ASK) }
                    )
                }
            }
        }
    }

    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            containerColor = Color.White,
            shape = RoundedCornerShape(18.dp),
            title = { Text("Sign Out", fontWeight = FontWeight.Bold, color = TextPrimaryLight) },
            text = { Text("Are you sure you want to sign out of Contril AI OS?", color = TextSecondaryLight) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.logout()
                        showSignOutDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusError),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Sign Out", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text("Cancel", color = TextSecondaryLight)
                }
            }
        )
    }
}

@Composable
fun SettingsIntegrationRow(
    title: String,
    subtitle: String,
    isConnected: Boolean,
    onConnect: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimaryLight)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = if (isConnected) StatusActive else TextSecondaryLight)
        }
        if (isConnected) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFF0FDF4),
                border = BorderStroke(1.dp, Color(0xFFBBF7D0))
            ) {
                Text("Connected", color = Color(0xFF166534), style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
            }
        } else {
            Button(
                onClick = onConnect,
                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text("Connect", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun SettingsPermissionRow(
    title: String,
    subtitle: String,
    isGranted: Boolean,
    onRequest: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimaryLight)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp), color = TextSecondaryLight)
        }
        if (isGranted) {
            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = StatusActive, modifier = Modifier.size(22.dp))
        } else {
            OutlinedButton(
                onClick = onRequest,
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, ContrilBlue),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text("Grant", color = ContrilBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun AutonomyModeOption(
    mode: AutonomyMode,
    title: String,
    desc: String,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) ContrilBlue.copy(alpha = 0.06f) else Color(0xFFFAFAF9),
        border = BorderStroke(1.dp, if (isSelected) ContrilBlue else Color(0xFFE4E4E7)),
        modifier = Modifier.fillMaxWidth().clickable { onSelect() }
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            RadioButton(
                selected = isSelected,
                onClick = onSelect,
                colors = RadioButtonDefaults.colors(selectedColor = ContrilBlue)
            )
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(text = title, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimaryLight)
                Text(text = desc, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp), color = TextSecondaryLight)
            }
        }
    }
}

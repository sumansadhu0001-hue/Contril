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
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.theme.*

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val currentAutonomy by viewModel.autonomyMode.collectAsState()
    val isAutoSendEnabled by viewModel.isAutoSendEnabled.collectAsState()
    val isOvernightAutonomyEnabled by viewModel.isOvernightAutonomyEnabled.collectAsState()
    val overnightServiceState by viewModel.overnightServiceState.collectAsState()
    val activityLogs by viewModel.activityLogs.collectAsState()
    val user by viewModel.currentUser.collectAsState()
    val connectedMap by viewModel.connectedServices.collectAsState()
    val currentPlan by viewModel.currentPlan.collectAsState()
    val isEliteUser = currentPlan.equals("Elite", ignoreCase = true) || currentPlan.equals("Autonomous Pro", ignoreCase = true) || currentPlan.equals("Elite Plan", ignoreCase = true)

    var showSignOutDialog by remember { mutableStateOf(false) }
    var showOvernightExplanationDialog by remember { mutableStateOf(false) }
    var showActivityLogDialog by remember { mutableStateOf(false) }
    var showUpgradeToEliteDialog by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val powerManager = remember { context.getSystemService(Context.POWER_SERVICE) as? PowerManager }
    val isIgnoringBatteryOptimizations = remember(context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            powerManager?.isIgnoringBatteryOptimizations(context.packageName) == true
        } else true
    }

    // Runtime Permission state checkers
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
    ) { isGranted ->
        hasNotificationPermission = isGranted
    }

    val micLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasMicrophonePermission = isGranted
    }

    val networkMonitor = remember { com.contril.app.data.network.NetworkMonitor.getInstance(context) }
    val isOnline by networkMonitor.isOnline.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 32.dp)
    ) {
        item {
            com.contril.app.ui.components.OfflineBanner(
                isOnline = isOnline,
                hasCachedData = true
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "CONTROLS & PREFERENCES",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "Settings",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Manage your executive profile, system permissions, and autonomy preferences.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 1. ACCOUNT & PROFILE
        item {
            Text(
                text = "ACCOUNT & PROFILE",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue),
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
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = user?.email?.ifBlank { "Signed in" } ?: "Signed in",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = { showSignOutDialog = true },
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        ),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Outlined.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Sign Out", fontWeight = FontWeight.Medium)
                    }
                }
            }
        }

        // 2. CONNECTED TOOLS STATUS
        item {
            Text(
                text = "CONNECTED TOOLS STATUS",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ConnectedRow(
                        name = "Gmail",
                        desc = "Email intelligence & draft approval",
                        isConnected = connectedMap.containsKey("gmail") || connectedMap.containsKey("google_workspace") || connectedMap.containsKey("google")
                    )
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                    ConnectedRow(
                        name = "Google Calendar",
                        desc = "Schedule sync & meeting context",
                        isConnected = connectedMap.containsKey("calendar") || connectedMap.containsKey("google_workspace") || connectedMap.containsKey("google")
                    )
                }
            }
        }

        // 3. SYSTEM PERMISSIONS (Explicit Android Runtime Permission Management)
        item {
            Text(
                text = "SYSTEM PERMISSIONS",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Notification Permission Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Notifications,
                                contentDescription = null,
                                tint = if (hasNotificationPermission) StatusActive else ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text(
                                    text = "Notifications",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Required for action approval alerts",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        if (hasNotificationPermission) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = StatusActive.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "Granted",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = StatusActive,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        } else {
                            Button(
                                onClick = {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                        notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text("Allow", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    // Microphone Permission Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Mic,
                                contentDescription = null,
                                tint = if (hasMicrophonePermission) StatusActive else ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text(
                                    text = "Microphone",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Required for audio voice commands",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        if (hasMicrophonePermission) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = StatusActive.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "Granted",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = StatusActive,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        } else {
                            Button(
                                onClick = { micLauncher.launch(Manifest.permission.RECORD_AUDIO) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text("Allow", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            }
                        }
                    }
                }
            }
        }

        // 4. AUTONOMY LEVEL
        item {
            Text(
                text = "AUTONOMY LEVEL",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue,
                modifier = Modifier.padding(top = 6.dp)
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

        // 4b. OPT-IN AUTO-SEND MODE (OFF BY DEFAULT)
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isAutoSendEnabled) StatusWarning.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Send,
                                contentDescription = null,
                                tint = if (isAutoSendEnabled) StatusWarning else ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text(
                                    text = "Auto-Send Mode",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = if (isAutoSendEnabled) "Enabled (Opt-in active)" else "Disabled (Manual approval default)",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = if (isAutoSendEnabled) StatusWarning else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Switch(
                            checked = isAutoSendEnabled,
                            onCheckedChange = { viewModel.setAutoSendEnabled(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = StatusWarning
                            )
                        )
                    }

                    Text(
                        text = "When enabled, Contril may automatically send AI-drafted replies to emails it identifies as needing a response, without asking you first. You can turn this off anytime.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    )

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Shield,
                                contentDescription = null,
                                tint = StatusWarning,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "🔒 Scoping & Audit: Every auto-sent reply is permanently recorded in your Activity Log with full text and recipient.",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // 4c. OVERNIGHT AUTONOMY MODE (ELITE PLAN ₹3999 FEATURE - OFF BY DEFAULT)
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(
                    1.dp,
                    if (isOvernightAutonomyEnabled && isEliteUser) Color(0xFF6366F1).copy(alpha = 0.6f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                ),
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    if (!isEliteUser) {
                        showUpgradeToEliteDialog = true
                    } else if (!isOvernightAutonomyEnabled) {
                        showOvernightExplanationDialog = true
                    }
                }
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .background(
                                        if (isEliteUser) Color(0xFF6366F1).copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant,
                                        RoundedCornerShape(8.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (isEliteUser) Icons.Filled.NightlightRound else Icons.Filled.Lock,
                                    contentDescription = null,
                                    tint = if (isEliteUser) Color(0xFF6366F1) else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Overnight Autonomy Mode",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = if (isEliteUser) Color(0xFF6366F1).copy(alpha = 0.15f) else StatusWarning.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = if (isEliteUser) "ELITE ACTIVE" else "RESERVED FOR ELITE (₹3,999)",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 9.sp),
                                            color = if (isEliteUser) Color(0xFF6366F1) else StatusWarning,
                                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                        )
                                    }
                                    Text(
                                        text = if (!isEliteUser) "Locked" else if (isOvernightAutonomyEnabled) "Active" else "Disabled",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                        color = if (!isEliteUser) MaterialTheme.colorScheme.onSurfaceVariant else if (isOvernightAutonomyEnabled) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Switch(
                            checked = isOvernightAutonomyEnabled && isEliteUser,
                            onCheckedChange = { targetState ->
                                if (!isEliteUser) {
                                    showUpgradeToEliteDialog = true
                                } else if (targetState) {
                                    showOvernightExplanationDialog = true
                                } else {
                                    viewModel.setOvernightAutonomyEnabled(context, false)
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF6366F1)
                            )
                        )
                    }

                    Text(
                        text = "Monitors your Gmail inbox overnight via a foreground service. Extracts upcoming meetings & deadlines into Command Center priorities, and prepares AI draft replies (or auto-sends if Auto-Send Mode is active).",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    )

                    if (!isEliteUser) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = StatusWarning.copy(alpha = 0.08f),
                            border = BorderStroke(1.dp, StatusWarning.copy(alpha = 0.25f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Filled.Lock, contentDescription = null, tint = StatusWarning, modifier = Modifier.size(16.dp))
                                Text(
                                    text = "Overnight background execution is reserved exclusively for the Elite Plan (₹3,999/mo). Free and ₹899 Pro plans do not include overnight autonomy.",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        Button(
                            onClick = { showUpgradeToEliteDialog = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                        ) {
                            Icon(Icons.Filled.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Upgrade to Elite (₹3,999) to Unlock", fontWeight = FontWeight.Bold)
                        }
                    } else if (!isOvernightAutonomyEnabled) {
                        Button(
                            onClick = { showOvernightExplanationDialog = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                        ) {
                            Icon(Icons.Filled.NightlightRound, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Enable Overnight Autonomy", fontWeight = FontWeight.Bold)
                        }
                    }

                    if (isOvernightAutonomyEnabled) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF6366F1).copy(alpha = 0.08f),
                            border = BorderStroke(1.dp, Color(0xFF6366F1).copy(alpha = 0.2f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "⚡ Overnight Token Budget",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = Color(0xFF6366F1)
                                    )
                                    Text(
                                        text = "${overnightServiceState.tokensUsedTonight} / ${overnightServiceState.tokenBudgetMax} used",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                                LinearProgressIndicator(
                                    progress = { (overnightServiceState.tokensUsedTonight.toFloat() / overnightServiceState.tokenBudgetMax.toFloat()).coerceIn(0f, 1f) },
                                    modifier = Modifier.fillMaxWidth().height(4.dp),
                                    color = Color(0xFF6366F1),
                                    trackColor = Color(0xFF6366F1).copy(alpha = 0.2f)
                                )
                            }
                        }
                    }

                    OutlinedButton(
                        onClick = { showActivityLogDialog = true },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF6366F1))
                    ) {
                        Icon(Icons.Filled.HistoryEdu, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("View Activity Log (${activityLogs.size} events)")
                    }
                }
            }
        }

        // 5. SECURITY
        item {
            Text(
                text = "PRIVACY & SECURITY",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
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
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Text(
                        text = "Session keys and tokens are stored securely in Android Keystore with zero hardcoded credentials.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // 6. ABOUT
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = "Contril for Android",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Version 0.2.0-native",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        text = "Production Release",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = ContrilBlue
                    )
                }
            }
        }
    }

    // Sign Out Confirmation Dialog
    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = {
                Text(
                    text = "Sign Out of Contril?",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Text(
                    text = "You will need to sign in again to access your connected services and executive assistant.",
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSignOutDialog = false
                        viewModel.logout()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Sign Out")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text("Cancel")
                }
            },
            shape = RoundedCornerShape(18.dp)
        )
    }

    // Overnight Autonomy Explanation & Activation Modal
    if (showOvernightExplanationDialog) {
        AlertDialog(
            onDismissRequest = { showOvernightExplanationDialog = false },
            icon = {
                Icon(Icons.Filled.NightlightRound, contentDescription = null, tint = Color(0xFF6366F1), modifier = Modifier.size(32.dp))
            },
            title = {
                Text(
                    text = "Enable Overnight Autonomy",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Contril will monitor your inbox overnight via a sustained Android Foreground Service.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("🛡️ What happens overnight:", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            Text("• Scans unread emails every 20 minutes", style = MaterialTheme.typography.bodySmall)
                            Text("• Extracts meetings & deadlines to Today's Priorities", style = MaterialTheme.typography.bodySmall)
                            Text("• Prepares AI drafts (strictly adheres to Auto-Send Mode)", style = MaterialTheme.typography.bodySmall)
                            Text("• Capped at 150 tokens max per night", style = MaterialTheme.typography.bodySmall)
                            Text("• Shows persistent notification with 1-tap Stop", style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    if (!isIgnoringBatteryOptimizations && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = StatusWarning.copy(alpha = 0.12f),
                            border = BorderStroke(1.dp, StatusWarning.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(Icons.Filled.BatteryAlert, contentDescription = null, tint = StatusWarning, modifier = Modifier.size(16.dp))
                                    Text(
                                        text = "Battery Exemption Recommended",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = StatusWarning
                                    )
                                }
                                Text(
                                    text = "To prevent Android battery saver from killing the overnight monitor, allow background exemption.",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                OutlinedButton(
                                    onClick = {
                                        try {
                                            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                                data = Uri.parse("package:${context.packageName}")
                                            }
                                            context.startActivity(intent)
                                        } catch (_: Throwable) {
                                            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                                            context.startActivity(intent)
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusWarning)
                                ) {
                                    Text("Grant Exemption")
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showOvernightExplanationDialog = false
                        viewModel.setOvernightAutonomyEnabled(context, true)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Confirm & Activate")
                }
            },
            dismissButton = {
                TextButton(onClick = { showOvernightExplanationDialog = false }) {
                    Text("Cancel")
                }
            },
            shape = RoundedCornerShape(18.dp)
        )
    }

    // Activity Log Modal
    if (showActivityLogDialog) {
        ActivityLogDialog(
            logs = activityLogs,
            onDismiss = { showActivityLogDialog = false },
            onPurgeLogs = { viewModel.purgeOldLogs() }
        )
    }

    // Elite Plan Upgrade Prompt Modal
    if (showUpgradeToEliteDialog) {
        AlertDialog(
            onDismissRequest = { showUpgradeToEliteDialog = false },
            icon = {
                Icon(Icons.Filled.Lock, contentDescription = null, tint = Color(0xFF6366F1), modifier = Modifier.size(32.dp))
            },
            title = {
                Text(
                    text = "Elite Plan Exclusive",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Overnight Autonomy Mode is exclusively available on the Elite Plan (₹3,999/month).",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Upgrade to unlock 24/7 background AI executive triage, meeting extraction, and automated replies.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showUpgradeToEliteDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Upgrade to Elite (₹3,999)")
                }
            },
            dismissButton = {
                TextButton(onClick = { showUpgradeToEliteDialog = false }) {
                    Text("Maybe Later")
                }
            },
            shape = RoundedCornerShape(18.dp)
        )
    }
}

@Composable
fun ConnectedRow(name: String, desc: String, isConnected: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                text = name,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Surface(
            shape = RoundedCornerShape(6.dp),
            color = if (isConnected) StatusActive.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant
        ) {
            Text(
                text = if (isConnected) "Connected" else "Not connected",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (isConnected) StatusActive else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
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
            if (isSelected) ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
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
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
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

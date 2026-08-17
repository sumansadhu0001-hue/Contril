package com.contril.app.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.model.PriorityItem
import com.contril.app.theme.*
import com.contril.app.ui.components.*

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToTasks: () -> Unit,
    onNavigateToBriefing: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    val voiceManager = remember { VoiceAssistantManager(context) }
    val voiceState by voiceManager.voiceState.collectAsState()
    val voiceError by voiceManager.errorMessage.collectAsState()

    val micPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            voiceManager.startListening(
                onPartialResult = { viewModel.onCommandTextChanged(it) },
                onFinalResult = { viewModel.onCommandTextChanged(it) }
            )
        } else {
            voiceManager.setError("Microphone permission was denied. Tap to grant microphone access for voice commands.")
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            voiceManager.stopListening()
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp)
    ) {
        // 1. Executive Greeting Section (Dynamic from authenticated user profile)
        item {
            val firstName = uiState.currentUser?.name?.trim()?.split("\\s+".toRegex())?.firstOrNull { it.isNotBlank() } ?: "there"
            val hour = java.time.LocalTime.now().hour
            val timeGreeting = when {
                hour < 12 -> "Good morning"
                hour < 17 -> "Good afternoon"
                else -> "Good evening"
            }

            Column(
                modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "COMMAND CENTER",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    color = ContrilBlue
                )

                Text(
                    text = "$timeGreeting,\n$firstName.",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp,
                        lineHeight = 34.sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )

                Text(
                    text = when {
                        uiState.connectedServicesCount == 0 -> "Connect your tools in the Profile Hub to give Contril context."
                        uiState.priorities.isNotEmpty() -> "You have ${uiState.priorities.size} priority items requiring review."
                        else -> "All caught up across your ${uiState.connectedServicesCount} connected tools."
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Today's Briefing Hero Card
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToBriefing() }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Article,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(
                                text = "Today's Briefing",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "View schedule, meetings, and priority actions",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "View Briefing",
                        tint = ContrilBlue,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // 2. Active Voice Listening / Feedback Surface
        if (voiceState == VoiceState.LISTENING || voiceState == VoiceState.PROCESSING) {
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = ContrilBlue.copy(alpha = 0.08f),
                    border = BorderStroke(1.dp, ContrilBlue.copy(alpha = 0.35f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Mic,
                                contentDescription = "Listening",
                                tint = ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text(
                                    text = if (voiceState == VoiceState.LISTENING) "Listening..." else "Processing audio...",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = ContrilBlue
                                )
                                Text(
                                    text = "Speak your request naturally to Contril",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        TextButton(onClick = { voiceManager.stopListening() }) {
                            Text("Stop", color = ContrilBlue, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }

        if (voiceError != null) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.errorContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = voiceError ?: "",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = { voiceManager.clearError() }) {
                            Text("Dismiss", color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }

        // 3. AI Command Surface
        item {
            CommandInputField(
                value = uiState.commandText,
                onValueChange = { viewModel.onCommandTextChanged(it) },
                onExecute = {
                    voiceManager.stopListening()
                    viewModel.executeCommand(context = context)
                },
                isLoading = uiState.isLoading || uiState.isComparingPrices,
                isListening = voiceState == VoiceState.LISTENING,
                onVoiceClick = {
                    if (voiceState == VoiceState.LISTENING) {
                        voiceManager.stopListening()
                    } else {
                        val hasMic = ContextCompat.checkSelfPermission(
                            context,
                            Manifest.permission.RECORD_AUDIO
                        ) == PackageManager.PERMISSION_GRANTED

                        if (hasMic) {
                            voiceManager.startListening(
                                onPartialResult = { viewModel.onCommandTextChanged(it) },
                                onFinalResult = { viewModel.onCommandTextChanged(it) }
                            )
                        } else {
                            micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }
                    }
                }
            )
        }

        // 3b. On-Device Price Comparison Active Scanning Banner
        if (uiState.isComparingPrices) {
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = ContrilBlue.copy(alpha = 0.10f),
                    border = BorderStroke(1.dp, ContrilBlue.copy(alpha = 0.35f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp,
                            color = ContrilBlue
                        )
                        Text(
                            text = uiState.comparisonStatus ?: "Scanning food platforms on your device...",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // 3c. On-Device Price Comparison Results Card
        if (uiState.comparisonResult != null) {
            item {
                ComparisonResultsView(
                    result = uiState.comparisonResult!!,
                    onDismiss = { viewModel.dismissComparisonResult() },
                    onViewAuditLogs = { viewModel.showAuditLogs(true) }
                )
            }
        }

        // 3d. Elegant Quick Action Pills
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 2.dp)
            ) {
                items(uiState.suggestedPrompts) { prompt ->
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                        modifier = Modifier.clickable { viewModel.executeCommand(prompt, context) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.AutoAwesome,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(13.dp)
                            )
                            Text(
                                text = prompt,
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // 4. Live AI Response Surface (Shown ONLY when the user executes a real command)
        if (uiState.latestResponse != null) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
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
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                ContrilLogoMark(modifier = Modifier.size(18.dp))
                                Text(
                                    text = "CONTRIL",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.sp
                                    ),
                                    color = ContrilBlue
                                )
                            }

                            IconButton(
                                onClick = { viewModel.dismissResponse() },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Close,
                                    contentDescription = "Dismiss",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        Text(
                            text = uiState.latestResponse?.responseText ?: "",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // 5. Pending Action Gates (Only rendered if genuine action needs user confirmation)
        if (uiState.pendingActions.isNotEmpty()) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "CONFIRMATION REQUIRED",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        ),
                        color = ContrilBlue
                    )
                    uiState.pendingActions.forEach { action ->
                        ActionApprovalCard(
                            action = action,
                            onApprove = { viewModel.approveAction(action.id) },
                            onReject = { viewModel.rejectAction(action.id) }
                        )
                    }
                }
            }
        }

        // 7. Today's Priorities
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "TODAY'S PRIORITIES",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "View all",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                    color = ContrilBlue,
                    modifier = Modifier.clickable { onNavigateToTasks() }
                )
            }
        }

        // 6. Active Priorities (Rendered ONLY if real priorities exist)
        if (uiState.priorities.isNotEmpty()) {
            item {
                Text(
                    text = "ACTION ITEMS",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = ContrilBlue
                )
            }
            items(uiState.priorities) { item ->
                PriorityRowItem(item = item)
            }
        }
    }

    if (uiState.showConsentModal) {
        ComparisonConsentModal(
            onDismiss = { viewModel.dismissConsentModal() },
            onGrantPermission = { viewModel.onConsentGranted(context) }
        )
    }

    if (uiState.showAuditModal) {
        AuditHistorySheet(
            logs = uiState.auditLogs,
            onDismiss = { viewModel.showAuditLogs(false) },
            onRevokePermission = { viewModel.revokeAccessibilityPermission(context) }
        )
    }
}

@Composable
fun PriorityRowItem(item: PriorityItem) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    if (item.isUrgent) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = StatusWarning.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "URGENT",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = StatusWarning,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
                            )
                        }
                    }
                }
                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.padding(start = 8.dp)
            ) {
                Text(
                    text = item.serviceTag,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

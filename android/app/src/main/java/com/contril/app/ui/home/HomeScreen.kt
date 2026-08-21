package com.contril.app.ui.home

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.material.icons.filled.*
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
import androidx.core.content.ContextCompat
import com.contril.app.theme.*
import com.contril.app.ui.components.*

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToTasks: () -> Unit,
    onNavigateToBriefing: () -> Unit,
    onNavigateToChat: (String) -> Unit,
    onNavigateToIntegrations: () -> Unit,
    onNavigateToPermissions: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    var isListening by remember { mutableStateOf(false) }

    val firstName = uiState.currentUser?.name?.trim()?.split("\\s+".toRegex())?.firstOrNull { it.isNotBlank() } ?: "Suman"

    val speechRecognizer = remember { InAppSpeechRecognizer(context) }
    DisposableEffect(Unit) {
        onDispose { speechRecognizer.destroy() }
    }

    val audioPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            isListening = true
            speechRecognizer.startListening { spokenText ->
                isListening = false
                if (spokenText.isNotBlank()) {
                    onNavigateToChat(spokenText)
                }
            }
        }
    }

    val openGoogleOAuth = {
        try {
            val oauthUrl = com.contril.app.data.api.SupabaseAuthClient.getGoogleWorkspaceOAuthUrl()
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl))
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(browserIntent)
        } catch (_: Exception) {
            onNavigateToIntegrations()
        }
    }

    val hour = remember {
        try {
            java.time.LocalTime.now().hour
        } catch (_: Throwable) { 10 }
    }

    val dynamicGreeting = when {
        hour < 12 -> "Good morning"
        hour < 17 -> "Good afternoon"
        hour < 22 -> "Good evening"
        else -> "Good night"
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 40.dp)
    ) {
        // 0. Connectivity & Update Status
        item {
            OfflineBanner(
                isOnline = uiState.isOnline,
                hasCachedData = true
            )
            DismissibleAppUpdateBanner(
                latestVersion = uiState.latestAppVersion,
                downloadUrl = uiState.appDownloadUrl
            )
        }

        // 1. Command Center Header
        item {
            Column(
                modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "$dynamicGreeting, $firstName.",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp,
                            letterSpacing = (-0.4).sp
                        ),
                        color = MaterialTheme.colorScheme.onBackground
                    )

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (uiState.connectedServicesCount > 0) StatusActive.copy(alpha = 0.10f) else Color(0xFFF1F5F9),
                        border = BorderStroke(1.dp, if (uiState.connectedServicesCount > 0) StatusActive.copy(alpha = 0.25f) else Color(0xFFE2E8F0)),
                        onClick = onNavigateToIntegrations
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(if (uiState.connectedServicesCount > 0) StatusActive else Color(0xFF94A3B8))
                            )
                            Text(
                                text = if (uiState.connectedServicesCount > 0) "${uiState.connectedServicesCount} connected" else "Not connected",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Medium),
                                color = if (uiState.connectedServicesCount > 0) StatusActive else TextSecondaryLight
                            )
                        }
                    }
                }

                Text(
                    text = if (uiState.connectedServicesCount == 0)
                        "Connect your workspace to activate schedule & email intelligence."
                    else
                        "Chief of Staff active across your connected tools.",
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                    color = TextSecondaryLight
                )
            }
        }

        // 2. Primary Command Input Surface
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 2.dp,
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(ContrilBlue.copy(alpha = 0.10f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.AutoAwesome, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(16.dp))
                    }

                    Text(
                        text = if (isListening) "Listening..." else "Ask Contril anything…",
                        style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp),
                        color = if (isListening) ContrilBlue else TextMutedLight,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToChat("") }
                    )

                    if (isListening) {
                        VoiceWaveVisualizer(isListening = true)
                    }

                    IconButton(
                        onClick = {
                            val hasPermission = ContextCompat.checkSelfPermission(
                                context,
                                Manifest.permission.RECORD_AUDIO
                            ) == PackageManager.PERMISSION_GRANTED

                            if (hasPermission) {
                                isListening = true
                                speechRecognizer.startListening { spokenText ->
                                    isListening = false
                                    if (spokenText.isNotBlank()) onNavigateToChat(spokenText)
                                }
                            } else {
                                audioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Mic,
                            contentDescription = "Voice Command",
                            tint = if (isListening) StatusActive else TextSecondaryLight,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { onNavigateToChat("") },
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(ContrilBlue)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = "Submit",
                            tint = Color.White,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
        }

        // 3. ATTENTION Section
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "ATTENTION",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.1.sp,
                        fontSize = 11.sp
                    ),
                    color = TextSecondaryLight
                )

                if (uiState.priorities.isEmpty() && uiState.pendingActions.isEmpty()) {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = StatusActive, modifier = Modifier.size(18.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("You're clear.", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 13.sp), color = MaterialTheme.colorScheme.onSurface)
                                Text("Nothing currently requires your attention.", style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp), color = TextSecondaryLight)
                            }
                        }
                    }
                }
            }
        }

        if (uiState.priorities.isNotEmpty()) {
            items(uiState.priorities.take(3)) { priority ->
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier.fillMaxWidth().clickable { onNavigateToChat("Execute priority: ${priority.title}") }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (priority.isUrgent) StatusError else ContrilBlue)
                            )
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text(
                                    text = priority.title,
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 13.sp),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = priority.description,
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = TextSecondaryLight,
                                    maxLines = 1
                                )
                            }
                        }
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = TextMutedLight,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }

        // 4. TODAY (Executive Briefing Access & Fast Agenda)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TODAY",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.1.sp,
                            fontSize = 11.sp
                        ),
                        color = TextSecondaryLight
                    )

                    Text(
                        text = "Today's briefing →",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = ContrilBlue,
                            fontSize = 12.sp
                        ),
                        modifier = Modifier.clickable { onNavigateToBriefing() }
                    )
                }

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier.fillMaxWidth().clickable { onNavigateToBriefing() }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(ContrilBlue.copy(alpha = 0.08f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.AutoMirrored.Outlined.Article, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(16.dp))
                            }
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("Executive Briefing", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 13.sp), color = MaterialTheme.colorScheme.onSurface)
                                Text("Synthesized schedule, unread mail & action items", style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = TextSecondaryLight)
                            }
                        }
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = TextMutedLight, modifier = Modifier.size(14.dp))
                    }
                }
            }
        }

        // 5. CONNECTED SERVICES
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "CONNECTED",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.1.sp,
                        fontSize = 11.sp
                    ),
                    color = TextSecondaryLight
                )

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
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
                                Icon(Icons.Outlined.Mail, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(16.dp))
                                Text("Gmail", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium, fontSize = 13.sp))
                            }
                            Text(
                                text = if (uiState.connectedServicesCount > 0) "Connected" else "Not connected",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 11.sp,
                                    color = if (uiState.connectedServicesCount > 0) StatusActive else ContrilBlue
                                ),
                                modifier = Modifier.clickable {
                                    if (uiState.connectedServicesCount == 0) openGoogleOAuth() else onNavigateToIntegrations()
                                }
                            )
                        }

                        HorizontalDivider(color = Color(0xFFF1F5F9))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Outlined.CalendarToday, contentDescription = null, tint = StatusActive, modifier = Modifier.size(16.dp))
                                Text("Google Calendar", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium, fontSize = 13.sp))
                            }
                            Text(
                                text = if (uiState.connectedServicesCount > 0) "Connected" else "Not connected",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 11.sp,
                                    color = if (uiState.connectedServicesCount > 0) StatusActive else ContrilBlue
                                ),
                                modifier = Modifier.clickable {
                                    if (uiState.connectedServicesCount == 0) openGoogleOAuth() else onNavigateToIntegrations()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

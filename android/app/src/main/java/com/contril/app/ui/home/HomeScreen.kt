package com.contril.app.ui.home

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.model.PriorityItem
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
    var inputQuery by remember { mutableStateOf("") }

    val firstName = uiState.currentUser?.name?.trim()?.split("\\s+".toRegex())?.firstOrNull { it.isNotBlank() } ?: "there"
    val festivalGreeting = remember { com.contril.app.data.model.FestivalCalendar.getTodaysFestivalGreeting() }

    val speechRecognizer = remember { InAppSpeechRecognizer(context) }
    DisposableEffect(Unit) {
        onDispose { speechRecognizer.destroy() }
    }

    val audioPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            speechRecognizer.startListening { spokenText ->
                if (spokenText.isNotBlank()) {
                    onNavigateToChat(spokenText)
                }
            }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 32.dp)
    ) {
        // 0. App-Wide Real-Time Offline Banner & Remote Update Banner
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

        // 1. Executive Greeting Section
        item {
            val hour = java.time.LocalTime.now().hour
            val timeGreeting = when {
                hour < 12 -> "Good morning"
                hour < 17 -> "Good afternoon"
                else -> "Good evening"
            }

            // Real-data driven secondary status line
            val greetingSubtitle = when {
                uiState.connectedServicesCount == 0 ->
                    "Connect your executive tools to activate autonomous intelligence."
                uiState.priorities.isNotEmpty() ->
                    "${uiState.priorities.size} priority item${if (uiState.priorities.size > 1) "s" else ""} require your attention today."
                else ->
                    "You're all caught up across your ${uiState.connectedServicesCount} connected workspace tools."
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp, bottom = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "COMMAND CENTER",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            letterSpacing = 1.5.sp
                        ),
                        color = ContrilBlue
                    )

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = ContrilLightSurface,
                        shadowElevation = 2.dp,
                        onClick = onNavigateToPermissions
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Shield,
                                contentDescription = "Permissions",
                                tint = ContrilBlue,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Privacy & Permissions",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, fontWeight = FontWeight.Medium),
                                color = TextSecondaryLight
                            )
                        }
                    }
                }

                Text(
                    text = "$timeGreeting,\n$firstName.",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 28.sp,
                        letterSpacing = (-0.5).sp,
                        lineHeight = 34.sp
                    ),
                    color = TextPrimaryLight
                )

                Text(
                    text = greetingSubtitle,
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 15.sp),
                    color = TextSecondaryLight
                )
            }
        }

        // Cultural & Festival Greeting Banner (if today is an auspicious/recognized festival)
        if (festivalGreeting != null) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFFFFBEB),
                    border = BorderStroke(1.dp, Color(0xFFFDE68A)),
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = festivalGreeting.iconEmoji,
                            fontSize = 28.sp
                        )
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = java.lang.String.format(festivalGreeting.greetingTemplate, firstName),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold, fontSize = 17.sp),
                                color = Color(0xFF92400E)
                            )
                            Text(
                                text = festivalGreeting.subtitle,
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 13.sp),
                                color = Color(0xFFB45309)
                            )
                        }
                    }
                }
            }
        }

        // 2. Today's Briefing Hero Card (Minimum 20px padding, 24px icon, 17px/15px typography)
        item {
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = ContrilLightSurface,
                shadowElevation = 4.dp,
                modifier = Modifier.fillMaxWidth(),
                onClick = onNavigateToBriefing
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue.copy(alpha = 0.10f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.Article,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Today's Briefing",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold, fontSize = 17.sp),
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "View schedule, meetings, and priority actions",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 13.sp),
                                color = TextSecondaryLight
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "View Briefing",
                        tint = ContrilBlue,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }

        // 3. AI Command Input Bar -> Direct Navigation to Chat
        item {
            CommandInputField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                onExecute = {
                    if (inputQuery.isNotBlank()) {
                        val q = inputQuery
                        inputQuery = ""
                        onNavigateToChat(q)
                    }
                },
                isListening = speechRecognizer.isListening,
                placeholder = "Tell Contril what you need...",
                onVoiceClick = {
                    if (speechRecognizer.isListening) {
                        speechRecognizer.stopListening()
                    } else {
                        audioPermissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                    }
                }
            )
        }

        // 4. Dynamic Contextual Action Pills -> Navigates to Chat
        if (uiState.suggestedPrompts.isNotEmpty()) {
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(vertical = 2.dp)
                ) {
                    items(uiState.suggestedPrompts) { prompt ->
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = ContrilLightSurface,
                            shadowElevation = 4.dp,
                            onClick = { onNavigateToChat(prompt) }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.AutoAwesome,
                                    contentDescription = null,
                                    tint = ContrilBlue,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = prompt,
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                                    color = TextPrimaryLight
                                )
                            }
                        }
                    }
                }
            }
        }

        // 5. Unconnected Clean State OR Real Connected Workspace Summary
        if (uiState.connectedServicesCount == 0) {
            item {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = ContrilLightSurface,
                    shadowElevation = 6.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(ContrilAccentGradient),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Hub,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Connect Your Workspace",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = TextPrimaryLight
                                )
                                Text(
                                    text = "Link Gmail, Calendar, Drive & GitHub to enable executive briefings and automated actions.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondaryLight
                                )
                            }
                        }

                        Button(
                            onClick = onNavigateToIntegrations,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Connect Executive Tools", fontWeight = FontWeight.SemiBold, color = Color.White)
                        }
                    }
                }
            }
        } else {
            // Real Connected Workspace Summary
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

            if (uiState.priorities.isNotEmpty()) {
                items(uiState.priorities) { item ->
                    PriorityRowItem(item = item)
                }
            } else {
                item {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = ContrilLightSurface,
                        shadowElevation = 3.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.CheckCircle,
                                contentDescription = null,
                                tint = StatusActive,
                                modifier = Modifier.size(22.dp)
                            )
                            Text(
                                text = "All priority items are resolved for today.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimaryLight
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PriorityRowItem(item: PriorityItem) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = ContrilLightSurface,
        shadowElevation = 3.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(if (item.isUrgent) StatusError else ContrilBlue)
            )

            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold, fontSize = 17.sp),
                    color = TextPrimaryLight
                )
                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 15.sp),
                    color = TextSecondaryLight,
                    maxLines = 2
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = ContrilLightBgBottom
            ) {
                Text(
                    text = item.serviceTag.uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, fontWeight = FontWeight.Medium),
                    color = TextSecondaryLight,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

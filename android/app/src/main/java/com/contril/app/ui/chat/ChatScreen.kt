package com.contril.app.ui.chat

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Stop
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
import com.contril.app.theme.*
import com.contril.app.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    initialPrompt: String? = null,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val speechRecognizer = remember { InAppSpeechRecognizer(context) }
    DisposableEffect(Unit) {
        onDispose {
            speechRecognizer.destroy()
        }
    }

    val audioPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            speechRecognizer.startListening { spokenText ->
                viewModel.sendMessage(promptOverride = spokenText, context = context)
            }
        }
    }

    LaunchedEffect(initialPrompt) {
        if (!initialPrompt.isNullOrBlank()) {
            viewModel.sendMessage(promptOverride = initialPrompt, context = context)
        }
    }

    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Contril",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            ),
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Chief of Staff",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                            color = TextSecondaryLight
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onBackground
                        )
                    }
                },
                actions = {
                    val (used, limit) = uiState.aiUsage
                    val usedFmt = java.text.NumberFormat.getNumberInstance(java.util.Locale.US).format(used)
                    val limitFmt = java.text.NumberFormat.getNumberInstance(java.util.Locale.US).format(limit)
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text(
                            text = "$usedFmt / $limitFmt",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Medium,
                                fontSize = 11.sp
                            ),
                            color = TextSecondaryLight,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        bottomBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 4.dp,
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .imePadding()
                        .navigationBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (speechRecognizer.isListening) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Listening to voice command...", style = MaterialTheme.typography.labelSmall, color = ContrilBlue)
                            VoiceWaveVisualizer(isListening = true)
                        }
                    }

                    // Executive Command Surface Input
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFFF8FAFC))
                            .border(BorderStroke(1.dp, Color(0xFFE2E8F0)), RoundedCornerShape(16.dp))
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TextField(
                            value = uiState.inputText,
                            onValueChange = { viewModel.onInputTextChanged(it) },
                            placeholder = {
                                Text(
                                    if (uiState.isLoading) "Contril is thinking…" else "Ask Contril anything…",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp),
                                    color = TextMutedLight
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            enabled = !uiState.isLoading
                        )

                        if (!uiState.isLoading) {
                            IconButton(
                                onClick = {
                                    if (speechRecognizer.isListening) {
                                        speechRecognizer.stopListening()
                                    } else {
                                        audioPermissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                                    }
                                },
                                modifier = Modifier.size(34.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Mic,
                                    contentDescription = "Voice",
                                    tint = if (speechRecognizer.isListening) StatusActive else TextSecondaryLight,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            val canSend = uiState.inputText.isNotBlank()
                            IconButton(
                                onClick = { if (canSend) viewModel.sendMessage(context = context) },
                                enabled = canSend,
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(if (canSend) ContrilBlue else Color(0xFFE2E8F0))
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = "Send",
                                    tint = if (canSend) Color.White else Color(0xFF94A3B8),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        } else {
                            // Stop Button while request is streaming/processing
                            IconButton(
                                onClick = { /* Cancel current request */ },
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEF4444))
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Stop,
                                    contentDescription = "Stop",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            OfflineBanner(
                isOnline = uiState.isOnline,
                hasCachedData = false,
                customMessage = "You're offline • AI requests require an active connection"
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                if (uiState.messages.isEmpty() && !uiState.isLoading && !uiState.isComparingPrices) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue.copy(alpha = 0.08f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.AutoAwesome,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "How can Contril help today?",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Ask questions, inspect connected tools, or manage your schedule.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondaryLight,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        val quickPrompts = listOf(
                            "What's on my schedule today?",
                            "Summarize my unread emails",
                            "Draft a quick follow-up",
                            "Review today's active priorities"
                        )

                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            quickPrompts.forEach { prompt ->
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = MaterialTheme.colorScheme.surface,
                                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { viewModel.sendMessage(promptOverride = prompt, context = context) }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 11.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(Icons.Outlined.AutoAwesome, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(15.dp))
                                        Text(prompt, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium), color = MaterialTheme.colorScheme.onSurface)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        contentPadding = PaddingValues(top = 12.dp, bottom = 20.dp)
                    ) {
                        items(uiState.messages) { message ->
                            if (message.isUser) {
                                // User Message Bubble
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .widthIn(max = 300.dp)
                                            .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 4.dp, bottomStart = 16.dp, bottomEnd = 16.dp))
                                            .background(ContrilMidnight)
                                            .padding(horizontal = 16.dp, vertical = 12.dp)
                                    ) {
                                        Text(
                                            text = message.text,
                                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.sp),
                                            color = Color.White
                                        )
                                    }
                                }
                            } else {
                                // Contril AI Response
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(topStart = 4.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(16.dp),
                                            verticalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            FormattedMarkdownText(
                                                markdown = message.text,
                                                primaryColor = MaterialTheme.colorScheme.onSurface,
                                                mutedColor = TextSecondaryLight,
                                                accentColor = ContrilBlue
                                            )

                                            // Agentic Plan Card
                                            if (message.proposedPlan != null) {
                                                AgenticPlanCard(
                                                    plan = message.proposedPlan,
                                                    onToggleItem = { itemId ->
                                                        viewModel.togglePlanItemSelection(message.id, itemId)
                                                    },
                                                    onApprove = {
                                                        viewModel.approveAndExecutePlan(message.id, context)
                                                    },
                                                    onCancel = {
                                                        viewModel.cancelPlan(message.id)
                                                    },
                                                    onUndo = {
                                                        viewModel.undoPlanAction(message.id)
                                                    }
                                                )
                                            }

                                            // Connection Action Card
                                            if (message.requiresConnectionService != null) {
                                                Surface(
                                                    shape = RoundedCornerShape(12.dp),
                                                    color = MaterialTheme.colorScheme.surface,
                                                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                                                ) {
                                                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                                        Text("Connect ${message.requiresConnectionService}", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                                                        Text("Connect your Google account to let Contril securely access your ${message.requiresConnectionService}.", style = MaterialTheme.typography.bodySmall, color = TextSecondaryLight)
                                                        Button(
                                                            onClick = {
                                                                try {
                                                                    val oauthUrl = com.contril.app.data.api.SupabaseAuthClient.getGoogleWorkspaceOAuthUrl()
                                                                    val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl))
                                                                    browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                                                    context.startActivity(browserIntent)
                                                                } catch (_: Exception) {}
                                                            },
                                                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                                            shape = RoundedCornerShape(8.dp),
                                                            modifier = Modifier.fillMaxWidth()
                                                        ) {
                                                            Icon(Icons.Outlined.Link, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                                                            Spacer(modifier = Modifier.width(6.dp))
                                                            Text("Connect ${message.requiresConnectionService}", fontWeight = FontWeight.Bold, color = Color.White)
                                                        }
                                                    }
                                                }
                                            }

                                            // Consequential Action Card
                                            if (message.pendingAction != null) {
                                                val action = message.pendingAction
                                                ActionApprovalCard(
                                                    action = action,
                                                    onApprove = { viewModel.approveAction(action) },
                                                    onReject = { viewModel.rejectAction(action) }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Thinking State
                        if (uiState.isLoading || uiState.isComparingPrices) {
                            item {
                                if (uiState.isComparingPrices) {
                                    PriceComparisonSkeleton()
                                } else {
                                    ChatMessageSkeleton(isUser = false)
                                }
                            }
                        }
                    }
                }
            }

            // Accessibility Consent Modal
            if (uiState.showConsentModal) {
                ComparisonConsentModal(
                    onGrantPermission = { viewModel.onConsentGranted(context) },
                    onDismiss = { viewModel.dismissConsentModal() }
                )
            }
        }
    }
}

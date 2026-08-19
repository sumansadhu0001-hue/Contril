package com.contril.app.ui.chat

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        ContrilLogoMark(modifier = Modifier.size(24.dp), color = ContrilBlue)
                        Column {
                            Text(
                                text = "CONTRIL AI",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "Universal Reasoning & Actions",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextSecondaryLight
                            )
                        }
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
                actions = {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = ContrilBlue.copy(alpha = 0.10f),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text(
                            text = "${uiState.aiUsage.first}/${uiState.aiUsage.second} today",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = ContrilBlue,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        bottomBar = {
            Surface(
                color = ContrilLightSurface,
                shadowElevation = 12.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .imePadding()
                        .navigationBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    CommandInputField(
                        value = uiState.inputText,
                        onValueChange = { viewModel.onInputTextChanged(it) },
                        onExecute = { viewModel.sendMessage(context = context) },
                        isLoading = uiState.isLoading || uiState.isComparingPrices,
                        isListening = speechRecognizer.isListening,
                        placeholder = if (uiState.isOnline) "Ask anything or command an action..." else "Waiting for internet connection...",
                        onVoiceClick = {
                            if (speechRecognizer.isListening) {
                                speechRecognizer.stopListening()
                            } else {
                                audioPermissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                            }
                        }
                    )
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
                customMessage = "No Internet Connection • AI chat paused"
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
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(ContrilBlue.copy(alpha = 0.10f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.AutoAwesome,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "How can Contril assist you?",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryLight
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Ask complex questions, compare prices across platforms, or manage emails and agenda.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondaryLight,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
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
                                            .clip(RoundedCornerShape(topStart = 18.dp, topEnd = 4.dp, bottomStart = 18.dp, bottomEnd = 18.dp))
                                            .background(ContrilAccentGradient)
                                            .padding(horizontal = 16.dp, vertical = 12.dp)
                                    ) {
                                        Text(
                                            text = message.text,
                                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                                            color = Color.White
                                        )
                                    }
                                }
                            } else {
                                // Contril AI Response Bubble
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(topStart = 4.dp, topEnd = 18.dp, bottomStart = 18.dp, bottomEnd = 18.dp),
                                        color = ContrilLightSurface,
                                        shadowElevation = 2.dp,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(16.dp),
                                            verticalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            FormattedMarkdownText(
                                                markdown = message.text,
                                                primaryColor = TextPrimaryLight,
                                                mutedColor = TextSecondaryLight,
                                                accentColor = ContrilBlue
                                            )

                                             // Ray-Style Agentic Plan Card
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

                                            // Comparison Card
                                            if (message.comparisonResult != null) {
                                                ComparisonResultsView(
                                                    result = message.comparisonResult,
                                                    onDismiss = {}
                                                )
                                            }

                                            // Action Card
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

                        // Active Loading / Comparing Indicator
                        if (uiState.isLoading || uiState.isComparingPrices) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = ContrilLightSurface,
                                    shadowElevation = 3.dp,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(20.dp),
                                            strokeWidth = 2.dp,
                                            color = ContrilBlue
                                        )
                                        Text(
                                            text = uiState.comparisonStatus ?: "Contril is reasoning...",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = TextSecondaryLight
                                        )
                                    }
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

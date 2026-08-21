package com.contril.app.ui.inbox

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.ui.viewinterop.AndroidView
import com.contril.app.theme.*
import com.contril.app.ui.components.*
import com.contril.app.data.model.EmailSummary

@Composable
fun InboxScreen(
    viewModel: InboxViewModel,
    onNavigateToConnected: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp)
    ) {
        // 1. Header
        item {
            Column(
                modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "COMMUNICATION HUB",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    color = ContrilBlue
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Gmail Inbox",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = (-0.5).sp
                        ),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    IconButton(
                        onClick = { viewModel.refreshInbox() },
                        enabled = !uiState.isRefreshing
                    ) {
                        if (uiState.isRefreshing) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = ContrilBlue)
                        } else {
                            Icon(Icons.Filled.Sync, contentDescription = "Sync Inbox", tint = ContrilBlue)
                        }
                    }
                }
                Text(
                    text = if (uiState.isGmailConnected) {
                        "Connected to ${uiState.connectedEmail ?: "Google Workspace"}. Real Gmail sync with AI drafting and safe deletion."
                    } else {
                        "Link your Google Workspace or Gmail to review priority emails and draft smart replies."
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 1.5. App-Wide Real-Time Offline Banner
        item {
            OfflineBanner(
                isOnline = uiState.isOnline,
                hasCachedData = (uiState.contentState is InboxContentState.SuccessWithData && (uiState.contentState as InboxContentState.SuccessWithData).isCached),
                lastSyncedTime = uiState.lastSyncedTime
            )
        }

        // 2. Status Banner & Reconsent Callout
        if (uiState.statusMessage != null) {
            val isError = uiState.statusMessage?.startsWith("⚠️") == true || uiState.needsSendReconsent
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isError) StatusWarning.copy(alpha = 0.12f) else StatusActive.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, if (isError) StatusWarning.copy(alpha = 0.4f) else StatusActive.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = uiState.statusMessage ?: "",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                color = if (isError) StatusWarning else StatusActive,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = { viewModel.dismissStatusMessage() },
                                modifier = Modifier.size(20.dp)
                            ) {
                                Icon(Icons.Filled.Close, contentDescription = "Dismiss", tint = if (isError) StatusWarning else StatusActive)
                            }
                        }

                        if (uiState.needsSendReconsent) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(
                                onClick = { onNavigateToConnected() },
                                modifier = Modifier.fillMaxWidth().magneticPress(),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                            ) {
                                Icon(Icons.Filled.VpnKey, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Reconnect Gmail with Send Permission", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            }
                        }
                    }
                }
            }
        }

        // 3. Category Filter Tabs (Primary vs Promotions) & Safe Clean Action
        if (uiState.isGmailConnected) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = uiState.selectedTab == "PRIMARY",
                            onClick = { viewModel.selectTab("PRIMARY") },
                            label = { Text("Primary", fontWeight = FontWeight.SemiBold) },
                            leadingIcon = {
                                Icon(Icons.Outlined.Inbox, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ContrilBlue,
                                selectedLabelColor = Color.White,
                                selectedLeadingIconColor = Color.White
                            )
                        )
                        FilterChip(
                            selected = uiState.selectedTab == "PROMOTIONS",
                            onClick = { viewModel.selectTab("PROMOTIONS") },
                            label = { Text("Promotions", fontWeight = FontWeight.SemiBold) },
                            leadingIcon = {
                                Icon(Icons.Outlined.LocalOffer, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ContrilBlue,
                                selectedLabelColor = Color.White,
                                selectedLeadingIconColor = Color.White
                            )
                        )
                    }

                    OutlinedButton(
                        onClick = { viewModel.previewSafeDeletion("delete promotional emails") },
                        modifier = Modifier.magneticPress(),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusWarning)
                    ) {
                        Icon(Icons.Outlined.DeleteSweep, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clean", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
        }

        // 4. Pending Action Approval
        if (uiState.activePendingAction != null) {
            item {
                ActionApprovalCard(
                    action = uiState.activePendingAction!!,
                    onApprove = { viewModel.approveAction() },
                    onReject = { viewModel.dismissAction() }
                )
            }
        }

        // 5. Main Content States
        when (val state = uiState.contentState) {
            is InboxContentState.Disconnected -> {
                item {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(28.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(ContrilBlue.copy(alpha = 0.08f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Mail,
                                    contentDescription = null,
                                    tint = ContrilBlue,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Text(
                                text = "Connect Gmail to view your inbox",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "Grant read, draft, and send permissions via Google OAuth to allow Contril to manage priority messages.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Button(
                                onClick = onNavigateToConnected,
                                modifier = Modifier.magneticPress(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 10.dp)
                            ) {
                                Icon(Icons.Filled.Link, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Connect Gmail", fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }

            is InboxContentState.OfflineNoData -> {
                item {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(28.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFFEF3C7)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Filled.WifiOff, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(24.dp))
                            }
                            Text(
                                text = "No Internet Connection",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "Cannot synchronize Gmail inbox offline. Please connect to Wi-Fi or mobile data to load your messages.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }

            is InboxContentState.Loading -> {
                items(4) {
                    com.contril.app.ui.components.EmailCardSkeleton()
                }
            }

            is InboxContentState.Error -> {
                item {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = StatusWarning.copy(alpha = 0.12f),
                        border = BorderStroke(1.dp, StatusWarning.copy(alpha = 0.35f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Filled.Warning, contentDescription = null, tint = StatusWarning, modifier = Modifier.size(20.dp))
                                Text(
                                    text = "Gmail Notice",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = StatusWarning
                                )
                            }
                            Text(
                                text = state.message,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 18.sp
                            )
                            Button(
                                onClick = onNavigateToConnected,
                                modifier = Modifier.magneticPress(),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Text("Reconnect Gmail", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = Color.White)
                            }
                        }
                    }
                }
            }

            is InboxContentState.SuccessEmpty -> {
                item {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(24.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Filled.Check, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(24.dp))
                            Text(
                                text = "Category is clear",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "No messages found in ${uiState.selectedTab.lowercase().replaceFirstChar { it.uppercase() }}.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            is InboxContentState.SuccessWithData -> {
                if (state.isCached) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFF3F4F6),
                            modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.CloudOff, contentDescription = null, tint = Color(0xFF6B7280), modifier = Modifier.size(14.dp))
                                Text(
                                    text = "Viewing cached messages • Read-only while offline",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = Color(0xFF4B5563)
                                )
                            }
                        }
                    }
                }

                val filteredEmails = if (uiState.selectedTab == "PROMOTIONS") {
                    state.emails.filter { it.category == "PROMOTIONS" || it.category == "UPDATES" }
                } else {
                    state.emails.filter { it.category == "PRIMARY" }
                }

                if (filteredEmails.isEmpty()) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = MaterialTheme.colorScheme.surface,
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(20.dp).fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "No messages in ${uiState.selectedTab.lowercase().replaceFirstChar { it.uppercase() }}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                } else {
                    items(filteredEmails) { email ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = MaterialTheme.colorScheme.surface,
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { viewModel.openFullEmail(email) }
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = email.sender,
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface,
                                        modifier = Modifier.weight(1f)
                                    )
                                    if (email.isUrgent) {
                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = StatusWarning.copy(alpha = 0.15f)
                                        ) {
                                            Text(
                                                text = "PRIORITY",
                                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                color = StatusWarning,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }

                                Text(
                                    text = email.subject,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )

                                Text(
                                    text = email.summarySnippet,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 3
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (email.category == "PROMOTIONS") StatusWarning.copy(alpha = 0.08f) else ContrilBlue.copy(alpha = 0.08f)
                                    ) {
                                        Text(
                                            text = email.category,
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                            color = if (email.category == "PROMOTIONS") StatusWarning else ContrilBlue,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }

                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        OutlinedButton(
                                            onClick = { viewModel.startAiDraftReply(email) },
                                            modifier = Modifier.magneticPress(),
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ContrilBlue)
                                        ) {
                                            Icon(Icons.Filled.AutoAwesome, contentDescription = null, modifier = Modifier.size(12.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Draft Reply", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
                                        }

                                        Button(
                                            onClick = { viewModel.openFullEmail(email) },
                                            modifier = Modifier.magneticPress(),
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                                        ) {
                                            Text("Read", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (uiState.nextPageToken != null) {
                        item {
                            Button(
                                onClick = { viewModel.loadNextPage() },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                                    .magneticPress(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue.copy(alpha = 0.12f),
                                    contentColor = ContrilBlue
                                ),
                                enabled = !uiState.isLoadingMore
                            ) {
                                if (uiState.isLoadingMore) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        color = ContrilBlue,
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Loading Older Emails...", style = MaterialTheme.typography.labelMedium)
                                } else {
                                    Icon(Icons.Filled.ExpandMore, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Load More Emails", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // --- FULL EMAIL DETAIL MODAL (WITH SECURE HTML WEBVIEW RENDERING) ---
    val fullEmail = uiState.selectedEmailDetail
    if (fullEmail != null) {
        var isViewingHtml by remember(fullEmail.id) { mutableStateOf(!fullEmail.bodyHtml.isNullOrBlank()) }

        Dialog(
            onDismissRequest = { viewModel.closeFullEmail() },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier
                    .fillMaxWidth(0.94f)
                    .fillMaxHeight(0.88f)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .fillMaxSize()
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Email Details",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        IconButton(onClick = { viewModel.closeFullEmail() }) {
                            Icon(Icons.Filled.Close, contentDescription = "Close")
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    // Email Header info
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = fullEmail.subject,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "From: ${fullEmail.sender}",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                            color = ContrilBlue
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Date: ${fullEmail.date}",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            // HTML / Plain Text Toggle if HTML content exists
                            if (!fullEmail.bodyHtml.isNullOrBlank()) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    FilterChip(
                                        selected = isViewingHtml,
                                        onClick = { isViewingHtml = true },
                                        label = { Text("HTML", style = MaterialTheme.typography.labelSmall) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = ContrilBlue,
                                            selectedLabelColor = Color.White
                                        ),
                                        modifier = Modifier.height(28.dp)
                                    )
                                    FilterChip(
                                        selected = !isViewingHtml,
                                        onClick = { isViewingHtml = false },
                                        label = { Text("Text", style = MaterialTheme.typography.labelSmall) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = ContrilBlue,
                                            selectedLabelColor = Color.White
                                        ),
                                        modifier = Modifier.height(28.dp)
                                    )
                                }
                            }
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    // Body Content (HTML WebView or Plain Text)
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f))
                    ) {
                        if (isViewingHtml && !fullEmail.bodyHtml.isNullOrBlank()) {
                            AndroidView(
                                factory = { ctx ->
                                    WebView(ctx).apply {
                                        setBackgroundColor(0) // transparent
                                        settings.apply {
                                            javaScriptEnabled = false
                                            allowFileAccess = false
                                            allowContentAccess = false
                                            loadWithOverviewMode = true
                                            useWideViewPort = true
                                        }
                                        webViewClient = WebViewClient()
                                        loadDataWithBaseURL(null, fullEmail.bodyHtml, "text/html", "UTF-8", null)
                                    }
                                },
                                update = { webView ->
                                    webView.loadDataWithBaseURL(null, fullEmail.bodyHtml, "text/html", "UTF-8", null)
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .verticalScroll(rememberScrollState())
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = fullEmail.bodyPlain,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    lineHeight = 22.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                val dummyEmail = EmailSummary(
                                    id = fullEmail.id,
                                    threadId = fullEmail.threadId,
                                    sender = fullEmail.sender,
                                    subject = fullEmail.subject,
                                    summarySnippet = fullEmail.bodyPlain.take(200)
                                )
                                viewModel.closeFullEmail()
                                viewModel.startAiDraftReply(dummyEmail)
                            },
                            modifier = Modifier.weight(1f).magneticPress(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ContrilBlue)
                        ) {
                            Icon(Icons.Filled.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Draft Reply")
                        }

                        Button(
                            onClick = { viewModel.closeFullEmail() },
                            modifier = Modifier.weight(1f).magneticPress(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                        ) {
                            Text("Done")
                        }
                    }
                }
            }
        }
    }

    // --- AI DRAFT-REPLY MODAL (HUMAN SENDS ONLY) ---
    val draftState = uiState.aiDraftState
    if (draftState != null) {
        Dialog(onDismissRequest = { viewModel.closeAiDraftModal() }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Filled.AutoAwesome, contentDescription = null, tint = ContrilBlue)
                        Text(
                            text = "AI Draft Reply",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Text(
                        text = "To: ${draftState.to}\nSubject: Re: ${draftState.originalSubject}",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (draftState.isGenerating) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = ContrilBlue, strokeWidth = 2.dp)
                            Text("Contril AI is drafting an executive reply...", style = MaterialTheme.typography.bodySmall)
                        }
                    } else {
                        OutlinedTextField(
                            value = draftState.draftBody,
                            onValueChange = { viewModel.updateAiDraftBody(it) },
                            label = { Text("Draft Message (Editable)") },
                            modifier = Modifier.fillMaxWidth().height(160.dp),
                            maxLines = 8
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = StatusActive.copy(alpha = 0.08f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "🔒 Safety Rule: Contril never sends emails automatically. You must review and tap Send.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(8.dp)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.closeAiDraftModal() },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Discard")
                        }

                        Button(
                            onClick = { viewModel.sendAiDraftReply() },
                            enabled = !draftState.isGenerating && !draftState.isSending && draftState.draftBody.isNotBlank(),
                            modifier = Modifier.weight(1f).magneticPress(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                        ) {
                            if (draftState.isSending) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Text("Send Reply", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }

    // --- SAFE TWO-STEP EMAIL DELETION MODAL (TRASH ONLY) ---
    val deletionPlan = uiState.deletionPlan
    if (deletionPlan != null) {
        Dialog(onDismissRequest = { viewModel.cancelDeletionPlan() }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, StatusWarning.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Filled.DeleteForever, contentDescription = null, tint = StatusWarning)
                        Text(
                            text = "Safe Move to Trash",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = StatusWarning.copy(alpha = 0.1f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Parsed Range: ${deletionPlan.dateRangeExplanation}",
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                color = StatusWarning
                            )
                            Text(
                                text = "Resolved Gmail Query: ${deletionPlan.resolvedGmailFilter}",
                                style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "Found ${deletionPlan.affectedCount} matching messages.",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "⚠️ Messages are moved to Gmail Trash and can be recovered for 30 days. Daily Free tier cap: 70 emails.",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Text(
                        text = "Type \"delete all\" below to confirm moving these ${minOf(deletionPlan.affectedCount, 70)} emails to Trash:",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    OutlinedTextField(
                        value = uiState.deletionConfirmationInput,
                        onValueChange = { viewModel.updateDeletionConfirmationInput(it) },
                        placeholder = { Text("Type delete all to confirm") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.cancelDeletionPlan() },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Cancel")
                        }

                        Button(
                            onClick = { viewModel.executeSafeDeletion() },
                            enabled = uiState.deletionConfirmationInput.trim().lowercase() == "delete all" && !uiState.isDeletingToTrash,
                            modifier = Modifier.weight(1f).magneticPress(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = StatusWarning)
                        ) {
                            if (uiState.isDeletingToTrash) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Text("Move to Trash", fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }
}

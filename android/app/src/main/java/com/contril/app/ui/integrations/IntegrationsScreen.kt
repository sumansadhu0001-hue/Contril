package com.contril.app.ui.integrations

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.api.SupabaseAuthClient
import com.contril.app.data.model.IntegrationCategory
import com.contril.app.data.model.IntegrationStatus
import com.contril.app.theme.*
import com.contril.app.ui.components.ContrilSectionHeader
import com.contril.app.ui.components.ContrilStatusBadge
import com.contril.app.ui.components.ContrilSurfaceCard
import com.contril.app.ui.components.GoogleLogo
import com.contril.app.ui.components.GooglePreConsentSheet

@Composable
fun IntegrationsScreen(viewModel: IntegrationsViewModel) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var selectedCategoryTab by remember { mutableStateOf("All") }
    var showGooglePreConsent by remember { mutableStateOf(false) }
    var serviceToDisconnect by remember { mutableStateOf<IntegrationStatus?>(null) }
    var manageServiceItem by remember { mutableStateOf<IntegrationStatus?>(null) }

    val categoryTabs = listOf("All", "Work", "Productivity", "Travel & Stay", "Food & Transport")

    val filteredIntegrations = remember(uiState.integrations, selectedCategoryTab) {
        when (selectedCategoryTab) {
            "Work" -> uiState.integrations.filter { it.category == IntegrationCategory.WORK }
            "Productivity" -> uiState.integrations.filter { it.category == IntegrationCategory.PRODUCTIVITY }
            "Travel & Stay" -> uiState.integrations.filter { it.category == IntegrationCategory.TRAVEL || it.category == IntegrationCategory.HOTELS }
            "Food & Transport" -> uiState.integrations.filter { it.category == IntegrationCategory.TRANSPORT || it.category == IntegrationCategory.FOOD }
            else -> uiState.integrations
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 4.dp, bottom = 32.dp)
    ) {
        // 1. Screen Header
        item {
            Column(
                modifier = Modifier.padding(top = 4.dp, bottom = 4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "UNIVERSAL INTEGRATION HUB",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "Connected Services",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Single authoritative management for your connected email, calendar, files, and executive tools. Real-time data is encrypted on-device.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 2. Global Error Banner
        if (uiState.errorMessage != null) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.errorContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.ErrorOutline,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = uiState.errorMessage ?: "",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                        TextButton(onClick = { viewModel.setErrorMessage(null) }) {
                            Text("Dismiss", color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }

        // 3. Category Filter Chips Row
        item {
            ScrollableTabRow(
                selectedTabIndex = categoryTabs.indexOf(selectedCategoryTab).coerceAtLeast(0),
                edgePadding = 0.dp,
                divider = {},
                containerColor = Color.Transparent,
                indicator = {}
            ) {
                categoryTabs.forEach { tabName ->
                    val isSelected = selectedCategoryTab == tabName
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) ContrilBlue else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        border = BorderStroke(1.dp, if (isSelected) ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .clickable { selectedCategoryTab = tabName }
                    ) {
                        Text(
                            text = tabName,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium),
                            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // 4. Section Count
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${selectedCategoryTab.uppercase()} SERVICES (${filteredIntegrations.size})",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${uiState.connectedCount} Active",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = if (uiState.connectedCount > 0) StatusActive else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 5. Service Cards List
        items(filteredIntegrations, key = { it.id }) { integration ->
            ServiceConnectionCard(
                integration = integration,
                onConnect = {
                    if (integration.id == "gmail" || integration.id == "calendar" || integration.id == "drive") {
                        showGooglePreConsent = true
                    } else {
                        try {
                            val oauthUrl = SupabaseAuthClient.getOAuthUrlForService(integration.id)
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl))
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            viewModel.setErrorMessage("Unable to launch authorization: ${e.message}")
                        }
                    }
                },
                onDisconnect = {
                    serviceToDisconnect = integration
                },
                onManage = {
                    manageServiceItem = integration
                }
            )
        }
    }

    // Google Pre-Consent Explainer Bottom Sheet
    if (showGooglePreConsent) {
        GooglePreConsentSheet(
            onConfirm = {
                showGooglePreConsent = false
                viewModel.launchGoogleOAuth(context)
            },
            onDismiss = {
                showGooglePreConsent = false
            }
        )
    }

    // Per-Service Disconnect Confirmation Dialog
    if (serviceToDisconnect != null) {
        val target = serviceToDisconnect!!
        AlertDialog(
            onDismissRequest = { serviceToDisconnect = null },
            title = {
                Text("Disconnect ${target.name}?", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    "Contril will stop syncing with ${target.name}. Other connected services will remain unaffected. You can reconnect anytime.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.disconnectService(target.id)
                        serviceToDisconnect = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                ) {
                    Text("Disconnect", fontWeight = FontWeight.Bold, color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { serviceToDisconnect = null }) {
                    Text("Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        )
    }

    // Manage Service Details Dialog
    if (manageServiceItem != null) {
        ManageServiceDialog(
            integration = manageServiceItem!!,
            onDismiss = { manageServiceItem = null },
            onDisconnect = {
                viewModel.disconnectService(manageServiceItem!!.id)
                manageServiceItem = null
            }
        )
    }
}

@Composable
fun ServiceConnectionCard(
    integration: IntegrationStatus,
    onConnect: () -> Unit,
    onDisconnect: () -> Unit,
    onManage: () -> Unit
) {
    val serviceIcon: ImageVector = when (integration.id) {
        "gmail" -> Icons.Outlined.Email
        "calendar" -> Icons.Outlined.CalendarMonth
        "drive" -> Icons.Outlined.Folder
        "github" -> Icons.Outlined.Code
        "makemytrip" -> Icons.Outlined.Flight
        "swiggy" -> Icons.Outlined.Restaurant
        else -> Icons.Outlined.Public
    }

    val isNeedsReconnect = integration.lastSyncTime.contains("Reconnect", ignoreCase = true)

    ContrilSurfaceCard(
        elevation = if (integration.isConnected) 3.dp else 1.dp,
        border = BorderStroke(
            1.dp,
            if (isNeedsReconnect) StatusWarning.copy(alpha = 0.5f)
            else if (integration.isConnected) ContrilBlue.copy(alpha = 0.25f)
            else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
        )
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Header Row: Icon + Title + Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(
                                if (isNeedsReconnect) StatusWarning.copy(alpha = 0.12f)
                                else if (integration.isConnected) ContrilBlue.copy(alpha = 0.12f)
                                else MaterialTheme.colorScheme.surfaceVariant
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (integration.id == "gmail" || integration.id == "calendar" || integration.id == "drive") {
                            GoogleLogo(modifier = Modifier.size(22.dp))
                        } else {
                            Icon(
                                imageVector = serviceIcon,
                                contentDescription = integration.name,
                                tint = if (integration.isConnected) ContrilBlue else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = integration.name,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryLight
                        )
                        if (integration.isConnected && !integration.connectedAccount.isNullOrBlank()) {
                            Text(
                                text = integration.connectedAccount,
                                style = MaterialTheme.typography.labelSmall,
                                color = ContrilBlue
                            )
                        }
                    }
                }

                // Status Badge Pill
                if (isNeedsReconnect) {
                    ContrilStatusBadge(statusText = "Needs Reconnect", isWarning = true)
                } else if (integration.isConnected) {
                    ContrilStatusBadge(
                        statusText = if (integration.isAlwaysAvailable) "Always Active" else "Connected",
                        isSuccess = true
                    )
                } else {
                    ContrilStatusBadge(statusText = "Not Connected")
                }
            }

            // Description
            Text(
                text = integration.description,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondaryLight,
                lineHeight = 18.sp
            )

            // Real Live Inline Value Delivered
            if (integration.isConnected && !integration.lastSyncTime.isNullOrBlank()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isNeedsReconnect) StatusWarning.copy(alpha = 0.08f) else ContrilBlue.copy(alpha = 0.06f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = if (isNeedsReconnect) Icons.Filled.Warning else Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = if (isNeedsReconnect) StatusWarning else StatusActive,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = integration.lastSyncTime,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                            color = if (isNeedsReconnect) StatusWarning else TextPrimaryLight
                        )
                    }
                }
            }

            // Action Buttons Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isNeedsReconnect) {
                    Button(
                        onClick = onConnect,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = StatusWarning),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Reconnect", fontWeight = FontWeight.Bold)
                    }
                } else if (integration.isAlwaysAvailable) {
                    OutlinedButton(
                        onClick = onManage,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("View Capabilities", color = ContrilBlue, fontWeight = FontWeight.SemiBold)
                    }
                } else if (integration.isConnected) {
                    OutlinedButton(
                        onClick = onDisconnect,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusError)
                    ) {
                        Text("Disconnect", fontWeight = FontWeight.Medium)
                    }

                    OutlinedButton(
                        onClick = onManage,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Permissions", color = ContrilBlue, fontWeight = FontWeight.SemiBold)
                    }
                } else {
                    Button(
                        onClick = onConnect,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                    ) {
                        Icon(Icons.Filled.Link, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Connect ${integration.name}", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun ManageServiceDialog(
    integration: IntegrationStatus,
    onDismiss: () -> Unit,
    onDisconnect: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "${integration.name} Permissions",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimaryLight
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Granted Scopes & Intelligence Access:",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = TextSecondaryLight
                )
                integration.scopes.forEach { scope ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Check,
                            contentDescription = null,
                            tint = StatusActive,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = scope,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextPrimaryLight
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = ContrilBlue, fontWeight = FontWeight.SemiBold)
            }
        }
    )
}

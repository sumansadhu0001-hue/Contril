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
import androidx.compose.ui.window.Dialog
import com.contril.app.data.api.SupabaseAuthClient
import com.contril.app.data.model.IntegrationCategory
import com.contril.app.data.model.IntegrationStatus
import com.contril.app.data.model.IntegrationType
import com.contril.app.data.model.ServiceConnectionState
import com.contril.app.theme.*

@Composable
fun IntegrationsScreen(viewModel: IntegrationsViewModel) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var selectedCategoryTab by remember { mutableStateOf("All") }
    var manageServiceItem by remember { mutableStateOf<IntegrationStatus?>(null) }

    val categoryTabs = listOf("All", "Work", "Productivity", "Travel & Stay", "Transport & Food", "Shopping")

    val filteredIntegrations = remember(uiState.integrations, selectedCategoryTab) {
        when (selectedCategoryTab) {
            "Work" -> uiState.integrations.filter { it.category == IntegrationCategory.WORK }
            "Productivity" -> uiState.integrations.filter { it.category == IntegrationCategory.PRODUCTIVITY }
            "Travel & Stay" -> uiState.integrations.filter { it.category == IntegrationCategory.TRAVEL || it.category == IntegrationCategory.HOTELS }
            "Transport & Food" -> uiState.integrations.filter { it.category == IntegrationCategory.TRANSPORT || it.category == IntegrationCategory.FOOD }
            "Shopping" -> uiState.integrations.filter { it.category == IntegrationCategory.SHOPPING }
            else -> uiState.integrations
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp)
    ) {
        // 1. Screen Header
        item {
            Column(
                modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
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
                    text = "Manage the work, productivity, travel, transport, and commerce tools Contril interacts with.",
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
                    text = "${selectedCategoryTab.uppercase()} INTEGRATIONS (${filteredIntegrations.size})",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${uiState.connectedCount} Connected",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = if (uiState.connectedCount > 0) StatusActive else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 5. Service Cards List
        items(filteredIntegrations) { integration ->
            ServiceCard(
                integration = integration,
                onConnect = {
                    try {
                        val oauthUrl = SupabaseAuthClient.getOAuthUrlForService(integration.id)
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl))
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        viewModel.setErrorMessage("Unable to open browser: ${e.message}")
                    }
                },
                onManage = {
                    manageServiceItem = integration
                }
            )
        }
    }

    // Manage Service Dialog
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
fun ServiceCard(
    integration: IntegrationStatus,
    onConnect: () -> Unit,
    onManage: () -> Unit
) {
    val serviceIcon: ImageVector = when (integration.id) {
        "gmail" -> Icons.Outlined.Email
        "calendar" -> Icons.Outlined.CalendarMonth
        "drive" -> Icons.Outlined.Folder
        "outlook" -> Icons.Outlined.Business
        "github" -> Icons.Outlined.Code
        "notion" -> Icons.Outlined.Description
        "makemytrip" -> Icons.Outlined.Flight
        "airbnb" -> Icons.Outlined.Hotel
        "uber", "ola" -> Icons.Outlined.DirectionsCar
        "swiggy", "zomato" -> Icons.Outlined.Restaurant
        "amazon", "flipkart" -> Icons.Outlined.ShoppingCart
        else -> Icons.Outlined.Public
    }

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(
            1.dp,
            if (integration.isConnected) ContrilBlue.copy(alpha = 0.25f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header Row: Icon + Title + Status Pill
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
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(
                                if (integration.isConnected) ContrilBlue.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = serviceIcon,
                            contentDescription = integration.name,
                            tint = if (integration.isConnected) ContrilBlue else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
                        Text(
                            text = integration.name,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
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

                // Integration Type Badge
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (integration.integrationType == IntegrationType.API_INTEGRATION) ContrilBlue.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                ) {
                    Text(
                        text = if (integration.integrationType == IntegrationType.API_INTEGRATION) "API OAuth" else "Device/Web",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                        color = if (integration.integrationType == IntegrationType.API_INTEGRATION) ContrilBlue else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                    )
                }
            }

            // Description
            Text(
                text = integration.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 18.sp
            )

            // Capabilities Preview
            if (integration.capabilities.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    integration.capabilities.take(3).forEach { cap ->
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                        ) {
                            Text(
                                text = cap,
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontFamily = FontFamily.Monospace),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            // Action Button Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Connection State Pill
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = when {
                        integration.isConnected -> StatusActive.copy(alpha = 0.12f)
                        integration.connectionState == ServiceConnectionState.REQUIRES_PERMISSION -> StatusWarning.copy(alpha = 0.12f)
                        else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        if (integration.isConnected) {
                            Box(modifier = Modifier.size(5.dp).clip(CircleShape).background(StatusActive))
                        }
                        Text(
                            text = when {
                                integration.isConnected -> "Connected"
                                integration.connectionState == ServiceConnectionState.REQUIRES_PERMISSION -> "Requires Permission"
                                else -> "Available"
                            },
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = when {
                                integration.isConnected -> StatusActive
                                integration.connectionState == ServiceConnectionState.REQUIRES_PERMISSION -> StatusWarning
                                else -> MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }
                }

                if (integration.isConnected) {
                    OutlinedButton(
                        onClick = onManage,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.8f)),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Text(
                            text = "Manage",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                } else {
                    Button(
                        onClick = onConnect,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ContrilBlue,
                            contentColor = Color.White
                        ),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Text(
                            text = if (integration.integrationType == IntegrationType.API_INTEGRATION) "Connect" else "Link Action",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold)
                        )
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
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(22.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Manage ${integration.name}",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )

                if (!integration.connectedAccount.isNullOrBlank()) {
                    Text(
                        text = "Linked Account: ${integration.connectedAccount}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Text(
                    text = "Status: Connected and syncing live intelligence with Contril AI.",
                    style = MaterialTheme.typography.bodySmall,
                    color = StatusActive
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Close")
                    }

                    Button(
                        onClick = onDisconnect,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Disconnect", color = Color.White)
                    }
                }
            }
        }
    }
}

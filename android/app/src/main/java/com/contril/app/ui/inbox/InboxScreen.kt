package com.contril.app.ui.inbox

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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.contril.app.theme.*
import com.contril.app.ui.components.ActionApprovalCard
import com.contril.app.ui.components.AtmosphericCard

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
                Text(
                    text = "Gmail Inbox",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = if (uiState.isGmailConnected) {
                        "Connected to ${uiState.connectedEmail}. Contril analyzes priority messages and drafts replies."
                    } else {
                        "Link your Google Workspace or Gmail to review priority emails and draft smart replies."
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 2. Status / Feedback Banner
        if (uiState.statusMessage != null) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = StatusActive.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, StatusActive.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = uiState.statusMessage ?: "",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                            color = StatusActive
                        )
                        IconButton(
                            onClick = { viewModel.dismissStatus() },
                            modifier = Modifier.size(20.dp)
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = "Dismiss", tint = StatusActive)
                        }
                    }
                }
            }
        }

        // 3. Pending Action Gate (if compose action is waiting approval)
        if (uiState.activePendingAction != null) {
            item {
                ActionApprovalCard(
                    action = uiState.activePendingAction!!,
                    onApprove = { viewModel.approveAction() },
                    onReject = { viewModel.dismissAction() }
                )
            }
        }

        // 4. Main Content Area
        if (!uiState.isGmailConnected) {
            // Unconnected State -> Truthful Empty State with Connect Action
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
                            text = "Grant read and draft permissions via Google OAuth to allow Contril to summarize priority threads.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Button(
                            onClick = onNavigateToConnected,
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
        } else {
            // Connected State
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = StatusActive.copy(alpha = 0.1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(StatusActive))
                            Text(
                                text = "Synced: ${uiState.connectedEmail}",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                color = StatusActive
                            )
                        }
                    }

                    Button(
                        onClick = { viewModel.setComposing(true) },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Filled.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Compose", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
                    }
                }
            }

            if (uiState.emails.isEmpty()) {
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
                            Icon(
                                imageVector = Icons.Filled.Check,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(24.dp)
                            )
                            Text(
                                text = "Your inbox is clear",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "No unread priority emails require your attention.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                items(uiState.emails) { email ->
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = email.sender,
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (email.isUrgent) {
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = StatusWarning.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "URGENT",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = StatusWarning,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = email.subject,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = email.summarySnippet,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }

    // Compose Email Dialog
    if (uiState.isComposing) {
        Dialog(onDismissRequest = { viewModel.setComposing(false) }) {
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
                    Text(
                        text = "New Message",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    OutlinedTextField(
                        value = uiState.composeTo,
                        onValueChange = { viewModel.onComposeToChange(it) },
                        label = { Text("To") },
                        placeholder = { Text("recipient@example.com") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = uiState.composeSubject,
                        onValueChange = { viewModel.onComposeSubjectChange(it) },
                        label = { Text("Subject") },
                        placeholder = { Text("Project deliverables update") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = uiState.composeBody,
                        onValueChange = { viewModel.onComposeBodyChange(it) },
                        label = { Text("Message") },
                        placeholder = { Text("Write your message...") },
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        maxLines = 6
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.setComposing(false) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Discard")
                        }

                        Button(
                            onClick = { viewModel.submitDraftForApproval() },
                            enabled = uiState.composeTo.isNotBlank() && uiState.composeSubject.isNotBlank(),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                        ) {
                            Text("Submit for Approval")
                        }
                    }
                }
            }
        }
    }
}

package com.contril.app.ui.components

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.automation.AutomationAuditLog
import com.contril.app.data.model.ActivityEventType
import com.contril.app.data.model.OvernightActivityLog
import com.contril.app.theme.ContrilBlue
import com.contril.app.theme.StatusActive
import com.contril.app.theme.StatusWarning

enum class UnifiedItemCategory {
    ALL,
    NOTIFICATIONS,
    AI_ACTIONS
}

data class UnifiedFeedEntry(
    val id: String,
    val title: String,
    val description: String,
    val timestamp: String,
    val isNotification: Boolean, // true = Push/System, false = AI Action
    val icon: ImageVector,
    val iconColor: Color,
    val isUnread: Boolean = false,
    val actionType: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UnifiedNotificationCenterSheet(
    overnightLogs: List<OvernightActivityLog> = emptyList(),
    automationLogs: List<AutomationAuditLog> = emptyList(),
    onDismiss: () -> Unit,
    onEntryClick: ((UnifiedFeedEntry) -> Unit)? = null
) {
    var selectedCategory by remember { mutableStateOf(UnifiedItemCategory.ALL) }
    var hasMarkedAllRead by remember { mutableStateOf(false) }

    // Merge Overnight Logs and Automation Logs into a single clean reverse-chronological list
    val allEntries = remember(overnightLogs, automationLogs, hasMarkedAllRead) {
        val list = mutableListOf<UnifiedFeedEntry>()

        // 1. Process overnight & executive activity logs
        for (item in overnightLogs) {
            val isNotif = item.eventType == ActivityEventType.SERVICE_STARTED || item.eventType == ActivityEventType.SERVICE_STOPPED || item.eventType == ActivityEventType.TOKEN_BUDGET_EXHAUSTED
            val icon = when (item.eventType) {
                ActivityEventType.REPLY_AUTO_SENT -> Icons.Outlined.Send
                ActivityEventType.DRAFT_CREATED -> Icons.Outlined.EditNote
                ActivityEventType.MEETING_EXTRACTED -> Icons.Outlined.CalendarToday
                ActivityEventType.DEADLINE_EXTRACTED -> Icons.Outlined.Timer
                ActivityEventType.EMAILS_SCANNED -> Icons.Outlined.MarkEmailRead
                ActivityEventType.NO_NEW_EMAILS -> Icons.Outlined.Inbox
                ActivityEventType.SERVICE_STARTED -> Icons.Outlined.NightsStay
                ActivityEventType.SERVICE_STOPPED -> Icons.Outlined.PowerSettingsNew
                else -> Icons.Outlined.SmartToy
            }
            val color = when (item.eventType) {
                ActivityEventType.REPLY_AUTO_SENT -> ContrilBlue
                ActivityEventType.DRAFT_CREATED -> StatusActive
                ActivityEventType.MEETING_EXTRACTED -> Color(0xFF8B5CF6)
                ActivityEventType.DEADLINE_EXTRACTED -> Color(0xFFF59E0B)
                ActivityEventType.SERVICE_STARTED -> ContrilBlue
                else -> StatusActive
            }

            list.add(
                UnifiedFeedEntry(
                    id = item.id,
                    title = item.title.ifBlank { item.eventType.name },
                    description = item.description,
                    timestamp = java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault()).format(java.util.Date(item.timestamp)),
                    isNotification = isNotif,
                    icon = icon,
                    iconColor = color,
                    isUnread = !hasMarkedAllRead,
                    actionType = item.eventType.name
                )
            )
        }

        // 2. Process automation audit logs
        for (auto in automationLogs) {
            list.add(
                UnifiedFeedEntry(
                    id = auto.id,
                    title = "Price Scan: ${auto.searchQuery}",
                    description = "${auto.platformName} • ${auto.resultSummary}",
                    timestamp = auto.timestamp,
                    isNotification = false,
                    icon = Icons.Outlined.CompareArrows,
                    iconColor = StatusActive,
                    isUnread = false,
                    actionType = "AUTOMATION_SCAN"
                )
            )
        }

        // Return reverse chronological order
        list
    }

    val filteredEntries = remember(allEntries, selectedCategory) {
        when (selectedCategory) {
            UnifiedItemCategory.ALL -> allEntries
            UnifiedItemCategory.NOTIFICATIONS -> allEntries.filter { it.isNotification }
            UnifiedItemCategory.AI_ACTIONS -> allEntries.filter { !it.isNotification }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header: Icon + Title + Mark As Read + Close
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = ContrilBlue.copy(alpha = 0.12f),
                        modifier = Modifier.size(36.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Outlined.Notifications,
                                contentDescription = null,
                                tint = ContrilBlue,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    Column {
                        Text(
                            text = "Unified Activity & Alerts",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "System pushes & autonomous AI actions",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (allEntries.any { it.isUnread }) {
                        TextButton(
                            onClick = { hasMarkedAllRead = true },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Mark all read",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = ContrilBlue
                            )
                        }
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Filled.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            // Filter Tabs (All, Notifications, AI Actions)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    UnifiedItemCategory.ALL to "All (${allEntries.size})",
                    UnifiedItemCategory.NOTIFICATIONS to "Alerts (${allEntries.count { it.isNotification }})",
                    UnifiedItemCategory.AI_ACTIONS to "AI Actions (${allEntries.count { !it.isNotification }})"
                ).forEach { (cat, label) ->
                    val isSelected = selectedCategory == cat
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) ContrilBlue.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        border = if (isSelected) BorderStroke(1.dp, ContrilBlue.copy(alpha = 0.4f)) else null,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCategory = cat }
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                ),
                                color = if (isSelected) ContrilBlue else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // Feed Content
            if (filteredEntries.isEmpty()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp, horizontal = 20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Outlined.Inbox,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            modifier = Modifier.size(32.dp)
                        )
                        Text(
                            text = "No activity yet",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Your executive alerts, push notifications, and autonomous AI actions will appear here.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 18.sp
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 380.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filteredEntries, key = { it.id }) { entry ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = MaterialTheme.colorScheme.background,
                            border = BorderStroke(
                                1.dp,
                                if (entry.isUnread) ContrilBlue.copy(alpha = 0.4f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.25f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onEntryClick?.invoke(entry) }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = entry.iconColor.copy(alpha = 0.12f),
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Icon(
                                            entry.icon,
                                            contentDescription = null,
                                            tint = entry.iconColor,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }

                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(3.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = entry.title,
                                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        if (entry.isUnread) {
                                            Box(
                                                modifier = Modifier
                                                    .size(7.dp)
                                                    .clip(CircleShape)
                                                    .background(ContrilBlue)
                                            )
                                        }
                                    }

                                    Text(
                                        text = entry.description,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        lineHeight = 16.sp
                                    )

                                    Row(
                                        modifier = Modifier.padding(top = 2.dp),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = if (entry.isNotification) "System Push" else "AI Action",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 9.sp
                                            ),
                                            color = entry.iconColor
                                        )
                                        Text(
                                            text = "•",
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = entry.timestamp,
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

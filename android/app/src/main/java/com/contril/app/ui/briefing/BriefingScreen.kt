package com.contril.app.ui.briefing

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.contril.app.data.model.MeetingItem
import com.contril.app.theme.*
import com.contril.app.ui.components.AtmosphericCard

@Composable
fun BriefingScreen(viewModel: BriefingViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "DAILY INTELLIGENCE",
                    style = MaterialTheme.typography.labelSmall,
                    color = ContrilBlue
                )
                Text(
                    text = "Today's Briefing",
                    style = MaterialTheme.typography.displayMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Executive summary of your schedule, attendee context, and active priorities.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Daily Audio & Text Briefing Card
        item {
            AtmosphericCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = "MORNING BRIEFING READY",
                            style = MaterialTheme.typography.labelSmall,
                            color = ContrilBlue
                        )
                        Text(
                            text = "3 Key Schedule Updates",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    IconButton(
                        onClick = { viewModel.toggleAudioBriefing() },
                        colors = IconButtonDefaults.iconButtonColors(
                            containerColor = if (uiState.isBriefingAudioPlaying) StatusActive else ContrilBlue,
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = if (uiState.isBriefingAudioPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                            contentDescription = "Play Briefing"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "You have 3 meetings today. A conflict was resolved at 2:00 PM by proposing 3:30 PM for Strategy Sync. Client follow-up email draft is waiting for your approval.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            Text(
                text = "SCHEDULE & MEETINGS (${uiState.meetings.size})",
                style = MaterialTheme.typography.labelSmall,
                color = ContrilBlue,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(uiState.meetings) { meeting ->
            MeetingRowItem(meeting = meeting)
        }
    }
}

@Composable
fun MeetingRowItem(meeting: MeetingItem) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = meeting.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (meeting.hasConflict) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = StatusWarning.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "CONFLICT DETECTED",
                            style = MaterialTheme.typography.labelSmall,
                            color = StatusWarning,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Text(
                text = "Time: ${meeting.timeRange} • ${meeting.locationOrLink}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Text(
                text = "Attendees: ${meeting.attendees.joinToString(", ")}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

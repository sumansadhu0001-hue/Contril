package com.contril.app.ui.tasks

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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.outlined.Circle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.model.TaskItem
import com.contril.app.theme.*
import com.contril.app.ui.components.ActionApprovalCard
import com.contril.app.ui.components.ContrilSectionHeader

@Composable
fun TasksScreen(viewModel: TasksViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val filterTabs = listOf("All", "Active", "Urgent", "Completed")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 4.dp, bottom = 40.dp)
    ) {
        item {
            Column(
                modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "ACTION MANAGEMENT",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.4.sp,
                        fontSize = 11.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "Tasks & Actions",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = TextPrimaryLight
                )
                Text(
                    text = "Coordinate daily focus initiatives and approve executive actions.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondaryLight
                )
            }
        }

        // Category Filter Tabs
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(filterTabs) { tab ->
                    val isSelected = uiState.selectedFilter == tab
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) ContrilMidnight else Color.White,
                        border = BorderStroke(1.dp, if (isSelected) ContrilMidnight else Color(0xFFE4E4E7)),
                        modifier = Modifier.clickable { viewModel.setFilter(tab) }
                    ) {
                        Text(
                            text = tab,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 12.sp
                            ),
                            color = if (isSelected) Color.White else TextSecondaryLight,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                        )
                    }
                }
            }
        }

        // Pending Approvals (Sensitive Actions)
        if (uiState.pendingActions.isNotEmpty()) {
            item {
                ContrilSectionHeader(
                    title = "Pending Approvals",
                    eyebrow = "Sensitive Actions (${uiState.pendingActions.size})"
                )
            }

            items(uiState.pendingActions) { action ->
                ActionApprovalCard(
                    action = action,
                    onApprove = { viewModel.approveAction(action.id) },
                    onReject = { viewModel.rejectAction(action.id) }
                )
            }
        }

        // Quick Task Adder Box
        if (uiState.isCreatingTask) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    border = BorderStroke(1.dp, ContrilBlue),
                    shadowElevation = 2.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Add New Focus Task", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimaryLight)
                        OutlinedTextField(
                            value = uiState.newTaskTitle,
                            onValueChange = { viewModel.onNewTaskTitleChange(it) },
                            placeholder = { Text("Task description...", color = TextMutedLight) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ContrilBlue,
                                unfocusedBorderColor = Color(0xFFE4E4E7)
                            )
                        )
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
                            TextButton(onClick = { viewModel.setCreatingTask(false) }) {
                                Text("Cancel", color = TextSecondaryLight)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = { viewModel.createTask() },
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Add Task", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Tasks Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Executive Focus Tasks (${uiState.filteredTasks.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimaryLight
                )
                if (!uiState.isCreatingTask) {
                    TextButton(onClick = { viewModel.setCreatingTask(true) }) {
                        Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = ContrilBlue)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Task", color = ContrilBlue, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }

        // Task Items List
        items(uiState.filteredTasks) { task ->
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                shadowElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    IconButton(
                        onClick = { viewModel.toggleTaskCompletion(task.id) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        if (task.isCompleted) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = "Completed", tint = StatusActive, modifier = Modifier.size(24.dp))
                        } else {
                            Icon(Icons.Outlined.Circle, contentDescription = "Pending", tint = TextMutedLight, modifier = Modifier.size(24.dp))
                        }
                    }

                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = task.title,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                textDecoration = if (task.isCompleted) TextDecoration.LineThrough else TextDecoration.None
                            ),
                            color = if (task.isCompleted) TextMutedLight else TextPrimaryLight
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0xFFF4F4F5)
                            ) {
                                Text(
                                    text = task.category,
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                    color = TextSecondaryLight,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Text(
                                text = "• ${task.dueDate}",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                                color = TextSecondaryLight
                            )
                        }
                    }

                    IconButton(
                        onClick = { viewModel.deleteTask(task.id) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.Filled.DeleteOutline, contentDescription = "Delete", tint = TextMutedLight, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

package com.contril.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.contril.app.data.model.ActionStatus
import com.contril.app.data.model.PendingAction
import com.contril.app.data.model.UserProfile
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.theme.*
import com.contril.app.ui.navigation.Screen

@Composable
fun ContrilLogoMark(
    modifier: Modifier = Modifier.size(24.dp),
    color: Color = ContrilBlue
) {
    Canvas(modifier = modifier) {
        val strokeW = size.minDimension * 0.075f
        val radius = (size.minDimension - strokeW) * 0.44f
        val center = center

        // Outer Ring
        drawCircle(
            color = color,
            radius = radius,
            center = center,
            style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW)
        )

        // Inscribed Diamond
        val diamondHalf = radius * 0.62f
        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(center.x, center.y - diamondHalf)
            lineTo(center.x + diamondHalf, center.y)
            lineTo(center.x, center.y + diamondHalf)
            lineTo(center.x - diamondHalf, center.y)
            close()
        }
        drawPath(
            path = path,
            color = color,
            style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW)
        )
    }
}

@Composable
fun GoogleLogo(
    modifier: Modifier = Modifier.size(20.dp)
) {
    androidx.compose.foundation.Image(
        painter = androidx.compose.ui.res.painterResource(id = com.contril.app.R.drawable.ic_google_logo),
        contentDescription = "Google Logo",
        modifier = modifier
    )
}

@Composable
fun ContrilTopBar(
    title: String = "CONTRIL",
    subtitle: String = "AI Chief of Staff",
    isOnline: Boolean = true,
    userProfile: UserProfile? = null,
    onAvatarClick: (() -> Unit)? = null
) {
    var showProfileSheet by remember { mutableStateOf(false) }

    Surface(
        color = Color.Transparent,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .statusBarsPadding()
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // LEFT: Brand Geometric Logo + Eyebrow Typography
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ContrilLogoMark(
                    modifier = Modifier.size(26.dp),
                    color = ContrilBlue
                )
                Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp
                        ),
                        color = TextPrimaryLight
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Normal,
                            letterSpacing = 0.2.sp
                        ),
                        color = TextSecondaryLight
                    )
                }
            }

            // RIGHT: Active Status Capsule + Real Profile Avatar
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Live Status Pill (Soft shadow on light background)
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = ContrilLightSurface,
                    shadowElevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(if (isOnline) StatusActive else StatusWarning)
                        )
                        Text(
                            text = if (isOnline) "Active" else "Offline",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = TextPrimaryLight
                        )
                    }
                }

                // Dynamic Profile Avatar with Two-tone Gradient
                if (userProfile != null) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(ContrilAccentGradient)
                            .clickable {
                                if (onAvatarClick != null) onAvatarClick() else showProfileSheet = true
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = userProfile.initials,
                            color = Color.White,
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                }
            }
        }
    }

    if (showProfileSheet && userProfile != null) {
        ProfileModalDialog(
            userProfile = userProfile,
            onDismiss = { showProfileSheet = false }
        )
    }
}

@Composable
fun ProfileModalDialog(
    userProfile: UserProfile,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = ContrilBlue, fontWeight = FontWeight.SemiBold)
            }
        },
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(ContrilAccentGradient),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = userProfile.initials,
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                Column {
                    Text(
                        text = userProfile.name.ifBlank { "Contril User" },
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimaryLight
                    )
                    Text(
                        text = userProfile.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondaryLight
                    )
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = ContrilLightBgBottom,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "ACCOUNT ID",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = TextSecondaryLight
                        )
                        Text(
                            text = userProfile.id,
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                            color = TextPrimaryLight
                        )
                    }
                }
            }
        }
    )
}


@Composable
fun ContrilBottomNav(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    val navItems = Screen.bottomNavItems

    Surface(
        color = ContrilLightSurface,
        shadowElevation = 10.dp,
        shape = RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        NavigationBar(
            containerColor = Color.Transparent,
            tonalElevation = 0.dp,
            modifier = Modifier.navigationBarsPadding()
        ) {
            navItems.forEach { screen ->
                val isSelected = currentRoute == screen.route
                NavigationBarItem(
                    selected = isSelected,
                    onClick = { onNavigate(screen.route) },
                    icon = {
                        Icon(
                            imageVector = if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                            contentDescription = screen.title,
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = screen.title,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ContrilBlue,
                        selectedTextColor = ContrilBlue,
                        unselectedIconColor = TextSecondaryLight,
                        unselectedTextColor = TextSecondaryLight,
                        indicatorColor = ContrilBlue.copy(alpha = 0.12f)
                    )
                )
            }
        }
    }
}

@Composable
fun AtmosphericCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = ContrilLightSurface,
        shadowElevation = 6.dp
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            content = content
        )
    }
}

@Composable
fun CommandInputField(
    value: String,
    onValueChange: (String) -> Unit,
    onExecute: () -> Unit,
    isLoading: Boolean = false,
    placeholder: String = "Tell Contril what you need...",
    isListening: Boolean = false,
    onVoiceClick: () -> Unit = {}
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = ContrilLightSurface,
        shadowElevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 14.dp, vertical = 6.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.AutoAwesome,
                contentDescription = "AI Prompt",
                tint = if (isListening) ContrilBlue else ContrilBlue.copy(alpha = 0.9f),
                modifier = Modifier.size(20.dp)
            )

            TextField(
                value = value,
                onValueChange = onValueChange,
                placeholder = {
                    Text(
                        text = if (isListening) "Listening... speak now" else placeholder,
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (isListening) ContrilBlue else TextSecondaryLight
                    )
                },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    disabledContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = TextPrimaryLight,
                    unfocusedTextColor = TextPrimaryLight
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { onExecute() }),
                modifier = Modifier.weight(1f),
                enabled = !isLoading,
                maxLines = 3
            )

            val infiniteTransition = rememberInfiniteTransition(label = "voice_pulse")
            val micScale by infiniteTransition.animateFloat(
                initialValue = 1.0f,
                targetValue = if (isListening) 1.22f else 1.0f,
                animationSpec = infiniteRepeatable(
                    animation = tween(500, easing = FastOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "micScale"
            )

            // Voice Assistant Button
            IconButton(
                onClick = onVoiceClick,
                enabled = !isLoading,
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(
                        if (isListening) ContrilBlue.copy(alpha = 0.15f) else Color.Transparent
                    )
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Filled.Mic else Icons.Outlined.Mic,
                    contentDescription = "Voice Assistant",
                    tint = if (isListening) ContrilBlue else TextSecondaryLight,
                    modifier = Modifier
                        .size(19.dp)
                        .graphicsLayer(scaleX = micScale, scaleY = micScale)
                )
            }

            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    strokeWidth = 2.dp,
                    color = ContrilBlue
                )
            } else {
                IconButton(
                    onClick = onExecute,
                    enabled = value.isNotBlank(),
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(
                            if (value.isNotBlank()) ContrilAccentGradient else Brush.linearGradient(listOf(Color(0xFFE5E7EB), Color(0xFFE5E7EB)))
                        )
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Send",
                        tint = if (value.isNotBlank()) Color.White else TextSecondaryLight,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ActionApprovalCard(
    action: PendingAction,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, ContrilBlue.copy(alpha = 0.4f))
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = ContrilBlue.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = "APPROVAL REQUIRED",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = ContrilBlue,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = action.targetService.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = action.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = action.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (action.status == ActionStatus.PENDING_APPROVAL) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onReject,
                        modifier = Modifier
                            .weight(1f)
                            .magneticPress(onClick = onReject),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        ),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f))
                    ) {
                        Text("Reject", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
                    }

                    Button(
                        onClick = onApprove,
                        modifier = Modifier
                            .weight(1f)
                            .magneticPress(onClick = onApprove),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ContrilBlue,
                            contentColor = Color.White
                        )
                    ) {
                        Text("Approve", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
                    }
                }
            }
        }
    }
}

@Composable
fun AgenticPlanCard(
    plan: com.contril.app.data.model.AgenticExecutionPlan,
    onToggleItem: (String) -> Unit,
    onApprove: () -> Unit,
    onCancel: () -> Unit,
    onUndo: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var typedConfirmationText by remember { mutableStateOf("") }
    val selectedCount = plan.items.count { it.isSelected }
    val isTypedValid = !plan.requiresTypedConfirmation || typedConfirmationText.trim().equals(plan.confirmationKeyword, ignoreCase = true)

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = ContrilLightSurface,
        border = BorderStroke(
            1.dp,
            if (plan.status == com.contril.app.data.model.PlanStatus.COMPLETED) SuccessGreen.copy(alpha = 0.5f) else ContrilBlue.copy(alpha = 0.35f)
        ),
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = when (plan.status) {
                        com.contril.app.data.model.PlanStatus.COMPLETED -> SuccessGreen.copy(alpha = 0.12f)
                        com.contril.app.data.model.PlanStatus.CANCELLED -> Color(0xFF9CA3AF).copy(alpha = 0.15f)
                        else -> ContrilBlue.copy(alpha = 0.12f)
                    }
                ) {
                    Text(
                        text = when (plan.status) {
                            com.contril.app.data.model.PlanStatus.COMPLETED -> "✓ PLAN EXECUTED"
                            com.contril.app.data.model.PlanStatus.CANCELLED -> "PLAN CANCELLED"
                            else -> "PROPOSED ACTION PLAN"
                        },
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        ),
                        color = when (plan.status) {
                            com.contril.app.data.model.PlanStatus.COMPLETED -> SuccessGreen
                            com.contril.app.data.model.PlanStatus.CANCELLED -> Color(0xFF6B7280)
                            else -> ContrilBlue
                        },
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                if (plan.status == com.contril.app.data.model.PlanStatus.PROPOSED && plan.items.isNotEmpty()) {
                    Text(
                        text = "$selectedCount/${plan.items.size} selected",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondaryLight
                    )
                }
            }

            // Title & Description
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = plan.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimaryLight
                )
                Text(
                    text = plan.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondaryLight
                )
            }

            // Items Checkbox List (Expandable / Selectable)
            if (plan.items.isNotEmpty() && plan.status == com.contril.app.data.model.PlanStatus.PROPOSED) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFF9FAFB))
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    plan.items.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onToggleItem(item.id) }
                                .padding(horizontal = 8.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Checkbox(
                                checked = item.isSelected,
                                onCheckedChange = { onToggleItem(item.id) },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = if (item.isDestructive) Color(0xFFEF4444) else ContrilBlue,
                                    uncheckedColor = Color(0xFF9CA3AF)
                                ),
                                modifier = Modifier.size(20.dp)
                            )
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.title,
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = if (item.isSelected) TextPrimaryLight else Color(0xFF9CA3AF)
                                )
                                Text(
                                    text = item.subtitle,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (item.isSelected) TextSecondaryLight else Color(0xFFD1D5DB),
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }

            // Typed Confirmation Field for destructive actions
            if (plan.requiresTypedConfirmation && plan.status == com.contril.app.data.model.PlanStatus.PROPOSED) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Type \"${plan.confirmationKeyword}\" to confirm destructive deletion:",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = Color(0xFFDC2626)
                    )
                    OutlinedTextField(
                        value = typedConfirmationText,
                        onValueChange = { typedConfirmationText = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        placeholder = { Text(plan.confirmationKeyword, color = Color(0xFF9CA3AF)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFDC2626),
                            unfocusedBorderColor = Color(0xFFD1D5DB)
                        )
                    )
                }
            }

            // Post-Execution Summary & Undo
            if (plan.status == com.contril.app.data.model.PlanStatus.COMPLETED) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(SuccessGreen.copy(alpha = 0.10f))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = plan.executionSummary ?: "Action completed successfully.",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                        color = SuccessGreen,
                        modifier = Modifier.weight(1f)
                    )
                    if (plan.canUndo && onUndo != null) {
                        TextButton(onClick = onUndo) {
                            Text("Undo", color = ContrilBlue, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Action Buttons
            if (plan.status == com.contril.app.data.model.PlanStatus.PROPOSED) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onCancel,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Cancel", color = TextSecondaryLight)
                    }

                    Button(
                        onClick = onApprove,
                        enabled = selectedCount > 0 && isTypedValid,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (plan.items.any { it.isDestructive }) Color(0xFFEF4444) else ContrilBlue,
                            contentColor = Color.White
                        )
                    ) {
                        Text("Approve & Execute ($selectedCount)", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
                    }
                }
            }
        }
    }
}

@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(8.dp)
) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "shimmer")
    val alpha by transition.animateFloat(
        initialValue = 0.25f,
        targetValue = 0.65f,
        animationSpec = androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 800, easing = androidx.compose.animation.core.LinearEasing),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "shimmerAlpha"
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(MaterialTheme.colorScheme.onSurface.copy(alpha = alpha * 0.18f))
    )
}

@Composable
fun EmailCardSkeleton() {
    EmailRowSkeleton()
}

@Composable
fun EmailRowSkeleton() {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ShimmerBox(modifier = Modifier.size(width = 130.dp, height = 16.dp))
                ShimmerBox(modifier = Modifier.size(width = 60.dp, height = 12.dp))
            }
            ShimmerBox(modifier = Modifier.fillMaxWidth(0.85f).height(14.dp))
            ShimmerBox(modifier = Modifier.fillMaxWidth().height(12.dp))
        }
    }
}

@Composable
fun EventCardSkeleton() {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            ShimmerBox(modifier = Modifier.size(width = 54.dp, height = 46.dp), shape = RoundedCornerShape(10.dp))
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.7f).height(16.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(12.dp))
            }
        }
    }
}

@Composable
fun TaskRowSkeleton() {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            ShimmerBox(modifier = Modifier.size(20.dp), shape = CircleShape)
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.75f).height(14.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.35f).height(10.dp))
            }
        }
    }
}

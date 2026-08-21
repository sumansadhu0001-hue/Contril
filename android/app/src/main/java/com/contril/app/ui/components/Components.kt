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
import androidx.compose.ui.graphics.vector.ImageVector
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

/**
 * Standard Reusable Surface Card per Design System (Claude + Super.money Spec: 20dp rounded, razor border, subtle elevation)
 */
@Composable
fun ContrilSurfaceCard(
    modifier: Modifier = Modifier,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(20.dp),
    backgroundColor: Color = ContrilLightSurface,
    elevation: androidx.compose.ui.unit.Dp = 2.dp,
    border: BorderStroke? = BorderStroke(1.dp, Color(0xFFF1F5F9)),
    contentPadding: PaddingValues = PaddingValues(18.dp),
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        shape = shape,
        color = backgroundColor,
        shadowElevation = elevation,
        border = border,
        modifier = if (onClick != null) modifier.clickable { onClick() } else modifier
    ) {
        Column(
            modifier = Modifier.padding(contentPadding),
            content = content
        )
    }
}

@Composable
fun SuperQuickActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accentGradient: Brush,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        color = ContrilLightSurface,
        shadowElevation = 2.dp,
        border = BorderStroke(1.dp, Color(0xFFF1F5F9))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(accentGradient),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
            }
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, fontSize = 15.sp),
                    color = TextPrimaryLight
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                    color = TextSecondaryLight
                )
            }
        }
    }
}

@Composable
fun FloatingCommandCapsule(
    query: String,
    onQueryChange: (String) -> Unit,
    onExecute: () -> Unit,
    onVoiceClick: () -> Unit,
    isListening: Boolean,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = ContrilLightSurface,
        shadowElevation = 4.dp,
        border = BorderStroke(1.5.dp, if (isListening) SuperElectricIndigo else Brush.linearGradient(listOf(Color(0xFFE2E8F0), Color(0xFFF1F5F9))))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(SuperElectricIndigo),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
            }

            Text(
                text = if (isListening) "Listening to your voice..." else "Ask Contril anything...",
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp),
                color = if (isListening) ContrilBlue else TextMutedLight,
                modifier = Modifier
                    .weight(1f)
                    .clickable { onExecute() }
            )

            if (isListening) {
                VoiceWaveVisualizer(isListening = true)
            }

            IconButton(
                onClick = onVoiceClick,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Mic,
                    contentDescription = "Voice Input",
                    tint = if (isListening) StatusActive else ContrilBlue,
                    modifier = Modifier.size(22.dp)
                )
            }

            IconButton(
                onClick = onExecute,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(SuperElectricIndigo)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Submit",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

/**
 * Standard Section Header (Monospace Eyebrow + Bold Title + Optional Action)
 */
@Composable
fun ContrilSectionHeader(
    title: String,
    eyebrow: String? = null,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        if (!eyebrow.isNullOrBlank()) {
            Text(
                text = eyebrow.uppercase(),
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                ),
                color = ContrilBlue
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = TextPrimaryLight
            )
            if (!actionText.isNullOrBlank() && onActionClick != null) {
                Text(
                    text = actionText,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = ContrilBlue,
                    modifier = Modifier.clickable { onActionClick() }
                )
            }
        }
    }
}

/**
 * Standard Connection Status Badge (Connected as email, Needs Reconnect, Not Connected)
 */
@Composable
fun ContrilStatusBadge(
    statusText: String,
    isSuccess: Boolean = false,
    isWarning: Boolean = false,
    modifier: Modifier = Modifier
) {
    val bgColor = when {
        isSuccess -> StatusActive.copy(alpha = 0.12f)
        isWarning -> StatusWarning.copy(alpha = 0.12f)
        else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
    }
    val fgColor = when {
        isSuccess -> StatusActive
        isWarning -> StatusWarning
        else -> TextSecondaryLight
    }

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(5.dp)
                    .clip(CircleShape)
                    .background(fgColor)
            )
            Text(
                text = statusText,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                color = fgColor
            )
        }
    }
}

/**
 * Pre-Consent Explainer Bottom Sheet (Notion / Superhuman standard)
 * Plainly explains permissions before launching the Google OAuth consent screen.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GooglePreConsentSheet(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    GoogleLogo(modifier = Modifier.size(28.dp))
                    Column {
                        Text(
                            text = "Connect Google Workspace",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "Single-pass authorization for your AI Chief of Staff",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondaryLight
                        )
                    }
                }
                IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Filled.Close, contentDescription = "Close", tint = TextSecondaryLight)
                }
            }

            Text(
                text = "Contril requests the following Google Workspace permissions to automate your executive workflow. All data is processed with on-device hardware encryption:",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondaryLight,
                lineHeight = 20.sp
            )

            // Explainer Cards
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ConsentPermissionRow(
                    icon = Icons.Outlined.Email,
                    title = "Read Email Inbox",
                    description = "Summarizes unread emails, extracts urgent priorities, and synthesizes your daily executive briefing."
                )
                ConsentPermissionRow(
                    icon = Icons.Outlined.EditNote,
                    title = "Prepare & Send Drafts",
                    description = "Drafts responses for your review. Emails are NEVER sent without your manual approval unless Auto-Send mode is explicitly enabled."
                )
                ConsentPermissionRow(
                    icon = Icons.Outlined.CalendarToday,
                    title = "Read Google Calendar",
                    description = "Detects upcoming meetings, warns of scheduling conflicts, and tracks daily agenda milestones."
                )
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = ContrilBlue.copy(alpha = 0.08f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Filled.Shield, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(18.dp))
                    Text(
                        text = "You can individually disconnect Gmail or Calendar anytime with one tap from the Connections screen.",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = TextPrimaryLight
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel", color = TextSecondaryLight)
                }

                Button(
                    onClick = {
                        onDismiss()
                        onConfirm()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1.5f)
                ) {
                    Text("Continue to Google", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }
    }
}

@Composable
private fun ConsentPermissionRow(
    icon: ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top
    ) {
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = ContrilBlue.copy(alpha = 0.1f),
            modifier = Modifier.size(32.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(18.dp))
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = TextPrimaryLight
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondaryLight,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
fun ContrilTopBar(
    title: String = "CONTRIL",
    subtitle: String = "AI Chief of Staff",
    isOnline: Boolean = true,
    userProfile: UserProfile? = null,
    overnightLogs: List<com.contril.app.data.model.OvernightActivityLog> = emptyList(),
    hasUnreadAlerts: Boolean = false,
    onAvatarClick: (() -> Unit)? = null
) {
    var showProfileSheet by remember { mutableStateOf(false) }
    var showNotificationSheet by remember { mutableStateOf(false) }

    Surface(
        color = Color.Transparent,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .statusBarsPadding()
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // LEFT: Clean Brand Typography
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ContrilLogoMark(
                    modifier = Modifier.size(24.dp),
                    color = ContrilCharcoal
                )
                Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp,
                            fontSize = 15.sp
                        ),
                        color = TextPrimaryLight
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Normal,
                            letterSpacing = 0.2.sp,
                            fontSize = 11.sp
                        ),
                        color = TextSecondaryLight
                    )
                }
            }

            // RIGHT: Minimal Status Pill + Notification Bell + Profile Avatar
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Minimal Status Pill
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = ContrilLightSurface,
                    border = BorderStroke(1.dp, Color(0xFFE4E4E7))
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
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 11.sp),
                            color = TextPrimaryLight
                        )
                    }
                }

                // Minimal Notification Bell
                Surface(
                    onClick = { showNotificationSheet = true },
                    shape = CircleShape,
                    color = ContrilLightSurface,
                    border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
                    modifier = Modifier.size(34.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Outlined.Notifications,
                            contentDescription = "Notifications",
                            tint = TextPrimaryLight,
                            modifier = Modifier.size(17.dp)
                        )
                        if (hasUnreadAlerts || overnightLogs.isNotEmpty()) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 5.dp, end = 5.dp)
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(ContrilCharcoal)
                            )
                        }
                    }
                }

                // Minimal Solid Profile Avatar
                if (userProfile != null) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(ContrilCharcoal)
                            .clickable {
                                if (onAvatarClick != null) onAvatarClick() else showProfileSheet = true
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = userProfile.initials,
                            color = Color.White,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        )
                    }
                }
            }
        }
    }

    if (showNotificationSheet) {
        UnifiedNotificationCenterSheet(
            overnightLogs = overnightLogs,
            onDismiss = { showNotificationSheet = false }
        )
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
        containerColor = ContrilLightSurface,
        shape = RoundedCornerShape(20.dp),
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = ContrilCharcoal),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Close", color = Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(ContrilCharcoal),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = userProfile.initials,
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = userProfile.name.ifBlank { "Executive User" },
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
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF4F4F5),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "ACCOUNT IDENTIFIER",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp, letterSpacing = 1.sp),
                            color = TextSecondaryLight
                        )
                        Text(
                            text = userProfile.id,
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace, fontSize = 12.sp),
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
        border = BorderStroke(1.dp, Color(0xFFE4E4E7)),
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
                            modifier = Modifier.size(20.dp),
                            tint = if (isSelected) TextPrimaryLight else TextMutedLight
                        )
                    },
                    label = {
                        Text(
                            text = screen.title,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 11.sp
                            ),
                            color = if (isSelected) TextPrimaryLight else TextMutedLight
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        indicatorColor = Color(0xFFF4F4F5)
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

@Composable
fun PriceComparisonSkeleton() {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ShimmerBox(modifier = Modifier.size(width = 140.dp, height = 18.dp))
                ShimmerBox(modifier = Modifier.size(width = 80.dp, height = 24.dp), shape = RoundedCornerShape(6.dp))
            }
            ShimmerBox(modifier = Modifier.fillMaxWidth(0.9f).height(14.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ShimmerBox(modifier = Modifier.weight(1f).height(48.dp), shape = RoundedCornerShape(10.dp))
                ShimmerBox(modifier = Modifier.weight(1f).height(48.dp), shape = RoundedCornerShape(10.dp))
            }
        }
    }
}

@Composable
fun ChatMessageSkeleton(isUser: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp
            ),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)),
            modifier = Modifier.fillMaxWidth(if (isUser) 0.65f else 0.85f)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.9f).height(14.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.6f).height(14.dp))
            }
        }
    }
}

@Composable
fun PlanCardSkeleton() {
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ShimmerBox(modifier = Modifier.size(width = 120.dp, height = 22.dp))
                ShimmerBox(modifier = Modifier.size(width = 70.dp, height = 20.dp), shape = RoundedCornerShape(8.dp))
            }
            ShimmerBox(modifier = Modifier.size(width = 100.dp, height = 26.dp))
            ShimmerBox(modifier = Modifier.fillMaxWidth(0.85f).height(14.dp))
            ShimmerBox(modifier = Modifier.fillMaxWidth().height(44.dp), shape = RoundedCornerShape(12.dp))
        }
    }
}

@Composable
fun BriefingCardSkeleton() {
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 3.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ShimmerBox(modifier = Modifier.size(width = 140.dp, height = 18.dp))
                ShimmerBox(modifier = Modifier.size(width = 60.dp, height = 14.dp))
            }
            ShimmerBox(modifier = Modifier.fillMaxWidth().height(14.dp))
            ShimmerBox(modifier = Modifier.fillMaxWidth(0.7f).height(14.dp))
        }
    }
}

// ---------------------------------------------------------------------------
// Advanced Executive UI Components & Workflow Modals
// ---------------------------------------------------------------------------

@Composable
fun VoiceWaveVisualizer(
    isListening: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = androidx.compose.animation.core.rememberInfiniteTransition(label = "wave")
    val heights = (0..5).map { i ->
        infiniteTransition.animateFloat(
            initialValue = 8f,
            targetValue = if (isListening) (16f + (i * 7f) % 24f) else 8f,
            animationSpec = androidx.compose.animation.core.infiniteRepeatable(
                animation = androidx.compose.animation.core.tween(
                    durationMillis = 350 + i * 80,
                    easing = androidx.compose.animation.core.FastOutSlowInEasing
                ),
                repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
            ),
            label = "wave_$i"
        )
    }

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        heights.forEachIndexed { _, animHeight ->
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(animHeight.value.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(if (isListening) ContrilBlue else TextMutedLight)
            )
        }
    }
}

@Composable
fun ProductivityScoreRing(
    resolvedCount: Int,
    totalCount: Int,
    modifier: Modifier = Modifier
) {
    val score = if (totalCount > 0) ((resolvedCount.toFloat() / totalCount.toFloat()) * 100).toInt() else 100

    ContrilSurfaceCard(
        modifier = modifier,
        elevation = 2.dp
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier.size(54.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        progress = { score / 100f },
                        modifier = Modifier.fillMaxSize(),
                        color = ContrilBlue,
                        trackColor = ContrilBlue.copy(alpha = 0.15f),
                        strokeWidth = 5.dp
                    )
                    Text(
                        text = "$score%",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimaryLight
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = "Executive Daily Velocity",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimaryLight
                    )
                    Text(
                        text = "$resolvedCount of $totalCount priorities actioned",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondaryLight
                    )
                }
            }

            ContrilStatusBadge(
                statusText = if (score >= 80) "Optimal" else "In Progress",
                isSuccess = score >= 80,
                isWarning = score < 80
            )
        }
    }
}

@Composable
fun LiveTelemetryStatusCard(
    connectedServicesCount: Int,
    isOnline: Boolean,
    modifier: Modifier = Modifier
) {
    ContrilSurfaceCard(
        modifier = modifier,
        elevation = 2.dp
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (isOnline) StatusActive else StatusError)
                    )
                    Text(
                        text = "WORKSPACE TELEMETRY",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.2.sp
                        ),
                        color = ContrilBlue
                    )
                }
                Text(
                    text = if (isOnline) "Real-time Sync Active" else "Offline Enclave",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondaryLight
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ServiceTelemetryPill(name = "Gmail", isConnected = connectedServicesCount > 0, modifier = Modifier.weight(1f))
                ServiceTelemetryPill(name = "Calendar", isConnected = connectedServicesCount > 0, modifier = Modifier.weight(1f))
                ServiceTelemetryPill(name = "AI Engine", isConnected = isOnline, modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun ServiceTelemetryPill(
    name: String,
    isConnected: Boolean,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = if (isConnected) ContrilBlue.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = BorderStroke(1.dp, if (isConnected) ContrilBlue.copy(alpha = 0.2f) else Color.Transparent)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(if (isConnected) StatusActive else TextMutedLight)
            )
            Text(
                text = name,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 11.sp),
                color = if (isConnected) TextPrimaryLight else TextMutedLight
            )
        }
    }
}

@Composable
fun ToolExecutionReceiptCard(
    toolName: String,
    details: String,
    executionTimeMs: Long = 120,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded },
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFFF8FAFC),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
    ) {
        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Outlined.CheckCircle,
                        contentDescription = null,
                        tint = StatusActive,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Executed: $toolName",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimaryLight
                    )
                }
                Text(
                    text = "${executionTimeMs}ms",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = TextSecondaryLight
                )
            }
            if (expanded) {
                HorizontalDivider(color = Color(0xFFE2E8F0), modifier = Modifier.padding(vertical = 4.dp))
                Text(
                    text = details,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, fontFamily = FontFamily.Monospace),
                    color = TextSecondaryLight
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickScheduleSheet(
    onDismiss: () -> Unit,
    onSchedule: (String, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("10:00 AM") }
    var duration by remember { mutableStateOf("30 min") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = ContrilLightSurface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Quick Schedule Assistant",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = TextPrimaryLight
            )
            Text(
                text = "AI will coordinate calendar invites, check conflicts, and attach Google Meet links.",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondaryLight
            )

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Meeting Title") },
                placeholder = { Text("e.g. Strategic Alignment Sync") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = time,
                    onValueChange = { time = it },
                    label = { Text("Start Time") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = duration,
                    onValueChange = { duration = it },
                    label = { Text("Duration") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        onSchedule(title, time, duration)
                        onDismiss()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                enabled = title.isNotBlank()
            ) {
                Text("Schedule & Generate Meet Link", fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentSummarizerSheet(
    onDismiss: () -> Unit,
    onAnalyze: (String) -> Unit
) {
    var docText by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = ContrilLightSurface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Document & Agreement Analyzer",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = TextPrimaryLight
            )
            Text(
                text = "Extract key obligations, high-risk clauses, deadlines, and financial milestones.",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondaryLight
            )

            OutlinedTextField(
                value = docText,
                onValueChange = { docText = it },
                label = { Text("Document Text / Agreement Excerpt") },
                placeholder = { Text("Paste agreement clauses or contract text...") },
                modifier = Modifier.fillMaxWidth().height(140.dp),
                shape = RoundedCornerShape(12.dp),
                maxLines = 8
            )

            Button(
                onClick = {
                    if (docText.isNotBlank()) {
                        onAnalyze(docText)
                        onDismiss()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue),
                enabled = docText.isNotBlank()
            ) {
                Text("Analyze Document Intelligence", fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

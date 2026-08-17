package com.contril.app.ui.plans

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.data.config.PaymentConfig
import com.contril.app.data.model.SubscriptionStatus
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.SubscriptionRequestManager
import com.contril.app.theme.*
import com.contril.app.ui.components.magneticPress
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlansScreen(
    prefRepository: PreferenceRepository,
    onBack: () -> Unit
) {
    val currentPlan by prefRepository.currentPlan.collectAsState()
    val aiUsage = remember(prefRepository, currentPlan) { prefRepository.getTodayAiUsage() }
    val context = LocalContext.current

    val subscriptionManager = remember(prefRepository) { SubscriptionRequestManager(prefRepository) }
    val entitlementState by subscriptionManager.entitlementState.collectAsState()
    val coroutineScope = rememberCoroutineScope()
    var isChecking by remember { mutableStateOf(false) }

    // Check backend approval on screen launch
    LaunchedEffect(Unit) {
        subscriptionManager.checkBackendApprovalStatus()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Plans & Billing",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "ENTITLEMENT & USAGE",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    color = ContrilBlue
                )
                Text(
                    text = "Choose the autonomy and intelligence level for your personal AI Chief of Staff.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Current Usage Banner
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = ContrilBlue.copy(alpha = 0.08f),
                border = BorderStroke(1.dp, ContrilBlue.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = "Daily AI Commands",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO) {
                                "Unlimited (Pro Active)"
                            } else {
                                "${aiUsage.first} of ${aiUsage.second} used today"
                            },
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO || aiUsage.first < aiUsage.second) {
                            StatusActive.copy(alpha = 0.15f)
                        } else {
                            StatusError.copy(alpha = 0.15f)
                        }
                    ) {
                        Text(
                            text = if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO) "Pro Active" else if (aiUsage.first < aiUsage.second) "Active" else "Limit Reached",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO || aiUsage.first < aiUsage.second) StatusActive else StatusError,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            // Plan 1: Early Access Free Tier
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(
                    1.dp,
                    if (entitlementState.status != SubscriptionStatus.ACTIVE_PRO) ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
                ),
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
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Early Access Free",
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (entitlementState.status != SubscriptionStatus.ACTIVE_PRO) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = ContrilBlue.copy(alpha = 0.12f)
                                    ) {
                                        Text(
                                            text = "CURRENT",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = ContrilBlue,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = "Personal AI Chief of Staff (Freemium)",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Text(
                            text = "₹0",
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                            color = ContrilBlue
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                    listOf(
                        "5 AI command executions per day",
                        "Live Gmail & Google Calendar feeds",
                        "Native Android voice assistant",
                        "Cross-platform price comparison (Zomato & Swiggy)",
                        "Action approval safety gates"
                    ).forEach { feature ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = StatusActive, modifier = Modifier.size(16.dp))
                            Text(text = feature, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }

            // Plan 2: Contril Pro Tier
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(
                    1.5.dp,
                    if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO) StatusActive else ContrilBlue.copy(alpha = 0.5f)
                ),
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
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = PaymentConfig.PRO_PLAN_NAME,
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = StatusActive.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "ACTIVE",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = StatusActive,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = "Unbounded autonomous leverage & priority engine",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = PaymentConfig.PRO_PLAN_PRICE_FORMATTED,
                                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                color = if (entitlementState.status == SubscriptionStatus.ACTIVE_PRO) StatusActive else ContrilBlue
                            )
                            Text(
                                text = PaymentConfig.PRO_PLAN_BILLING_CYCLE,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                    PaymentConfig.PRO_PLAN_FEATURES.forEach { feature ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = ContrilBlue, modifier = Modifier.size(16.dp))
                            Text(text = feature, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // Dynamic State-Gated Action Area
                    when (entitlementState.status) {
                        SubscriptionStatus.PENDING_APPROVAL -> {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = StatusWarning.copy(alpha = 0.12f),
                                border = BorderStroke(1.dp, StatusWarning.copy(alpha = 0.35f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Filled.HourglassTop, contentDescription = null, tint = StatusWarning, modifier = Modifier.size(18.dp))
                                        Text(
                                            text = "PAYMENT SUBMITTED — VERIFICATION IN PROGRESS",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = StatusWarning
                                        )
                                    }
                                    Text(
                                        text = "Payment submitted. Pro access activates within 24 hours after verification.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        lineHeight = 18.sp
                                    )
                                    if (!entitlementState.transactionRef.isNullOrBlank()) {
                                        Text(
                                            text = "Reference: ${entitlementState.transactionRef}",
                                            style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                        )
                                    }
                                }
                            }

                            Button(
                                onClick = {
                                    isChecking = true
                                    coroutineScope.launch {
                                        subscriptionManager.checkBackendApprovalStatus()
                                        isChecking = false
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                                    .magneticPress(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                if (isChecking) {
                                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = ContrilBlue)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Checking...", color = MaterialTheme.colorScheme.onSurface)
                                } else {
                                    Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Check Verification Status", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }

                        SubscriptionStatus.ACTIVE_PRO -> {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = StatusActive.copy(alpha = 0.12f),
                                border = BorderStroke(1.dp, StatusActive.copy(alpha = 0.35f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(Icons.Filled.Verified, contentDescription = null, tint = StatusActive, modifier = Modifier.size(20.dp))
                                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Text(
                                            text = "ACTIVE CONTRIL PRO MEMBER",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = StatusActive
                                        )
                                        Text(
                                            text = "Unbounded autonomous execution active.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }

                        else -> {
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        subscriptionManager.initiateUpgradeFlow(context)
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                                    .magneticPress(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                            ) {
                                Icon(Icons.Filled.OpenInBrowser, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Upgrade to Pro (${PaymentConfig.PRO_PLAN_PRICE_FORMATTED}${PaymentConfig.PRO_PLAN_BILLING_CYCLE})",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

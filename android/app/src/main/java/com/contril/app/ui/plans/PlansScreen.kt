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
import com.contril.app.data.model.EntitlementState
import com.contril.app.data.model.SubscriptionStatus
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.SubscriptionRequestManager
import com.contril.app.theme.*
import com.contril.app.ui.components.magneticPress
import kotlinx.coroutines.launch

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.ui.text.input.KeyboardType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlansScreen(
    prefRepository: PreferenceRepository,
    onBack: () -> Unit
) {
    val currentPlan by prefRepository.currentPlan.collectAsState()
    val context = LocalContext.current

    val subscriptionManager = remember(prefRepository) { SubscriptionRequestManager(prefRepository) }
    val entitlementState by subscriptionManager.entitlementState.collectAsState()
    val coroutineScope = rememberCoroutineScope()
    var isChecking by remember { mutableStateOf(false) }

    var targetUpgradePlan by remember { mutableStateOf<String?>(null) }
    var showAllPlansForDowngrade by remember { mutableStateOf(false) }
    var downgradeConfirmationPlan by remember { mutableStateOf<String?>(null) }

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

            // Under Review Notice (When a paid plan application has been submitted)
            if (entitlementState.status == SubscriptionStatus.PENDING_APPROVAL) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFFFEF3C7),
                    border = BorderStroke(1.dp, Color(0xFFF59E0B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.HourglassTop, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(20.dp))
                            Text(
                                text = "Application Under Review",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = Color(0xFF92400E)
                            )
                        }
                        Text(
                            text = "Your application for ${entitlementState.planName} has been submitted directly to the administrator for review. Contact: ${prefRepository.getUserPhone().ifBlank { prefRepository.getUserProfile()?.email ?: "Registered Contact" }}. Once payment is verified, your access will be activated immediately.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFB45309)
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            TextButton(
                                onClick = {
                                    coroutineScope.launch {
                                        isChecking = true
                                        subscriptionManager.checkBackendApprovalStatus()
                                        isChecking = false
                                    }
                                }
                            ) {
                                if (isChecking) {
                                    CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp, color = Color(0xFFB45309))
                                    Spacer(modifier = Modifier.width(6.dp))
                                }
                                Text("Check Live Status", color = Color(0xFFB45309), fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            val isElite = prefRepository.isElitePlan()
            val isPro = !isElite && (prefRepository.isProOrExecutive() || entitlementState.status == SubscriptionStatus.ACTIVE_PRO)
            val isFree = !isElite && !isPro
            val daytimeTokensUsed = prefRepository.getTodayDaytimeTokensUsed()

            // --- FREE TIER CARD (Shown for Free Users, or when Elite user expands Downgrade view) ---
            if (isFree || (isElite && showAllPlansForDowngrade)) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(
                        1.dp,
                        if (isFree) ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
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
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = PaymentConfig.FREE_PLAN_NAME,
                                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    if (isFree) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = ContrilBlue.copy(alpha = 0.12f)
                                        ) {
                                            Text(
                                                text = "CURRENT PLAN",
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
                                text = PaymentConfig.FREE_PLAN_PRICE_FORMATTED,
                                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                color = ContrilBlue,
                                softWrap = false,
                                maxLines = 1
                            )
                        }

                        if (isFree) {
                            // Live Token Usage Progress
                            val freeLimit = PaymentConfig.FREE_PLAN_DAILY_TOKENS
                            val progress = (daytimeTokensUsed.toFloat() / freeLimit.toFloat()).coerceIn(0f, 1f)
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Daily Token Usage",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = "${String.format("%,d", daytimeTokensUsed)} / ${String.format("%,d", freeLimit)}",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = ContrilBlue
                                    )
                                }
                                LinearProgressIndicator(
                                    progress = { progress },
                                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                    color = ContrilBlue,
                                    trackColor = ContrilBlue.copy(alpha = 0.12f)
                                )
                            }
                        }

                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                        PaymentConfig.FREE_PLAN_FEATURES.forEach { feature ->
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = StatusActive, modifier = Modifier.size(16.dp))
                                Text(text = feature, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        if (isElite && showAllPlansForDowngrade) {
                            OutlinedButton(
                                onClick = { downgradeConfirmationPlan = PaymentConfig.FREE_PLAN_NAME },
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                            ) {
                                Text("Downgrade to Early Access Free", color = MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                }
            }

            // --- PRO TIER CARD (Shown for Free Users, Pro Users, or when Elite user expands Downgrade view) ---
            if (isFree || isPro || (isElite && showAllPlansForDowngrade)) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(
                        1.5.dp,
                        if (isPro) StatusActive else ContrilBlue.copy(alpha = 0.4f)
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
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = PaymentConfig.PRO_PLAN_NAME,
                                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    if (isPro) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = StatusActive.copy(alpha = 0.15f)
                                        ) {
                                            Text(
                                                text = "CURRENT PLAN",
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

                            Row(verticalAlignment = Alignment.Bottom, modifier = Modifier.wrapContentWidth()) {
                                Text(
                                    text = PaymentConfig.PRO_PLAN_PRICE_FORMATTED,
                                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (isPro) StatusActive else ContrilBlue,
                                    softWrap = false,
                                    maxLines = 1
                                )
                                Text(
                                    text = PaymentConfig.PRO_PLAN_BILLING_CYCLE,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(bottom = 4.dp, start = 2.dp),
                                    softWrap = false,
                                    maxLines = 1
                                )
                            }
                        }

                        if (isPro) {
                            // Live Token Usage Progress for Pro
                            val proLimit = PaymentConfig.PRO_PLAN_DAILY_TOKENS
                            val progress = (daytimeTokensUsed.toFloat() / proLimit.toFloat()).coerceIn(0f, 1f)
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Daily Token Usage",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = "${String.format("%,d", daytimeTokensUsed)} / ${String.format("%,d", proLimit)}",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = StatusActive
                                    )
                                }
                                LinearProgressIndicator(
                                    progress = { progress },
                                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                    color = StatusActive,
                                    trackColor = StatusActive.copy(alpha = 0.15f)
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

                        if (isFree) {
                            Button(
                                onClick = { targetUpgradePlan = PaymentConfig.PRO_PLAN_NAME },
                                modifier = Modifier.fillMaxWidth().height(48.dp).magneticPress(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ContrilBlue)
                            ) {
                                Icon(Icons.Filled.Verified, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Upgrade to Pro (${PaymentConfig.PRO_PLAN_PRICE_FORMATTED}${PaymentConfig.PRO_PLAN_BILLING_CYCLE})",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                    color = Color.White
                                )
                            }
                        } else if (isElite && showAllPlansForDowngrade) {
                            OutlinedButton(
                                onClick = { downgradeConfirmationPlan = PaymentConfig.PRO_PLAN_NAME },
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                            ) {
                                Text("Downgrade to Starter Executive (${PaymentConfig.PRO_PLAN_PRICE_FORMATTED}${PaymentConfig.PRO_PLAN_BILLING_CYCLE})", color = MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                }
            }

            // --- ELITE TIER CARD (Shown for Free Users, Pro Users, and Elite Users) ---
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(
                    2.dp,
                    if (isElite) Color(0xFF6366F1) else Color(0xFF6366F1).copy(alpha = 0.5f)
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
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0xFF6366F1).copy(alpha = 0.15f),
                                modifier = Modifier.padding(bottom = 6.dp)
                            ) {
                                Text(
                                    text = if (isElite) "CURRENT PLAN • ACTIVE ELITE" else "OVERNIGHT AUTONOMY",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFF6366F1),
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                                )
                            }
                            Text(
                                text = PaymentConfig.ELITE_PLAN_NAME,
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "24/7 continuous autonomous Chief of Staff intelligence",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Row(verticalAlignment = Alignment.Bottom, modifier = Modifier.wrapContentWidth()) {
                            Text(
                                text = PaymentConfig.ELITE_PLAN_PRICE_FORMATTED,
                                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                color = Color(0xFF6366F1),
                                softWrap = false,
                                maxLines = 1
                            )
                            Text(
                                text = PaymentConfig.ELITE_PLAN_BILLING_CYCLE,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(bottom = 4.dp, start = 2.dp),
                                softWrap = false,
                                maxLines = 1
                            )
                        }
                    }

                    if (isElite) {
                        // Live Token Usage Breakdown for Elite (Daytime + Overnight)
                        val daytimeLimit = PaymentConfig.ELITE_PLAN_DAYTIME_TOKENS
                        val overnightUsed = prefRepository.getTodayOvernightTokensUsed()
                        val overnightLimit = PaymentConfig.ELITE_PLAN_OVERNIGHT_TOKENS
                        val daytimeProgress = (daytimeTokensUsed.toFloat() / daytimeLimit.toFloat()).coerceIn(0f, 1f)

                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Daytime Intelligence Tokens",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = "${String.format("%,d", daytimeTokensUsed)} / ${String.format("%,d", daytimeLimit)}",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = Color(0xFF6366F1)
                                    )
                                }
                                LinearProgressIndicator(
                                    progress = { daytimeProgress },
                                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                    color = Color(0xFF6366F1),
                                    trackColor = Color(0xFF6366F1).copy(alpha = 0.15f)
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Overnight Autonomy Reserve",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${String.format("%,d", overnightUsed)} / ${String.format("%,d", overnightLimit)} tokens",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                    PaymentConfig.ELITE_PLAN_FEATURES.forEach { feature ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF6366F1), modifier = Modifier.size(16.dp))
                            Text(text = feature, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }

                    if (!isElite) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Button(
                            onClick = { targetUpgradePlan = PaymentConfig.ELITE_PLAN_NAME },
                            modifier = Modifier.fillMaxWidth().height(48.dp).magneticPress(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                        ) {
                            Icon(Icons.Filled.Verified, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Upgrade to Elite (${PaymentConfig.ELITE_PLAN_PRICE_FORMATTED}${PaymentConfig.ELITE_PLAN_BILLING_CYCLE})",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // --- ELITE "CHANGE PLAN" LOW-EMPHASIS TOGGLE ---
            if (isElite) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    TextButton(
                        onClick = { showAllPlansForDowngrade = !showAllPlansForDowngrade }
                    ) {
                        Text(
                            text = if (showAllPlansForDowngrade) "Hide Alternative Plans" else "Change Plan",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Downgrade Confirmation Dialog
        downgradeConfirmationPlan?.let { targetPlan ->
            AlertDialog(
                onDismissRequest = { downgradeConfirmationPlan = null },
                title = {
                    Text(
                        text = "Downgrade to $targetPlan?",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
                text = {
                    Text(
                        text = "This will reduce your daily token budget and remove Overnight Autonomy Mode. Are you sure you want to request a downgrade to $targetPlan?",
                        style = MaterialTheme.typography.bodyMedium
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val planToSubmit = targetPlan
                            downgradeConfirmationPlan = null
                            coroutineScope.launch {
                                val user = prefRepository.getUserProfile()
                                val phone = prefRepository.getUserPhone().ifBlank { "Unspecified" }
                                subscriptionManager.submitPlanUpgradeApplication(
                                    targetPlan = planToSubmit,
                                    phoneNumber = phone,
                                    email = user?.email ?: "",
                                    name = user?.name ?: ""
                                )
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Confirm Downgrade", color = Color.White)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { downgradeConfirmationPlan = null }) {
                        Text("Keep Elite Plan")
                    }
                }
            )
        }

        // Plan Upgrade Application Modal
        targetUpgradePlan?.let { plan ->
            PlanUpgradeApplicationDialog(
                planName = plan,
                prefRepository = prefRepository,
                onDismiss = { targetUpgradePlan = null },
                onSubmit = { phone, email, name ->
                    val result = subscriptionManager.submitPlanUpgradeApplication(
                        targetPlan = plan,
                        phoneNumber = phone,
                        email = email,
                        name = name
                    )
                    if (result.isSuccess) {
                        targetUpgradePlan = null
                    }
                    result
                }
            )
        }
    }
}

@Composable
fun PlanUpgradeApplicationDialog(
    planName: String,
    prefRepository: PreferenceRepository,
    onDismiss: () -> Unit,
    onSubmit: suspend (phone: String, email: String, name: String) -> Result<EntitlementState>
) {
    val isElite = planName.contains("Elite", ignoreCase = true)
    val priceText = if (isElite) "${PaymentConfig.ELITE_PLAN_PRICE_FORMATTED}${PaymentConfig.ELITE_PLAN_BILLING_CYCLE}" else "${PaymentConfig.PRO_PLAN_PRICE_FORMATTED}${PaymentConfig.PRO_PLAN_BILLING_CYCLE}"
    val accentColor = if (isElite) Color(0xFF6366F1) else ContrilBlue

    val dialogScope = rememberCoroutineScope()
    var phoneNumber by remember { mutableStateOf(prefRepository.getUserPhone()) }
    var email by remember { mutableStateOf(prefRepository.getUserProfile()?.email ?: "") }
    var name by remember { mutableStateOf(prefRepository.getUserProfile()?.name ?: "") }
    var errorMessage by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!isSubmitting) onDismiss() },
        title = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Apply for Plan Upgrade",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "$planName ($priceText)",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = accentColor
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFFFEF3C7),
                    border = BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Your request will be submitted directly to the administrator for review. Please provide your phone number so payment and account activation can be confirmed.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF92400E),
                        modifier = Modifier.padding(10.dp)
                    )
                }

                OutlinedTextField(
                    value = phoneNumber,
                    onValueChange = { 
                        phoneNumber = it
                        errorMessage = ""
                    },
                    label = { Text("Phone Number *") },
                    placeholder = { Text("e.g. +91 98765 43210") },
                    leadingIcon = { Icon(Icons.Filled.Phone, contentDescription = null, tint = accentColor) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    isError = errorMessage.isNotBlank(),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    leadingIcon = { Icon(Icons.Filled.Email, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name") },
                    leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                if (errorMessage.isNotBlank()) {
                    Text(
                        text = errorMessage,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (phoneNumber.trim().length < 8) {
                        errorMessage = "Please enter a valid phone number to apply."
                        return@Button
                    }
                    isSubmitting = true
                    errorMessage = ""
                    dialogScope.launch {
                        val result = onSubmit(phoneNumber.trim(), email.trim(), name.trim())
                        isSubmitting = false
                        if (result.isFailure) {
                            errorMessage = result.exceptionOrNull()?.localizedMessage ?: "Failed to submit request. Please verify internet connection."
                        }
                    }
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                shape = RoundedCornerShape(10.dp)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(6.dp))
                }
                Text("Submit Application", fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isSubmitting
            ) {
                Text("Cancel")
            }
        },
        shape = RoundedCornerShape(18.dp)
    )
}

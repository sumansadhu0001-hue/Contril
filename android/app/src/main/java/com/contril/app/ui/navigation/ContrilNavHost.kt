package com.contril.app.ui.navigation

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.theme.*
import com.contril.app.ui.auth.AuthScreen
import com.contril.app.ui.auth.AuthViewModel
import com.contril.app.ui.briefing.BriefingScreen
import com.contril.app.ui.briefing.BriefingViewModel
import com.contril.app.ui.components.ContrilBottomNav
import com.contril.app.ui.components.ContrilTopBar
import com.contril.app.ui.home.HomeScreen
import com.contril.app.ui.home.HomeViewModel
import com.contril.app.ui.inbox.InboxScreen
import com.contril.app.ui.inbox.InboxViewModel
import com.contril.app.ui.integrations.IntegrationsScreen
import com.contril.app.ui.integrations.IntegrationsViewModel
import com.contril.app.ui.settings.SettingsScreen
import com.contril.app.ui.settings.SettingsViewModel
import com.contril.app.ui.tasks.TasksScreen
import com.contril.app.ui.tasks.TasksViewModel

@Composable
fun ContrilAppContent(
    repository: ContrilRepository,
    prefRepository: PreferenceRepository
) {
    var isSplashComplete by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

    // Startup Experience (Restores state, checks backend, initializes models)
    if (!isSplashComplete) {
        androidx.compose.runtime.LaunchedEffect(Unit) {
            try {
                prefRepository.syncOnboardingStatusFromCloud()
            } catch (_: Throwable) {}
            kotlinx.coroutines.delay(1200) // Brief graceful startup animation
            isSplashComplete = true
        }

        androidx.compose.material3.Surface(
            modifier = Modifier.fillMaxSize(),
            color = androidx.compose.material3.MaterialTheme.colorScheme.background
        ) {
            androidx.compose.foundation.layout.Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                androidx.compose.foundation.layout.Column(
                    horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
                    verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(16.dp)
                ) {
                    com.contril.app.ui.components.ContrilLogoMark(modifier = Modifier.size(56.dp))
                    androidx.compose.foundation.layout.Column(
                        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
                        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(4.dp)
                    ) {
                        androidx.compose.material3.Text(
                            text = "CONTRIL",
                            style = androidx.compose.material3.MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                letterSpacing = 2.sp
                            ),
                            color = androidx.compose.material3.MaterialTheme.colorScheme.onBackground
                        )
                        androidx.compose.material3.Text(
                            text = "AI Chief of Staff",
                            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
                            color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
        return
    }

    val currentUser by prefRepository.currentUser.collectAsState()
    val hasCompletedOnboarding by prefRepository.hasCompletedOnboarding.collectAsState()

    // 1. Unauthenticated Gate -> Show Premium Auth Screen
    if (currentUser == null) {
        val authViewModel = androidx.compose.runtime.remember {
            try {
                AuthViewModel(repository, prefRepository)
            } catch (e: Exception) {
                Log.e("ContrilNav", "AuthViewModel creation failed", e)
                AuthViewModel()
            }
        }

        AuthScreen(
            viewModel = authViewModel,
            onAuthSuccess = {
                // currentUser StateFlow update triggers automatic recomposition
            }
        )
        return
    }

    // 2. First-Run Onboarding Gate
    if (!hasCompletedOnboarding) {
        com.contril.app.ui.onboarding.OnboardingScreen(
            prefRepository = prefRepository,
            onFinish = {
                // Automatically proceeds to workspace
            }
        )
        return
    }

    // 2. Authenticated App -> Command Center Workspace
    val context = androidx.compose.ui.platform.LocalContext.current
    val networkMonitor = androidx.compose.runtime.remember {
        com.contril.app.data.network.NetworkMonitor.getInstance(context)
    }

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val homeViewModel = androidx.compose.runtime.remember {
        try {
            HomeViewModel(
                repository = repository,
                prefRepository = prefRepository,
                comparisonManager = com.contril.app.data.automation.PriceComparisonManager(prefRepository, networkMonitor),
                networkMonitor = networkMonitor
            )
        } catch (e: Exception) {
            Log.e("ContrilNav", "HomeViewModel creation failed", e)
            HomeViewModel()
        }
    }
    val briefingViewModel = androidx.compose.runtime.remember {
        try {
            BriefingViewModel(repository, prefRepository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "BriefingViewModel creation failed", e)
            BriefingViewModel(repository, prefRepository)
        }
    }
    val inboxViewModel = androidx.compose.runtime.remember {
        try {
            InboxViewModel(
                repository = repository,
                prefRepository = prefRepository,
                networkMonitor = networkMonitor
            )
        } catch (e: Exception) {
            Log.e("ContrilNav", "InboxViewModel creation failed", e)
            InboxViewModel(repository, prefRepository)
        }
    }
    val tasksViewModel = androidx.compose.runtime.remember {
        try {
            TasksViewModel(repository, prefRepository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "TasksViewModel creation failed", e)
            TasksViewModel(repository, prefRepository)
        }
    }
    val integrationsViewModel = androidx.compose.runtime.remember {
        try {
            IntegrationsViewModel(repository, prefRepository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "IntegrationsViewModel creation failed", e)
            IntegrationsViewModel(repository, prefRepository)
        }
    }
    val settingsViewModel = androidx.compose.runtime.remember {
        try {
            SettingsViewModel(prefRepository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "SettingsViewModel creation failed", e)
            SettingsViewModel(prefRepository)
        }
    }

    val chatViewModel = androidx.compose.runtime.remember {
        try {
            com.contril.app.ui.chat.ChatViewModel(
                repository = repository,
                prefRepository = prefRepository,
                comparisonManager = com.contril.app.data.automation.PriceComparisonManager(prefRepository, networkMonitor),
                networkMonitor = networkMonitor
            )
        } catch (e: Exception) {
            Log.e("ContrilNav", "ChatViewModel creation failed", e)
            com.contril.app.ui.chat.ChatViewModel(repository, prefRepository)
        }
    }

    var showProfileHub by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ContrilLightBackgroundGradient)
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                if (currentRoute != Screen.Chat.route && !currentRoute.startsWith("chat") && currentRoute != Screen.Permissions.route) {
                    ContrilTopBar(
                        userProfile = currentUser,
                        onAvatarClick = {
                            showProfileHub = true
                        }
                    )
                }
            },
        bottomBar = {
            if (currentRoute != Screen.Chat.route && !currentRoute.startsWith("chat") && currentRoute != Screen.Permissions.route) {
                ContrilBottomNav(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        if (route != currentRoute) {
                            navController.navigate(route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = false
                                }
                                launchSingleTop = true
                                restoreState = false
                            }
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToTasks = { navController.navigate(Screen.Tasks.route) },
                    onNavigateToBriefing = { navController.navigate(Screen.Briefing.route) },
                    onNavigateToChat = { prompt ->
                        val encoded = try { java.net.URLEncoder.encode(prompt, "UTF-8") } catch (_: Exception) { prompt }
                        navController.navigate("chat?prompt=$encoded")
                    },
                    onNavigateToIntegrations = { navController.navigate(Screen.Integrations.route) },
                    onNavigateToPermissions = { navController.navigate(Screen.Permissions.route) }
                )
            }
            composable(
                route = "chat?prompt={prompt}",
                arguments = listOf(
                    androidx.navigation.navArgument("prompt") {
                        type = androidx.navigation.NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { backStackEntry ->
                val promptArg = backStackEntry.arguments?.getString("prompt")
                val decodedPrompt = promptArg?.let {
                    try { java.net.URLDecoder.decode(it, "UTF-8") } catch (_: Exception) { it }
                }
                com.contril.app.ui.chat.ChatScreen(
                    viewModel = chatViewModel,
                    initialPrompt = decodedPrompt,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Chat.route) {
                com.contril.app.ui.chat.ChatScreen(
                    viewModel = chatViewModel,
                    initialPrompt = null,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Permissions.route) {
                com.contril.app.ui.permissions.PermissionsScreen(
                    prefRepository = prefRepository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Briefing.route) {
                BriefingScreen(
                    viewModel = briefingViewModel,
                    onNavigateToConnected = { navController.navigate(Screen.Integrations.route) }
                )
            }
            composable(Screen.Inbox.route) {
                InboxScreen(
                    viewModel = inboxViewModel,
                    onNavigateToConnected = { navController.navigate(Screen.Integrations.route) }
                )
            }
            composable(Screen.Tasks.route) {
                TasksScreen(viewModel = tasksViewModel)
            }
            composable(Screen.Integrations.route) {
                IntegrationsScreen(viewModel = integrationsViewModel)
            }
            composable(Screen.Plans.route) {
                com.contril.app.ui.plans.PlansScreen(
                    prefRepository = prefRepository,
                    onBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Profile.route) {
                SettingsScreen(viewModel = settingsViewModel)
            }
            composable(Screen.Settings.route) {
                SettingsScreen(viewModel = settingsViewModel)
            }
        }
    }

    if (showProfileHub) {
        com.contril.app.ui.components.ProfileHubSheet(
            prefRepository = prefRepository,
            onDismiss = { showProfileHub = false },
            onNavigateToConnected = { navController.navigate(Screen.Integrations.route) },
            onNavigateToPlans = { navController.navigate(Screen.Plans.route) },
            onNavigateToBriefing = { navController.navigate(Screen.Briefing.route) },
            onNavigateToPermissions = { navController.navigate(Screen.Permissions.route) },
            onSignOut = { prefRepository.clearSession() }
        )
    }
    }
}

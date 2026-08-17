package com.contril.app.ui.navigation

import android.util.Log
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
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
    val currentUser by prefRepository.currentUser.collectAsState()

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
                // currentUser StateFlow update triggers automatic recomposition to authenticated workspace
            }
        )
        return
    }

    // 2. Authenticated App -> Command Center Workspace
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val homeViewModel = androidx.compose.runtime.remember {
        try {
            HomeViewModel(repository, prefRepository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "HomeViewModel creation failed", e)
            HomeViewModel()
        }
    }
    val briefingViewModel = androidx.compose.runtime.remember {
        try {
            BriefingViewModel(repository)
        } catch (e: Exception) {
            Log.e("ContrilNav", "BriefingViewModel creation failed", e)
            BriefingViewModel()
        }
    }
    val inboxViewModel = androidx.compose.runtime.remember {
        try {
            InboxViewModel(repository, prefRepository)
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

    Scaffold(
        topBar = {
            ContrilTopBar(
                userProfile = currentUser,
                onAvatarClick = {
                    if (currentRoute != Screen.Settings.route) {
                        navController.navigate(Screen.Settings.route)
                    }
                }
            )
        },
        bottomBar = {
            ContrilBottomNav(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    if (route != currentRoute) {
                        navController.navigate(route) {
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
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
                    onNavigateToTasks = { navController.navigate(Screen.Tasks.route) }
                )
            }
            composable(Screen.Briefing.route) {
                BriefingScreen(viewModel = briefingViewModel)
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
            composable(Screen.Settings.route) {
                SettingsScreen(viewModel = settingsViewModel)
            }
        }
    }
}

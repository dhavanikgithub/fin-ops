package com.example.fin_ops

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.fin_ops.presentation.calculator.CalculatorScreen
import com.example.fin_ops.presentation.calculator.finkeda.FinkedaSavedScenariosScreen
import com.example.fin_ops.presentation.calculator.finkeda.FinkedaSettingsScreen
import com.example.fin_ops.presentation.calculator.simple.BankPresetsScreen
import com.example.fin_ops.presentation.calculator.simple.PlatformPresetsScreen
import com.example.fin_ops.presentation.calculator.simple.SavedScenariosScreen
import com.example.fin_ops.presentation.components.ConnectivityBanner
import com.example.fin_ops.presentation.components.FinOpsTopAppBar
import com.example.fin_ops.presentation.ledger.LedgerScreen
import com.example.fin_ops.presentation.ledger.banks.LedgerBanksScreen
import com.example.fin_ops.presentation.ledger.cards.LedgerCardsScreen
import com.example.fin_ops.presentation.ledger.clients.LedgerClientsScreen
import com.example.fin_ops.presentation.ledger.transactions.LedgerTransactionsScreen
import com.example.fin_ops.presentation.navigation.BottomNavigationBar
import com.example.fin_ops.presentation.navigation.BottomNavItem
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.presentation.profiler.ProfilerScreen
import com.example.fin_ops.presentation.profiler.ProfilerScreenContent
import com.example.fin_ops.presentation.profiler.ProfilerState
import com.example.fin_ops.presentation.profiler.TransactionState
import com.example.fin_ops.presentation.profiler.banks.BanksScreen
import com.example.fin_ops.presentation.profiler.clients.ClientsScreen
import com.example.fin_ops.presentation.profiler.profile_detail.ProfileDetailScreen
import com.example.fin_ops.presentation.profiler.profiles.ProfileScreen
import com.example.fin_ops.presentation.profiler.transactions.TransactionsScreen
import com.example.fin_ops.presentation.settings.SettingsScreen
import com.example.fin_ops.ui.theme.FinOpsTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    mainViewModel: MainViewModel = hiltViewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Define your "Main" (Bottom Nav) screens
    val bottomNavRoutes = listOf(
        BottomNavItem.Profiler.route,
        BottomNavItem.Ledger.route,
        BottomNavItem.Calculator.route,
        BottomNavItem.Settings.route
    )

    // Configure the Title
    val title = when (currentRoute) {
        BottomNavItem.Profiler.route -> "Profiler Dashboard"
        BottomNavItem.Ledger.route -> "Ledger Dashboard"
        BottomNavItem.Calculator.route -> "Calculator"
        BottomNavItem.Settings.route -> "Settings"
        Routes.PF_PROFILES -> "Profiles"
        Routes.PF_TRANSACTIONS -> "Transactions"
        Routes.PF_CLIENTS -> "Clients"
        Routes.PF_BANKS -> "Banks"
        Routes.BANK_PRESETS -> "Bank Charge Presets"
        Routes.PLATFORM_PRESETS -> "Platform Charge Presets"
        Routes.SIMPLE_CALC_HISTORY -> "Saved Scenarios"
        Routes.FINKEDA_CALC_HISTORY -> "Finkeda Saved Scenarios"
        Routes.FINKEDA_CALC_SETTINGS -> "Finkeda Settings"
        Routes.LEDGER_CARD -> "Cards"
        Routes.LEDGER_BANK -> "Banks"
        Routes.LEDGER_CLIENTS -> "Clients"
        Routes.LEDGER_TRANSACTIONS -> "Transactions"
       "${Routes.PF_PROFILES_DETAIL}/{profileId}" -> "Profile Details"
        else -> "FinOps"
    }

    // Configure Back Button and Bottom Bar Visibility
    val showBackButton = currentRoute !in bottomNavRoutes
    val showBottomBar = currentRoute in bottomNavRoutes

    // Observe Connectivity State
    val connectionState by mainViewModel.connectionState
    val isBannerVisible = connectionState !is ConnectivityState.Connected

    // Animate the Status Bar color (Red when error, Default Background when normal)
    val statusBarColor by animateColorAsState(
        targetValue = if (isBannerVisible) Color(0xFFCC0000) else MaterialTheme.colorScheme.background,
        label = "StatusBarColor"
    )

    Scaffold(
        contentWindowInsets = WindowInsets(0.dp),
        topBar = {
            Column {
                // 1. Explicit Status Bar Background
                // This ensures the space behind the clock is always the correct color and height
                Spacer(
                    modifier = Modifier
                        .fillMaxWidth()
                        .windowInsetsTopHeight(WindowInsets.statusBars)
                        .background(statusBarColor)
                )

                // 2. Place the Banner here, ABOVE the TopAppBar
                ConnectivityBanner(connectionState = connectionState)

                // 3. The App Bar
                // We pass 0 insets because the Spacer at #1 already reserved the top space
                if (currentRoute != BottomNavItem.Profiler.route) {
                    FinOpsTopAppBar(
                        title = title,
                        navController = navController,
                        showBackButton = showBackButton,
                        windowInsets = WindowInsets(0.dp)
                    )
                }
            }

        },
        bottomBar = {
            if (showBottomBar) {
                BottomNavigationBar(navController = navController)
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            // Use the standard NavHost and define transitions within it
            NavHost(
                navController = navController,
                startDestination = BottomNavItem.Profiler.route,
                // Define default animations for entering a screen
                enterTransition = {
                    slideIntoContainer(
                        towards = AnimatedContentTransitionScope.SlideDirection.Left,
                        animationSpec = tween(500)
                    )
                },
                // Define default animations for exiting a screen
                exitTransition = {
                    slideOutOfContainer(
                        towards = AnimatedContentTransitionScope.SlideDirection.Left,
                        animationSpec = tween(500)
                    )
                },
                // Define default animations for re-entering a screen after popping the back stack
                popEnterTransition = {
                    slideIntoContainer(
                        towards = AnimatedContentTransitionScope.SlideDirection.Right,
                        animationSpec = tween(500)
                    )
                },
                // Define default animations for popping a screen from the back stack
                popExitTransition = {
                    slideOutOfContainer(
                        towards = AnimatedContentTransitionScope.SlideDirection.Right,
                        animationSpec = tween(500)
                    )
                }
            ) {
                // Main Bottom Nav Screens (with custom fade for no lateral movement)
                composable(
                    BottomNavItem.Profiler.route,
                ) { ProfilerScreen(navController) }
                composable(
                    BottomNavItem.Ledger.route,
                ) { LedgerScreen(navController) }
                composable(
                    BottomNavItem.Settings.route,
                ) { SettingsScreen(mainViewModel) }
                composable(
                    BottomNavItem.Calculator.route,
                ) { CalculatorScreen(navController) }

                // Nested Screens from Profiler (will use the default slide animations)
                composable(Routes.PF_PROFILES) { ProfileScreen(navController) }
                composable(
                    route = "${Routes.PF_PROFILES_DETAIL}/{profileId}",
                    arguments = listOf(
                        navArgument("profileId") { type = NavType.IntType }
                    )
                ) {
                    ProfileDetailScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                composable(Routes.PF_TRANSACTIONS) { TransactionsScreen() }
                composable(Routes.PF_CLIENTS) { ClientsScreen() }
                composable(Routes.PF_BANKS) { BanksScreen() }
                composable(Routes.BANK_PRESETS) { BankPresetsScreen() }
                composable(Routes.PLATFORM_PRESETS) { PlatformPresetsScreen() }
                composable(Routes.SIMPLE_CALC_HISTORY) { SavedScenariosScreen() }
                composable(Routes.FINKEDA_CALC_HISTORY) { FinkedaSavedScenariosScreen() }
                composable(Routes.FINKEDA_CALC_SETTINGS) { FinkedaSettingsScreen() }

                // Nested Screens from Ledger
                composable(Routes.LEDGER_CARD) { LedgerCardsScreen() }
                composable(Routes.LEDGER_BANK) { LedgerBanksScreen() }
                composable(Routes.LEDGER_CLIENTS) { LedgerClientsScreen() }
                composable(Routes.LEDGER_TRANSACTIONS) { LedgerTransactionsScreen() }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    FinOpsTheme {
        // This preview will now render successfully by showing the main layout
        // without attempting to initialize a NavHost that contains ViewModels.
        Scaffold(
            topBar = {
                FinOpsTopAppBar(
                    title = "Preview",
                    navController = rememberNavController(),
                    showBackButton = false
                )
            },
            bottomBar = {
                BottomNavigationBar(navController = rememberNavController())
            }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                // The NavHost is intentionally left empty for the preview
                // to prevent ViewModels from being instantiated.
                // 1. Create Mock/Dummy Data for the preview
                // Note: Use empty constructors or fill with fake strings/numbers
                val dummyProfileState = ProfilerState(
                    isLoading = false,
                    error = "",
                    profiles = emptyList() // Or list of ProfilerProfileDto(...)
                )

                val dummyTransactionState = TransactionState(
                    isLoading = false,
                    transactions = null // Or a valid dummy transaction object
                )

                // 2. Call the CONTENT composable, not the screen
                ProfilerScreenContent(
                    navController = rememberNavController(),
                    state = dummyProfileState,
                    transactionsState = dummyTransactionState
                )
            }
        }
    }
}

@Preview(showBackground = false, name = "Main Screen Dark")
@Composable
fun MainScreenPreviewDark() {
    FinOpsTheme(darkTheme = true) {
        // Surface ensures the dark background is applied behind the Scaffold
        Surface(color = MaterialTheme.colorScheme.background) {
            Scaffold(
                topBar = {
                    FinOpsTopAppBar(
                        title = "Preview",
                        navController = rememberNavController(),
                        showBackButton = false
                    )
                },
                bottomBar = {
                    BottomNavigationBar(navController = rememberNavController())
                }
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    // 1. Create Mock/Dummy Data for the preview
                    val dummyProfileState = ProfilerState(
                        isLoading = false,
                        error = "",
                        profiles = emptyList()
                    )

                    val dummyTransactionState = TransactionState(
                        isLoading = false,
                        transactions = null
                    )

                    // 2. Call the CONTENT composable
                    ProfilerScreenContent(
                        navController = rememberNavController(),
                        state = dummyProfileState,
                        transactionsState = dummyTransactionState
                    )
                }
            }
        }
    }
}
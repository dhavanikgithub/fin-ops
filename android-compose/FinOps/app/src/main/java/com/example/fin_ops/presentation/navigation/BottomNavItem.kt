package com.example.fin_ops.presentation.navigation

import com.example.fin_ops.R

sealed class BottomNavItem(val route: String, val icon: Int, val title: String) {
    object Profiler : BottomNavItem("profiler", R.drawable.circle_user, "Profiler")
    object Ledger : BottomNavItem("ledger", R.drawable.book, "Ledger")

    object Calculator : BottomNavItem("calculator", R.drawable.calculator, "Calculator")
    object Settings : BottomNavItem("settings", R.drawable.settings, "Settings")
}

package com.example.fin_ops.presentation.navigation

/**
 * Singleton object to hold all navigation route constants.
 */
object Routes {
    // Bottom Navigation Bar main screens
    const val PROFILER = "profiler"
    const val LEDGER = "ledger"
    const val CALCULATOR = "calculator"
    const val SETTINGS = "settings"

    // Profiler's Quick Action screens (nested routes)
    const val PF_PROFILES = "pf_profiles_screen"
    const val PF_PROFILES_DETAIL = "pf_profile_detail"
    const val PF_TRANSACTIONS = "pf_transactions_screen"
    const val PF_CLIENTS = "pf_clients_screen"
    const val PF_BANKS = "pf_banks_screen"

    // Ledger's Quick Action screens (nested routes)
    const val LEDGER_TRANSACTIONS = "ledger_transactions"
    const val LEDGER_CLIENTS = "ledger_clients"
    const val LEDGER_BANK = "ledger_bank"
    const val LEDGER_CARD = "ledger_card"
    const val LEDGER_EXPORT = "ledger_export"

    const val BANK_PRESETS = "bank_presets"
    const val PLATFORM_PRESETS = "platform_presets"
    const val FINKEDA_CALC_SETTINGS = "finkeda_calc_settings"
    const val FINKEDA_CALC_HISTORY = "finkeda_calc_history"
    const val SIMPLE_CALC_HISTORY = "simple_calc_history"
}

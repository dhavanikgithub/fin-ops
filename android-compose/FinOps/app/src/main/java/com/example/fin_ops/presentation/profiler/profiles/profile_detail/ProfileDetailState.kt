package com.example.fin_ops.presentation.profiler.profiles.profile_detail

import com.example.fin_ops.data.remote.dto.Pagination
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.data.remote.dto.TransactionSummary

data class ProfileDetailState(
    // Profile data
    val profile: ProfilerProfileDto? = null,
    val isLoadingProfile: Boolean = false,
    val profileError: String? = null,

    // Transactions data
    val transactions: List<ProfilerTransactionDto> = emptyList(),
    val isLoadingTransactions: Boolean = false,
    val transactionsError: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",

    // Summary data
    val summary: TransactionSummary? = null,
    val isLoadingSummary: Boolean = false,

    // Dialog/Form states
    val isDepositFormVisible: Boolean = false,
    val isWithdrawFormVisible: Boolean = false,

    // Deposit Form fields
    val depositFormAmount: String = "",
    val depositFormNotes: String = "",

    // Withdraw Form fields
    val withdrawFormAmount: String = "",
    val withdrawFormChargesPercentage: String = "",
    val withdrawFormNotes: String = "",

    val formError: String? = null,

    // Delete confirmation
    val showDeleteTransactionDialog: Boolean = false,
    val transactionToDelete: ProfilerTransactionDto? = null,

    // Export
    val isExporting: Boolean = false,

    // General error
    val error: String? = null
)
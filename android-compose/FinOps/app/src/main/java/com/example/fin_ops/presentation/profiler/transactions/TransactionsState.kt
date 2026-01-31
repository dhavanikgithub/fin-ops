package com.example.fin_ops.presentation.profiler.transactions

import com.example.fin_ops.data.remote.dto.AutocompleteProfilerProfileDto
import com.example.fin_ops.data.remote.dto.Pagination
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.data.remote.dto.TransactionSummary

data class TransactionsState(
    val transactions: List<ProfilerTransactionDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",
    val summary: TransactionSummary? = null,

    // Filtering & Sorting
    val filterType: String? = null, // null = all, "deposit", "withdraw"
    val sortBy: String = "created_at",
    val sortOrder: String = "desc",

    // Dialog/Form states
    val isDepositFormVisible: Boolean = false,
    val isWithdrawFormVisible: Boolean = false,
    val editingTransaction: ProfilerTransactionDto? = null,

    // Deposit Form fields
    val depositFormProfileId: Int? = null,
    val depositFormAmount: String = "",
    val depositFormNotes: String = "",

    // Withdraw Form fields
    val withdrawFormProfileId: Int? = null,
    val withdrawFormAmount: String = "",
    val withdrawFormChargesPercentage: String = "",
    val withdrawFormNotes: String = "",

    val formError: String? = null,

    // Autocomplete for Profile
    val profileSearchQuery: String = "",
    val profileSuggestions: List<AutocompleteProfilerProfileDto> = emptyList(),
    val selectedProfile: AutocompleteProfilerProfileDto? = null,
    val showProfileDropdown: Boolean = false,

    // Delete confirmation
    val showDeleteDialog: Boolean = false,
    val transactionToDelete: ProfilerTransactionDto? = null,

    // Sort/Filter dialog
    val showSortDialog: Boolean = false,
    val showFilterDialog: Boolean = false
)

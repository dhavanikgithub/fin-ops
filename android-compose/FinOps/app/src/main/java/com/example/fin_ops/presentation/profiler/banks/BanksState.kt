package com.example.fin_ops.presentation.profiler.banks

import com.example.fin_ops.data.remote.dto.AutocompleteProfilerBankDto
import com.example.fin_ops.data.remote.dto.ProfilerBankDto
import com.example.fin_ops.data.remote.dto.Pagination

data class BanksState(
    val banks: List<ProfilerBankDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",
    val autocompleteSuggestions: List<AutocompleteProfilerBankDto> = emptyList(),

    // Sorting
    val sortBy: String = "bank_name", // "bank_name", "created_at", "profile_count"
    val sortOrder: String = "asc", // "asc" or "desc"

    // Filtering
    val hasProfilesFilter: Boolean? = null, // null = all, true = with profiles, false = without profiles

    // Dialog/Form state
    val isFormVisible: Boolean = false,
    val editingBank: ProfilerBankDto? = null, // null means creating new
    val formBankName: String = "",
    val formError: String? = null,

    // Delete confirmation
    val showDeleteDialog: Boolean = false,
    val bankToDelete: ProfilerBankDto? = null,

    // Sort/Filter dialog
    val showSortDialog: Boolean = false,
    val showFilterDialog: Boolean = false
)
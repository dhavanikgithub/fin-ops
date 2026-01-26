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
    // For Dialog/Form state
    val isFormVisible: Boolean = false,
    val editingBank: ProfilerBankDto? = null // null means creating new
)
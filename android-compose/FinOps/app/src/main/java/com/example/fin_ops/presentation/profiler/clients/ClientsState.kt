package com.example.fin_ops.presentation.profiler.clients

import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem
import com.example.fin_ops.data.remote.dto.Pagination
import com.example.fin_ops.data.remote.dto.ProfilerClientDto

data class ClientsState(
    val clients: List<ProfilerClientDto> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",
    val autocompleteSuggestions: List<AutocompleteProfilerClientItem> = emptyList(),

    // Dialog/Form state
    val isFormVisible: Boolean = false,
    val editingClient: ProfilerClientDto? = null,
    val formName: String = "",
    val formEmail: String = "",
    val formMobile: String = "",
    val formAadhaar: String = "",
    val formNotes: String = "",
    val formError: String? = null,

    // Delete confirmation
    val showDeleteDialog: Boolean = false,
    val clientToDelete: ProfilerClientDto? = null
)

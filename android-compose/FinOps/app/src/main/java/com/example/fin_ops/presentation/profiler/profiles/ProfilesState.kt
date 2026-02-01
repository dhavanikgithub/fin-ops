package com.example.fin_ops.presentation.profiler.profiles

import android.net.Uri
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerBankDto
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem
import com.example.fin_ops.data.remote.dto.Pagination
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto

data class ProfilesState(
    val profiles: List<ProfilerProfileDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",

    // Filter
    val selectedStatus: String? = "active", // null for All, "active", "done"

    // Dashboard mode
    val isDashboardMode: Boolean = false,

    // Dialog/Form state
    val isFormVisible: Boolean = false,
    val editingProfile: ProfilerProfileDto? = null,

    // Form fields
    val formClientId: Int? = null,
    val formBankId: Int? = null,
    val formCreditCard: String = "",
    val formPrePlannedAmount: String = "",
    val formCarryForward: Boolean = false,
    val formNotes: String = "",
    val formError: String? = null,

    // Autocomplete for Client
    val clientSearchQuery: String = "",
    val clientSuggestions: List<AutocompleteProfilerClientItem> = emptyList(),
    val selectedClient: AutocompleteProfilerClientItem? = null,
    val showClientDropdown: Boolean = false,

    // Autocomplete for Bank
    val bankSearchQuery: String = "",
    val bankSuggestions: List<AutocompleteProfilerBankDto> = emptyList(),
    val selectedBank: AutocompleteProfilerBankDto? = null,
    val showBankDropdown: Boolean = false,

    // Delete confirmation
    val showDeleteDialog: Boolean = false,
    val profileToDelete: ProfilerProfileDto? = null,

    // Mark Done confirmation
    val showMarkDoneDialog: Boolean = false,
    val profileToMarkDone: ProfilerProfileDto? = null,

    // Stats
    val totalProfiles: Int = 0,
    val activeProfiles: Int = 0,
    val completedProfiles: Int = 0,
    val totalTransactions: Int = 0,

    // NEW: Permission Handling State
    val showStoragePermissionRequest: Boolean = false,
    val pendingExportProfile: ProfilerProfileDto? = null,

    // Export success tracking (for snackbar)
    val exportSuccess: Boolean = false,
    val exportedFileName: String? = null,
    val exportedFileUri: Uri? = null
)
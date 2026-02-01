package com.example.fin_ops.presentation.ledger.export

import android.net.Uri
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem

enum class TimePeriod(val displayName: String) {
    TODAY("Today"),
    THIS_WEEK("This Week"),
    THIS_MONTH("This Month"),
    DATE_RANGE("Date Range")
}

enum class ExportAction {
    DOWNLOAD_ONLY,
    SHARE_WHATSAPP
}

data class ExportTransactionsState(
    // Time period selection
    val selectedTimePeriod: TimePeriod = TimePeriod.TODAY,

    // Date range (for custom date range)
    val startDate: String = "", // Format: YYYY-MM-DD
    val endDate: String = "",
    val showStartDatePicker: Boolean = false,
    val showEndDatePicker: Boolean = false,

    // Client filter (optional)
    val clientSearchQuery: String = "",
    val clientSuggestions: List<AutocompleteProfilerClientItem> = emptyList(),
    val selectedClient: AutocompleteProfilerClientItem? = null,
    val showClientDropdown: Boolean = false,

    // Export state
    val isExporting: Boolean = false,
    val exportSuccess: Boolean = false,
    val exportError: String? = null,
    val exportedFilename: String? = null,
    val exportedFileUri: Uri? = null,
    val pendingShareToWhatsApp: Boolean = false,

    // Computed dates (for display)
    val displayStartDate: String = "",
    val displayEndDate: String = ""
)

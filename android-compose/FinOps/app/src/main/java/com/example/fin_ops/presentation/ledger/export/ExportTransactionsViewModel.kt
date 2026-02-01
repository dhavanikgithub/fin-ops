package com.example.fin_ops.presentation.ledger.export

import android.Manifest
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.ExportConfig
import com.example.fin_ops.data.local.ExportConfigStorage
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem
import com.example.fin_ops.domain.use_case.client.SearchClientsUseCase
import com.example.fin_ops.domain.use_case.ledger_transaction.GenerateLedgerReportUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

@HiltViewModel
class ExportTransactionsViewModel @Inject constructor(
    private val generateReportUseCase: GenerateLedgerReportUseCase,
    private val searchClientsUseCase: SearchClientsUseCase,
    private val exportConfigStorage: ExportConfigStorage,
    @ApplicationContext private val context: Context,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _state = mutableStateOf(ExportTransactionsState())
    val state: State<ExportTransactionsState> = _state

    private var clientSearchJob: Job? = null

    init {
        // Check for pre-selected config from navigation
        val preSelectedConfig = savedStateHandle.get<String>("config")
        if (preSelectedConfig != null) {
            applyRecentExportFromJson(preSelectedConfig)
        } else {
            updateDatesForTimePeriod(TimePeriod.TODAY)
        }
    }

    fun onEvent(event: ExportTransactionsEvent) {
        when (event) {
            is ExportTransactionsEvent.SelectTimePeriod -> {
                _state.value = _state.value.copy(selectedTimePeriod = event.period)
                updateDatesForTimePeriod(event.period)
            }

            is ExportTransactionsEvent.SetStartDate -> {
                _state.value = _state.value.copy(
                    startDate = event.date,
                    displayStartDate = formatDateForDisplay(event.date),
                    showStartDatePicker = false
                )
            }

            is ExportTransactionsEvent.SetEndDate -> {
                _state.value = _state.value.copy(
                    endDate = event.date,
                    displayEndDate = formatDateForDisplay(event.date),
                    showEndDatePicker = false
                )
            }

            is ExportTransactionsEvent.ShowStartDatePicker -> {
                _state.value = _state.value.copy(showStartDatePicker = event.show)
            }

            is ExportTransactionsEvent.ShowEndDatePicker -> {
                _state.value = _state.value.copy(showEndDatePicker = event.show)
            }

            is ExportTransactionsEvent.SearchClient -> {
                _state.value = _state.value.copy(
                    clientSearchQuery = event.query,
                    showClientDropdown = true
                )
                searchClientDebounced(event.query)
            }

            is ExportTransactionsEvent.SelectClient -> {
                _state.value = _state.value.copy(
                    selectedClient = event.client,
                    clientSearchQuery = event.client.name,
                    showClientDropdown = false,
                    clientSuggestions = emptyList()
                )
            }

            is ExportTransactionsEvent.ClearClient -> {
                _state.value = _state.value.copy(
                    selectedClient = null,
                    clientSearchQuery = "",
                    showClientDropdown = false,
                    clientSuggestions = emptyList()
                )
            }

            // --- EXPORT EVENTS (Updated) ---
            is ExportTransactionsEvent.Export -> {
                checkPermissionAndExport(shareToWhatsApp = false)
            }

            is ExportTransactionsEvent.ExportAndShare -> {
                checkPermissionAndExport(shareToWhatsApp = true)
            }

            // --- PERMISSION RESULT (New) ---
            is ExportTransactionsEvent.StoragePermissionResult -> {
                val wasSharing = _state.value.isShareRequestedForPermission
                _state.value = _state.value.copy(showStoragePermissionRequest = false)

                if (event.isGranted) {
                    // Permission granted, retry the export
                    exportReport(shareToWhatsApp = wasSharing)
                } else {
                    _state.value = _state.value.copy(exportError = "Storage permission denied. Cannot save to Downloads.")
                }
            }


            is ExportTransactionsEvent.OpenPdf -> {
                openPdf()
            }

            is ExportTransactionsEvent.ShareToWhatsApp -> {
                shareToWhatsApp()
            }

            is ExportTransactionsEvent.ClearError -> {
                _state.value = _state.value.copy(exportError = null)
            }

            is ExportTransactionsEvent.ClearSuccess -> {
                _state.value = _state.value.copy(
                    exportSuccess = false,
                    exportedFilename = null,
                    exportedFileUri = null,
                    pendingShareToWhatsApp = false
                )
            }
        }
    }

    // --- Permission Check Logic ---
    private fun checkPermissionAndExport(shareToWhatsApp: Boolean) {
        val currentState = _state.value
        if (currentState.startDate.isEmpty() || currentState.endDate.isEmpty()) {
            _state.value = _state.value.copy(exportError = "Please select valid dates")
            return
        }

        // Android 10+ (Q) does not need storage permissions for MediaStore
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            exportReport(shareToWhatsApp)
        } else {
            // Android 9 and below needs WRITE_EXTERNAL_STORAGE
            val hasPermission = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED

            if (hasPermission) {
                exportReport(shareToWhatsApp)
            } else {
                // Request Permission
                _state.value = _state.value.copy(
                    showStoragePermissionRequest = true,
                    isShareRequestedForPermission = shareToWhatsApp
                )
            }
        }
    }


    private fun updateDatesForTimePeriod(period: TimePeriod) {
        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

        val (startDate, endDate) = when (period) {
            TimePeriod.TODAY -> {
                val today = dateFormat.format(calendar.time)
                today to today
            }
            TimePeriod.THIS_WEEK -> {
                calendar.set(Calendar.DAY_OF_WEEK, calendar.firstDayOfWeek)
                val weekStart = dateFormat.format(calendar.time)
                calendar.add(Calendar.DAY_OF_WEEK, 6)
                val weekEnd = dateFormat.format(calendar.time)
                weekStart to weekEnd
            }
            TimePeriod.THIS_MONTH -> {
                calendar.set(Calendar.DAY_OF_MONTH, 1)
                val monthStart = dateFormat.format(calendar.time)
                calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH))
                val monthEnd = dateFormat.format(calendar.time)
                monthStart to monthEnd
            }
            TimePeriod.DATE_RANGE -> {
                val current = _state.value
                if (current.startDate.isEmpty() || current.endDate.isEmpty()) {
                    val today = dateFormat.format(calendar.time)
                    today to today
                } else {
                    current.startDate to current.endDate
                }
            }
        }

        _state.value = _state.value.copy(
            startDate = startDate,
            endDate = endDate,
            displayStartDate = formatDateForDisplay(startDate),
            displayEndDate = formatDateForDisplay(endDate)
        )
    }

    private fun formatDateForDisplay(date: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            val parsedDate = inputFormat.parse(date)
            parsedDate?.let { outputFormat.format(it) } ?: date
        } catch (e: Exception) {
            date
        }
    }

    private fun searchClientDebounced(query: String) {
        clientSearchJob?.cancel()
        if (query.isBlank()) {
            _state.value = _state.value.copy(clientSuggestions = emptyList())
            return
        }

        clientSearchJob = viewModelScope.launch {
            delay(300L)
            try {
                val suggestions = searchClientsUseCase(query)
                _state.value = _state.value.copy(clientSuggestions = suggestions)
            } catch (e: Exception) {
                _state.value = _state.value.copy(clientSuggestions = emptyList())
            }
        }
    }

    private fun exportReport(shareToWhatsApp: Boolean) {
        val currentState = _state.value

        if (currentState.startDate.isEmpty() || currentState.endDate.isEmpty()) {
            _state.value = _state.value.copy(exportError = "Please select valid dates")
            return
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isExporting = true, exportError = null)
            try {
                val clientId = currentState.selectedClient?.id?.toString()
                val result = generateReportUseCase(
                    startDate = currentState.startDate,
                    endDate = currentState.endDate,
                    clientId = clientId
                )

                val pdfBytes = Base64.decode(result.pdfContent, Base64.DEFAULT)
                val (savedFilename, savedUri) = savePdfToDownloads(pdfBytes, result.filename)

                val config = ExportConfig(
                    timePeriod = currentState.selectedTimePeriod.name.lowercase(),
                    startDate = currentState.startDate,
                    endDate = currentState.endDate,
                    clientId = currentState.selectedClient?.id,
                    clientName = currentState.selectedClient?.name
                )
                exportConfigStorage.saveExportConfig(config)

                _state.value = _state.value.copy(
                    isExporting = false,
                    exportSuccess = true,
                    exportedFilename = savedFilename,
                    exportedFileUri = savedUri,
                    pendingShareToWhatsApp = shareToWhatsApp
                )

                // If share to WhatsApp was requested, trigger share
                if (shareToWhatsApp) {
                    shareToWhatsApp()
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isExporting = false,
                    exportError = e.message ?: "Failed to export report"
                )
            }
        }
    }

    private fun savePdfToDownloads(pdfBytes: ByteArray, filename: String): Pair<String, Uri?> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, filename)
                put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }

            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: throw Exception("Failed to create file in Downloads")

            resolver.openOutputStream(uri)?.use { outputStream ->
                outputStream.write(pdfBytes)
            } ?: throw Exception("Failed to open output stream")

            filename to uri
        } else {
            // --- ANDROID 9 and below (Legacy) ---
            try {
                // 1. Try Public Downloads Folder
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) downloadsDir.mkdirs()

                val file = File(downloadsDir, filename)
                FileOutputStream(file).use { it.write(pdfBytes) }

                val uri = FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.provider",
                    file
                )
                file.name to uri
            } catch (e: Exception) {
                // 2. Fallback to App-Specific storage if permission denied or error
                val fallbackDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                val file = File(fallbackDir, filename)
                FileOutputStream(file).use { it.write(pdfBytes) }

                val uri = FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.provider",
                    file
                )
                file.name to uri
            }
        }
    }

    private fun openPdf() {
        val uri = _state.value.exportedFileUri ?: return

        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            _state.value = _state.value.copy(exportError = "No PDF viewer app found")
        }
    }

    private fun shareToWhatsApp() {
        val uri = _state.value.exportedFileUri ?: return
        val filename = _state.value.exportedFilename ?: "Report"

        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_TEXT, "Transaction Report: $filename")
                setPackage("com.whatsapp")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            // WhatsApp not installed, try generic share
            try {
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_TEXT, "Transaction Report: $filename")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val chooser = Intent.createChooser(shareIntent, "Share Report")
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(chooser)
            } catch (ex: Exception) {
                _state.value = _state.value.copy(exportError = "Failed to share: ${ex.message}")
            }
        }
    }

    private fun applyRecentExportFromJson(json: String) {
        try {
            val parts = json.split("|")
            if (parts.size >= 3) {
                val period = try {
                    TimePeriod.valueOf(parts[0].uppercase())
                } catch (e: Exception) {
                    TimePeriod.DATE_RANGE
                }

                _state.value = _state.value.copy(
                    selectedTimePeriod = period,
                    startDate = parts[1],
                    endDate = parts[2],
                    displayStartDate = formatDateForDisplay(parts[1]),
                    displayEndDate = formatDateForDisplay(parts[2]),
                    selectedClient = if (parts.size >= 5 && parts[3].isNotEmpty()) {
                        AutocompleteProfilerClientItem(
                            id = parts[3].toIntOrNull() ?: 0,
                            name = parts[4],
                            mobileNumber = null,
                            email = null,
                            profileCount = 0
                        )
                    } else null,
                    clientSearchQuery = if (parts.size >= 5) parts[4] else ""
                )
            } else {
                updateDatesForTimePeriod(TimePeriod.TODAY)
            }
        } catch (e: Exception) {
            updateDatesForTimePeriod(TimePeriod.TODAY)
        }
    }
}

// Events
sealed class ExportTransactionsEvent {
    data class SelectTimePeriod(val period: TimePeriod) : ExportTransactionsEvent()
    data class SetStartDate(val date: String) : ExportTransactionsEvent()
    data class SetEndDate(val date: String) : ExportTransactionsEvent()
    data class ShowStartDatePicker(val show: Boolean) : ExportTransactionsEvent()
    data class ShowEndDatePicker(val show: Boolean) : ExportTransactionsEvent()
    data class SearchClient(val query: String) : ExportTransactionsEvent()
    data class SelectClient(val client: AutocompleteProfilerClientItem) : ExportTransactionsEvent()
    object ClearClient : ExportTransactionsEvent()
    object Export : ExportTransactionsEvent()
    object ExportAndShare : ExportTransactionsEvent()
    object OpenPdf : ExportTransactionsEvent()
    object ShareToWhatsApp : ExportTransactionsEvent()
    object ClearError : ExportTransactionsEvent()
    object ClearSuccess : ExportTransactionsEvent()
    // --- NEW EVENT ---
    data class StoragePermissionResult(val isGranted: Boolean) : ExportTransactionsEvent()
}

package com.example.fin_ops.presentation.profiler.profiles

import android.Manifest
import android.app.Application
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.bank.SearchBanksUseCase
import com.example.fin_ops.domain.use_case.client.SearchClientsUseCase
import com.example.fin_ops.domain.use_case.profile.*
import com.example.fin_ops.domain.use_case.transaction.ExportProfilePdfUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import javax.inject.Inject


@HiltViewModel
class ProfilesViewModel @Inject constructor(
    private val getProfilesUseCase: GetProfilesUseCase,
    private val getDashboardUseCase: GetDashboardUseCase,
    private val createProfileUseCase: CreateProfileUseCase,
    private val updateProfileUseCase: UpdateProfileUseCase,
    private val deleteProfileUseCase: DeleteProfileUseCase,
    private val markProfileDoneUseCase: MarkProfileDoneUseCase,
    private val searchBanksUseCase: SearchBanksUseCase,
    private val searchClientsUseCase: SearchClientsUseCase,
    private val exportProfilePdfUseCase: ExportProfilePdfUseCase, // <--- INJECT THIS
    @ApplicationContext private val application: Context,
) : ViewModel() {

    private val _state = mutableStateOf(ProfilesState())
    val state: State<ProfilesState> = _state

    private var searchJob: Job? = null
    private var clientSearchJob: Job? = null
    private var bankSearchJob: Job? = null

    init {
        loadProfiles()
    }

    fun onEvent(event: ProfilesEvent) {
        when (event) {
            is ProfilesEvent.LoadProfiles -> loadProfiles(event.page)

            is ProfilesEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }

            is ProfilesEvent.SelectStatus -> {
                _state.value = _state.value.copy(selectedStatus = event.status)
                loadProfiles(1)
            }

            is ProfilesEvent.ToggleDashboardMode -> {
                _state.value = _state.value.copy(isDashboardMode = event.enabled)
                loadProfiles(1)
            }

            is ProfilesEvent.SaveProfile -> saveProfile()

            is ProfilesEvent.DeleteProfile -> confirmDelete(event.profile)

            is ProfilesEvent.ConfirmDelete -> deleteProfile()

            is ProfilesEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    profileToDelete = null
                )
            }

            is ProfilesEvent.MarkDone -> confirmMarkDone(event.profile)

            is ProfilesEvent.ConfirmMarkDone -> markProfileDone()

            is ProfilesEvent.CancelMarkDone -> {
                _state.value = _state.value.copy(
                    showMarkDoneDialog = false,
                    profileToMarkDone = null
                )
            }

            is ProfilesEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingProfile = event.profileToEdit,
                    formClientId = event.profileToEdit?.clientId,
                    formBankId = event.profileToEdit?.bankId,
                    formCreditCard = event.profileToEdit?.creditCardNumber ?: "",
                    formPrePlannedAmount = event.profileToEdit?.prePlannedDepositAmount ?: "",
                    formCarryForward = event.profileToEdit?.carryForwardEnabled ?: false,
                    formNotes = event.profileToEdit?.notes ?: "",
                    selectedClient = null,
                    selectedBank = null,
                    formError = null
                )
            }

            is ProfilesEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingProfile = null,
                    formClientId = null,
                    formBankId = null,
                    formCreditCard = "",
                    formPrePlannedAmount = "",
                    formCarryForward = false,
                    formNotes = "",
                    selectedClient = null,
                    selectedBank = null,
                    clientSuggestions = emptyList(),
                    bankSuggestions = emptyList(),
                    clientSearchQuery = "",
                    bankSearchQuery = "",
                    showClientDropdown = false,
                    showBankDropdown = false,
                    formError = null
                )
            }

            is ProfilesEvent.UpdateFormCreditCard -> {
                _state.value = _state.value.copy(formCreditCard = event.value, formError = null)
            }

            is ProfilesEvent.UpdateFormPrePlannedAmount -> {
                _state.value = _state.value.copy(formPrePlannedAmount = event.value, formError = null)
            }

            is ProfilesEvent.UpdateFormCarryForward -> {
                _state.value = _state.value.copy(formCarryForward = event.value)
            }

            is ProfilesEvent.UpdateFormNotes -> {
                _state.value = _state.value.copy(formNotes = event.value)
            }

            is ProfilesEvent.SearchClient -> {
                _state.value = _state.value.copy(
                    clientSearchQuery = event.query,
                    showClientDropdown = true,
                    formError = null
                )
                searchClientDebounced(event.query)
            }

            is ProfilesEvent.SelectClient -> {
                _state.value = _state.value.copy(
                    selectedClient = event.client,
                    formClientId = event.client.id,
                    clientSearchQuery = event.client.name,
                    showClientDropdown = false,
                    clientSuggestions = emptyList(),
                    formError = null
                )
            }

            is ProfilesEvent.ClearClientSelection -> {
                _state.value = _state.value.copy(
                    selectedClient = null,
                    formClientId = null,
                    clientSearchQuery = "",
                    showClientDropdown = false,
                    clientSuggestions = emptyList()
                )
            }

            is ProfilesEvent.SearchBank -> {
                _state.value = _state.value.copy(
                    bankSearchQuery = event.query,
                    showBankDropdown = true,
                    formError = null
                )
                searchBankDebounced(event.query)
            }

            is ProfilesEvent.SelectBank -> {
                _state.value = _state.value.copy(
                    selectedBank = event.bank,
                    formBankId = event.bank.id,
                    bankSearchQuery = event.bank.bankName,
                    showBankDropdown = false,
                    bankSuggestions = emptyList(),
                    formError = null
                )
            }

            is ProfilesEvent.ClearBankSelection -> {
                _state.value = _state.value.copy(
                    selectedBank = null,
                    formBankId = null,
                    bankSearchQuery = "",
                    showBankDropdown = false,
                    bankSuggestions = emptyList()
                )
            }

            is ProfilesEvent.RefreshProfiles -> {
                _state.value = _state.value.copy(searchQuery = "")
                loadProfiles(1)
            }

            // --- UPDATED EXPORT LOGIC ---
            is ProfilesEvent.ExportPdf -> {
                checkPermissionAndExport(event.profile)
            }

            // --- NEW: PERMISSION RESULT HANDLER ---
            is ProfilesEvent.StoragePermissionResult -> {
                val pendingProfile = _state.value.pendingExportProfile

                // Reset the trigger flag immediately
                _state.value = _state.value.copy(showStoragePermissionRequest = false)

                if (event.isGranted && pendingProfile != null) {
                    // Permission granted, proceed with export
                    viewModelScope.launch {
                        savePdfToDownloads(pendingProfile)
                    }
                } else if (!event.isGranted) {
                    // Permission denied
                    showToast("Permission denied. Cannot save to Downloads folder.")
                }

                // Clear pending profile after handling
                _state.value = _state.value.copy(pendingExportProfile = null)
            }

            is ProfilesEvent.ShareWhatsapp -> {
                viewModelScope.launch {
                    sharePdf(event.profile)
                }
            }

            is ProfilesEvent.OpenExportedPdf -> {
                _state.value.exportedFileUri?.let { uri ->
                    openFileUri(uri)
                }
            }

            is ProfilesEvent.ClearExportSuccess -> {
                _state.value = _state.value.copy(
                    exportSuccess = false,
                    exportedFileName = null,
                    exportedFileUri = null
                )
            }
        }
    }

    private fun checkPermissionAndExport(profile: ProfilerProfileDto) {
        // Android 10+ (Q) does not need storage permissions for MediaStore
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            viewModelScope.launch {
                savePdfToDownloads(profile)
            }
        } else {
            // Android 9 and below needs WRITE_EXTERNAL_STORAGE
            val hasPermission = ContextCompat.checkSelfPermission(
                application,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED

            if (hasPermission) {
                viewModelScope.launch {
                    savePdfToDownloads(profile)
                }
            } else {
                // Permission not granted, update state to trigger UI request
                _state.value = _state.value.copy(
                    showStoragePermissionRequest = true,
                    pendingExportProfile = profile
                )
            }
        }
    }

    // --- Logic for "Export" (Permanent Save) ---
    private suspend fun savePdfToDownloads(profile: ProfilerProfileDto) {
        try {
            val responseBody = exportProfilePdfUseCase(profile.id)
            val fileName = "Profile_${profile.clientName}_${System.currentTimeMillis()}.pdf"

            withContext(Dispatchers.IO) {
                val inputStream = responseBody.byteStream()

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // ANDROID 10+ (API 29+): Use MediaStore (No Permission Needed)
                    saveToMediaStore(inputStream, fileName)
                } else {
                    // ANDROID 9 (API 28-): Use Legacy Storage
                    saveToLegacyStorage(inputStream, fileName)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _state.value = _state.value.copy(error = "Export failed: ${e.localizedMessage}")
        }
    }

    // Android 10+ Implementation
    @RequiresApi(Build.VERSION_CODES.Q)
    private fun saveToMediaStore(inputStream: InputStream, fileName: String) {
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
        }

        val resolver = application.contentResolver
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)

        uri?.let {
            resolver.openOutputStream(it)?.use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            // Update state for snackbar with Open action
            viewModelScope.launch(Dispatchers.Main) {
                _state.value = _state.value.copy(
                    exportSuccess = true,
                    exportedFileName = fileName,
                    exportedFileUri = it
                )
            }
        } ?: run {
            viewModelScope.launch(Dispatchers.Main) {
                _state.value = _state.value.copy(error = "Failed to create file in MediaStore")
            }
        }
    }

    // Android 9- Implementation
    private fun saveToLegacyStorage(inputStream: InputStream, fileName: String) {
        try {
            // Try standard Downloads folder first
            val targetDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!targetDir.exists()) targetDir.mkdirs()

            val file = File(targetDir, fileName)
            FileOutputStream(file).use { output ->
                inputStream.copyTo(output)
            }

            val uri = getFileUri(file)
            // Update state for snackbar with Open action
            viewModelScope.launch(Dispatchers.Main) {
                _state.value = _state.value.copy(
                    exportSuccess = true,
                    exportedFileName = file.name,
                    exportedFileUri = uri
                )
            }

        } catch (e: SecurityException) {
            // Fallback: If WRITE_EXTERNAL_STORAGE is denied, save to App-Specific directory (No permission needed)
            val fallbackDir = application.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            val file = File(fallbackDir, fileName)
            FileOutputStream(file).use { output ->
                inputStream.copyTo(output)
            }
            val uri = getFileUri(file)
            viewModelScope.launch(Dispatchers.Main) {
                _state.value = _state.value.copy(
                    exportSuccess = true,
                    exportedFileName = file.name,
                    exportedFileUri = uri
                )
            }
        }
    }

    // --- Logic for "Share" (Temporary Cache) ---
    private suspend fun sharePdf(profile: ProfilerProfileDto) {
        try {
            val responseBody = exportProfilePdfUseCase(profile.id)
            val fileName = "Profile_${profile.clientName}_${System.currentTimeMillis()}.pdf"

            // Save to Cache (Works on ALL versions without permission)
            val file = withContext(Dispatchers.IO) {
                val cacheDir = application.externalCacheDir ?: application.cacheDir
                val tempFile = File(cacheDir, fileName)
                FileOutputStream(tempFile).use { output ->
                    responseBody.byteStream().copyTo(output)
                }
                tempFile
            }

            shareFileIntent(file)

        } catch (e: Exception) {
            e.printStackTrace()
            showToast("Share failed: ${e.localizedMessage}")
        }
    }

    // --- Helpers ---

    private fun getFileUri(file: File): Uri {
        return FileProvider.getUriForFile(
            application,
            "${application.packageName}.provider",
            file
        )
    }

    private fun openFileUri(uri: Uri) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/pdf")
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            application.startActivity(intent)
        } catch (e: Exception) {
            showToast("No PDF Viewer app found")
        }
    }

    private fun shareFileIntent(file: File) {
        val uri = getFileUri(file)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_TEXT, "Here is the profile report.")
            setPackage("com.whatsapp") // Target WhatsApp
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
        }

        try {
            application.startActivity(intent)
        } catch (e: Exception) {
            // Fallback if WhatsApp is missing
            val fallback = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
            }
            val chooser = Intent.createChooser(fallback, "Share Report")
            chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            application.startActivity(chooser)
        }
    }

    private fun showToast(message: String) {
        viewModelScope.launch(Dispatchers.Main) {
            Toast.makeText(application, message, Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadProfiles(page: Int = 1) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val result = if (_state.value.isDashboardMode) {
                    getDashboardUseCase(page)
                } else {
                    getProfilesUseCase(
                        page = page,
                        limit = 50,
                        search = _state.value.searchQuery.ifBlank { null },
                        status = _state.value.selectedStatus, // Use selected status from state
                        sortBy = "created_at",
                        sortOrder = "desc"
                    )
                }

                // Calculate stats
                val totalCount = result.pagination.totalCount
                val activeCount = result.data.count { it.status == "active" }
                val completedCount = result.data.count { it.status == "done" }
                val transactionCount = result.data.sumOf { it.transactionCount.toIntOrNull() ?: 0 }

                _state.value = _state.value.copy(
                    isLoading = false,
                    profiles = result.data,
                    pagination = result.pagination,
                    totalProfiles = totalCount,
                    activeProfiles = activeCount,
                    completedProfiles = completedCount,
                    totalTransactions = transactionCount,
                    error = null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load profiles"
                )
            }
        }
    }

    private fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(500L)
            loadProfiles(1)
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

    private fun searchBankDebounced(query: String) {
        bankSearchJob?.cancel()
        if (query.isBlank()) {
            _state.value = _state.value.copy(bankSuggestions = emptyList())
            return
        }

        bankSearchJob = viewModelScope.launch {
            delay(300L)
            try {
                val suggestions = searchBanksUseCase(query)
                _state.value = _state.value.copy(bankSuggestions = suggestions)
            } catch (e: Exception) {
                _state.value = _state.value.copy(bankSuggestions = emptyList())
            }
        }
    }

    private fun saveProfile() {
        val clientId = _state.value.formClientId
        val bankId = _state.value.formBankId
        val creditCard = _state.value.formCreditCard.trim()
        val prePlannedAmount = _state.value.formPrePlannedAmount.trim()
        val carryForward = _state.value.formCarryForward
        val notes = _state.value.formNotes.trim()

        // Validation
        if (clientId == null) {
            _state.value = _state.value.copy(formError = "Please select a client")
            return
        }

        if (bankId == null) {
            _state.value = _state.value.copy(formError = "Please select a bank")
            return
        }

        if (creditCard.isBlank()) {
            _state.value = _state.value.copy(formError = "Credit card number is required")
            return
        }

        if (creditCard.length < 4) {
            _state.value = _state.value.copy(formError = "Credit card number must be at least 4 digits")
            return
        }

        if (prePlannedAmount.isBlank()) {
            _state.value = _state.value.copy(formError = "Pre-planned amount is required")
            return
        }

        val amount = prePlannedAmount.toDoubleOrNull()
        if (amount == null || amount <= 0) {
            _state.value = _state.value.copy(formError = "Please enter a valid amount")
            return
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, formError = null)
            try {
                val editingProfile = _state.value.editingProfile
                if (editingProfile != null) {
                    // Update existing profile
                    val request = UpdateProfilerProfileRequest(
                        id = editingProfile.id,
                        bankId = bankId,
                        creditCardNumber = creditCard,
                        prePlannedDepositAmount = amount,
                        carryForwardEnabled = carryForward,
                        notes = notes.ifBlank { null }
                    )
                    updateProfileUseCase(request)
                } else {
                    // Create new profile
                    val request = CreateProfilerProfileRequest(
                        clientId = clientId,
                        bankId = bankId,
                        creditCardNumber = creditCard,
                        prePlannedDepositAmount = amount,
                        carryForwardEnabled = carryForward,
                        notes = notes.ifBlank { null }
                    )
                    createProfileUseCase(request)
                }

                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingProfile = null,
                    formClientId = null,
                    formBankId = null,
                    formCreditCard = "",
                    formPrePlannedAmount = "",
                    formCarryForward = false,
                    formNotes = "",
                    selectedClient = null,
                    selectedBank = null,
                    formError = null
                )

                loadProfiles(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    formError = e.message ?: "Failed to save profile"
                )
            }
        }
    }

    private fun confirmDelete(profile: ProfilerProfileDto) {
        _state.value = _state.value.copy(
            showDeleteDialog = true,
            profileToDelete = profile
        )
    }

    private fun deleteProfile() {
        val profileToDelete = _state.value.profileToDelete ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                showDeleteDialog = false
            )
            try {
                deleteProfileUseCase(profileToDelete.id)

                _state.value = _state.value.copy(
                    profileToDelete = null
                )

                loadProfiles(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to delete profile",
                    showDeleteDialog = false,
                    profileToDelete = null
                )
            }
        }
    }

    private fun confirmMarkDone(profile: ProfilerProfileDto) {
        _state.value = _state.value.copy(
            showMarkDoneDialog = true,
            profileToMarkDone = profile
        )
    }

    private fun markProfileDone() {
        val profileToMarkDone = _state.value.profileToMarkDone ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                showMarkDoneDialog = false
            )
            try {
                markProfileDoneUseCase(profileToMarkDone.id)

                _state.value = _state.value.copy(
                    profileToMarkDone = null
                )

                loadProfiles(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to mark profile as done",
                    showMarkDoneDialog = false,
                    profileToMarkDone = null
                )
            }
        }
    }
}

// Events sealed class for UI interactions
sealed class ProfilesEvent {
    data class LoadProfiles(val page: Int) : ProfilesEvent()
    data class Search(val query: String) : ProfilesEvent()
    data class SelectStatus(val status: String?) : ProfilesEvent() // null for All, "active", "done"
    data class ToggleDashboardMode(val enabled: Boolean) : ProfilesEvent()
    object SaveProfile : ProfilesEvent()
    data class DeleteProfile(val profile: ProfilerProfileDto) : ProfilesEvent()
    object ConfirmDelete : ProfilesEvent()
    object CancelDelete : ProfilesEvent()
    data class MarkDone(val profile: ProfilerProfileDto) : ProfilesEvent()
    object ConfirmMarkDone : ProfilesEvent()
    object CancelMarkDone : ProfilesEvent()
    data class OpenForm(val profileToEdit: ProfilerProfileDto? = null) : ProfilesEvent()
    object CloseForm : ProfilesEvent()
    data class UpdateFormCreditCard(val value: String) : ProfilesEvent()
    data class UpdateFormPrePlannedAmount(val value: String) : ProfilesEvent()
    data class UpdateFormCarryForward(val value: Boolean) : ProfilesEvent()
    data class UpdateFormNotes(val value: String) : ProfilesEvent()
    data class SearchClient(val query: String) : ProfilesEvent()
    data class SelectClient(val client: com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem) : ProfilesEvent()
    object ClearClientSelection : ProfilesEvent()
    data class SearchBank(val query: String) : ProfilesEvent()
    data class SelectBank(val bank: com.example.fin_ops.data.remote.dto.AutocompleteProfilerBankDto) : ProfilesEvent()
    object ClearBankSelection : ProfilesEvent()
    object RefreshProfiles : ProfilesEvent()

    data class ExportPdf(val profile: ProfilerProfileDto) : ProfilesEvent()
    data class ShareWhatsapp(val profile: ProfilerProfileDto) : ProfilesEvent()
    // NEW: Handle Permission Result
    data class StoragePermissionResult(val isGranted: Boolean) : ProfilesEvent()
    // Export success handling
    object OpenExportedPdf : ProfilesEvent()
    object ClearExportSuccess : ProfilesEvent()
}

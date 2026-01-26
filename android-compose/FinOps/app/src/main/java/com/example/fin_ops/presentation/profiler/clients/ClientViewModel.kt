package com.example.fin_ops.presentation.profiler.clients

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.client.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientItem
import com.example.fin_ops.data.remote.dto.Pagination
import com.example.fin_ops.data.remote.dto.ProfilerClientDto

data class ClientsState(
    val clients: List<ProfilerClientDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",
    val autocompleteSuggestions: List<AutocompleteProfilerClientItem> = emptyList(),

    // Sorting
    val sortBy: String = "name", // "name", "created_at", "profile_count"
    val sortOrder: String = "asc", // "asc" or "desc"

    // Filtering
    val hasProfilesFilter: Boolean? = null, // null = all, true = with profiles, false = without profiles

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
    val clientToDelete: ProfilerClientDto? = null,

    // Sort/Filter dialog
    val showSortDialog: Boolean = false,
    val showFilterDialog: Boolean = false
)
@HiltViewModel
class ClientsViewModel @Inject constructor(
    private val getClientsUseCase: GetClientsUseCase,
    private val createClientUseCase: CreateClientUseCase,
    private val updateClientUseCase: UpdateClientUseCase,
    private val deleteClientUseCase: DeleteClientUseCase,
    private val searchClientsUseCase: SearchClientsUseCase
) : ViewModel() {

    private val _state = mutableStateOf(ClientsState())
    val state: State<ClientsState> = _state

    private var searchJob: Job? = null

    init {
        loadClients()
    }

    fun onEvent(event: ClientsEvent) {
        when (event) {
            is ClientsEvent.LoadClients -> loadClients(event.page)

            is ClientsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }

            is ClientsEvent.SaveClient -> saveClient()

            is ClientsEvent.DeleteClient -> confirmDelete(event.client)

            is ClientsEvent.ConfirmDelete -> deleteClient()

            is ClientsEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    clientToDelete = null
                )
            }

            is ClientsEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingClient = event.clientToEdit,
                    formName = event.clientToEdit?.name ?: "",
                    formEmail = event.clientToEdit?.email ?: "",
                    formMobile = event.clientToEdit?.mobileNumber ?: "",
                    formAadhaar = event.clientToEdit?.aadhaarCardNumber ?: "",
                    formNotes = event.clientToEdit?.notes ?: "",
                    formError = null
                )
            }

            is ClientsEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingClient = null,
                    formName = "",
                    formEmail = "",
                    formMobile = "",
                    formAadhaar = "",
                    formNotes = "",
                    formError = null
                )
            }

            is ClientsEvent.UpdateFormName -> {
                _state.value = _state.value.copy(formName = event.value, formError = null)
            }

            is ClientsEvent.UpdateFormEmail -> {
                _state.value = _state.value.copy(formEmail = event.value, formError = null)
            }

            is ClientsEvent.UpdateFormMobile -> {
                _state.value = _state.value.copy(formMobile = event.value, formError = null)
            }

            is ClientsEvent.UpdateFormAadhaar -> {
                _state.value = _state.value.copy(formAadhaar = event.value, formError = null)
            }

            is ClientsEvent.UpdateFormNotes -> {
                _state.value = _state.value.copy(formNotes = event.value, formError = null)
            }

            is ClientsEvent.ChangeSortBy -> {
                val newSortBy = event.sortBy
                val newSortOrder = if (_state.value.sortBy == newSortBy) {
                    if (_state.value.sortOrder == "asc") "desc" else "asc"
                } else {
                    "asc"
                }
                _state.value = _state.value.copy(
                    sortBy = newSortBy,
                    sortOrder = newSortOrder,
                    showSortDialog = false
                )
                loadClients(1)
            }

            is ClientsEvent.ApplyFilter -> {
                _state.value = _state.value.copy(
                    hasProfilesFilter = event.hasProfiles,
                    showFilterDialog = false
                )
                loadClients(1)
            }

            is ClientsEvent.ClearFilters -> {
                _state.value = _state.value.copy(
                    hasProfilesFilter = null,
                    showFilterDialog = false
                )
                loadClients(1)
            }

            is ClientsEvent.ShowSortDialog -> {
                _state.value = _state.value.copy(showSortDialog = event.show)
            }

            is ClientsEvent.ShowFilterDialog -> {
                _state.value = _state.value.copy(showFilterDialog = event.show)
            }

            is ClientsEvent.RefreshClients -> {
                _state.value = _state.value.copy(searchQuery = "")
                loadClients(1)
            }
        }
    }

    private fun loadClients(page: Int = 1) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val result = getClientsUseCase(
                    page = page,
                    limit = 50,
                    search = _state.value.searchQuery.ifBlank { null },
                    hasProfiles = _state.value.hasProfilesFilter,
                    sortBy = _state.value.sortBy,
                    sortOrder = _state.value.sortOrder
                )
                _state.value = _state.value.copy(
                    isLoading = false,
                    clients = result.data,
                    pagination = result.pagination,
                    error = null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load clients"
                )
            }
        }
    }

    private fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(500L)
            if (query.isBlank()) {
                loadClients(1)
                _state.value = _state.value.copy(autocompleteSuggestions = emptyList())
                return@launch
            }

            loadClients(1)

            try {
                val suggestions = searchClientsUseCase(query)
                _state.value = _state.value.copy(autocompleteSuggestions = suggestions)
            } catch (e: Exception) {
                _state.value = _state.value.copy(autocompleteSuggestions = emptyList())
            }
        }
    }

    private fun saveClient() {
        val name = _state.value.formName.trim()
        val email = _state.value.formEmail.trim()
        val mobile = _state.value.formMobile.trim()
        val aadhaar = _state.value.formAadhaar.trim()
        val notes = _state.value.formNotes.trim()

        // Validation
        if (name.isBlank()) {
            _state.value = _state.value.copy(formError = "Name is required")
            return
        }

        if (name.length < 2) {
            _state.value = _state.value.copy(formError = "Name must be at least 2 characters")
            return
        }

        if (email.isBlank()) {
            _state.value = _state.value.copy(formError = "Email is required")
            return
        }

        if (!isValidEmail(email)) {
            _state.value = _state.value.copy(formError = "Invalid email format")
            return
        }

        if (mobile.isBlank()) {
            _state.value = _state.value.copy(formError = "Mobile number is required")
            return
        }

        if (mobile.length < 10) {
            _state.value = _state.value.copy(formError = "Mobile number must be at least 10 digits")
            return
        }

        if (aadhaar.isNotBlank() && aadhaar.length != 12) {
            _state.value = _state.value.copy(formError = "Aadhaar must be 12 digits")
            return
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, formError = null)
            try {
                val editingClient = _state.value.editingClient
                if (editingClient != null) {
                    // Update existing client
                    val request = UpdateProfilerClientRequest(
                        id = editingClient.id,
                        name = name,
                        email = email,
                        mobileNumber = mobile,
                        aadhaarCardNumber = aadhaar.ifBlank { null },
                        aadhaarCardImage = null,
                        notes = notes.ifBlank { null }
                    )
                    updateClientUseCase(request)
                } else {
                    // Create new client
                    val request = CreateProfilerClientRequest(
                        name = name,
                        email = email,
                        mobileNumber = mobile,
                        aadhaarCardNumber = aadhaar.ifBlank { null },
                        aadhaarCardImage = null,
                        notes = notes.ifBlank { null }
                    )
                    createClientUseCase(request)
                }

                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingClient = null,
                    formName = "",
                    formEmail = "",
                    formMobile = "",
                    formAadhaar = "",
                    formNotes = "",
                    formError = null
                )

                loadClients(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    formError = e.message ?: "Failed to save client"
                )
            }
        }
    }

    private fun confirmDelete(client: ProfilerClientDto) {
        _state.value = _state.value.copy(
            showDeleteDialog = true,
            clientToDelete = client
        )
    }

    private fun deleteClient() {
        val clientToDelete = _state.value.clientToDelete ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                showDeleteDialog = false
            )
            try {
                deleteClientUseCase(clientToDelete.id)

                _state.value = _state.value.copy(
                    clientToDelete = null
                )

                loadClients(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to delete client",
                    showDeleteDialog = false,
                    clientToDelete = null
                )
            }
        }
    }

    private fun isValidEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".")
    }
}

// Events sealed class for UI interactions
sealed class ClientsEvent {
    data class LoadClients(val page: Int) : ClientsEvent()
    data class Search(val query: String) : ClientsEvent()
    object SaveClient : ClientsEvent()
    data class DeleteClient(val client: ProfilerClientDto) : ClientsEvent()
    object ConfirmDelete : ClientsEvent()
    object CancelDelete : ClientsEvent()
    data class OpenForm(val clientToEdit: ProfilerClientDto? = null) : ClientsEvent()
    object CloseForm : ClientsEvent()
    data class UpdateFormName(val value: String) : ClientsEvent()
    data class UpdateFormEmail(val value: String) : ClientsEvent()
    data class UpdateFormMobile(val value: String) : ClientsEvent()
    data class UpdateFormAadhaar(val value: String) : ClientsEvent()
    data class UpdateFormNotes(val value: String) : ClientsEvent()
    data class ChangeSortBy(val sortBy: String) : ClientsEvent()
    data class ApplyFilter(val hasProfiles: Boolean?) : ClientsEvent()
    object ClearFilters : ClientsEvent()
    data class ShowSortDialog(val show: Boolean) : ClientsEvent()
    data class ShowFilterDialog(val show: Boolean) : ClientsEvent()
    object RefreshClients : ClientsEvent()
}
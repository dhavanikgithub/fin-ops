package com.example.fin_ops.presentation.ledger.clients

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.ledger_client.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LedgerClientsState(
    val clients: List<LedgerClientDto> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val pagination: LedgerClientPagination? = null,
    val searchQuery: String = "",

    // Form State
    val isFormVisible: Boolean = false,
    val editingClient: LedgerClientDto? = null,
    val formName: String = "",
    val formEmail: String = "",
    val formContact: String = "",
    val formAddress: String = "",
    val formError: String? = null,

    // Delete Confirmation
    val showDeleteDialog: Boolean = false,
    val clientToDelete: LedgerClientDto? = null
)

sealed class LedgerClientsEvent {
    object LoadNextPage : LedgerClientsEvent()
    data class Search(val query: String) : LedgerClientsEvent()
    data class DeleteClient(val client: LedgerClientDto) : LedgerClientsEvent()
    object ConfirmDelete : LedgerClientsEvent()
    object CancelDelete : LedgerClientsEvent()
    object SaveClient : LedgerClientsEvent()
    data class OpenForm(val clientToEdit: LedgerClientDto? = null) : LedgerClientsEvent()
    object CloseForm : LedgerClientsEvent()
    data class UpdateFormName(val name: String) : LedgerClientsEvent()
    data class UpdateFormEmail(val email: String) : LedgerClientsEvent()
    data class UpdateFormContact(val contact: String) : LedgerClientsEvent()
    data class UpdateFormAddress(val address: String) : LedgerClientsEvent()
    object RefreshClients : LedgerClientsEvent()
}

@HiltViewModel
class LedgerClientsViewModel @Inject constructor(
    private val getClientsUseCase: GetLedgerClientsUseCase,
    private val createClientUseCase: CreateLedgerClientUseCase,
    private val updateClientUseCase: UpdateLedgerClientUseCase,
    private val deleteClientUseCase: DeleteLedgerClientUseCase
) : ViewModel() {

    private val _state = mutableStateOf(LedgerClientsState())
    val state: State<LedgerClientsState> = _state
    private var searchJob: Job? = null

    init {
        loadClients()
    }

    fun onEvent(event: LedgerClientsEvent) {
        when (event) {
            is LedgerClientsEvent.LoadNextPage -> {
                val pagination = state.value.pagination
                if (pagination != null &&
                    pagination.hasNextPage &&
                    !state.value.isLoading &&
                    !state.value.isLoadingMore
                ) {
                    loadClients(pagination.currentPage + 1, append = true)
                }
            }

            is LedgerClientsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch {
                    delay(500) // Debounce
                    loadClients(1)
                }
            }

            is LedgerClientsEvent.DeleteClient -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = true,
                    clientToDelete = event.client
                )
            }

            is LedgerClientsEvent.ConfirmDelete -> {
                state.value.clientToDelete?.let { client ->
                    viewModelScope.launch {
                        try {
                            deleteClientUseCase(client.id)
                            _state.value = _state.value.copy(
                                showDeleteDialog = false,
                                clientToDelete = null
                            )
                            loadClients()
                        } catch (e: Exception) {
                            _state.value = _state.value.copy(
                                error = e.message,
                                showDeleteDialog = false,
                                clientToDelete = null
                            )
                        }
                    }
                }
            }

            is LedgerClientsEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    clientToDelete = null
                )
            }

            is LedgerClientsEvent.SaveClient -> {
                val name = state.value.formName.trim()
                val email = state.value.formEmail.trim()
                val contact = state.value.formContact.trim()
                val address = state.value.formAddress.trim()

                // Validation
                if (name.isBlank()) {
                    _state.value = _state.value.copy(formError = "Client name cannot be empty")
                    return
                }

                viewModelScope.launch {
                    try {
                        if (state.value.editingClient != null) {
                            // Update existing client
                            val updateReq = UpdateLedgerClientRequest(
                                id = state.value.editingClient!!.id,
                                name = name,
                                email = email.ifBlank { null },
                                contact = contact.ifBlank { null },
                                address = address.ifBlank { null }
                            )
                            updateClientUseCase(updateReq)
                        } else {
                            // Create new client
                            val createReq = CreateLedgerClientRequest(
                                name = name,
                                email = email.ifBlank { null },
                                contact = contact.ifBlank { null },
                                address = address.ifBlank { null }
                            )
                            createClientUseCase(createReq)
                        }
                        _state.value = _state.value.copy(
                            isFormVisible = false,
                            editingClient = null,
                            formName = "",
                            formEmail = "",
                            formContact = "",
                            formAddress = "",
                            formError = null
                        )
                        loadClients()
                    } catch (e: Exception) {
                        _state.value = _state.value.copy(formError = e.message)
                    }
                }
            }

            is LedgerClientsEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingClient = event.clientToEdit,
                    formName = event.clientToEdit?.name ?: "",
                    formEmail = event.clientToEdit?.email ?: "",
                    formContact = event.clientToEdit?.contact ?: "",
                    formAddress = event.clientToEdit?.address ?: "",
                    formError = null
                )
            }

            is LedgerClientsEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingClient = null,
                    formName = "",
                    formEmail = "",
                    formContact = "",
                    formAddress = "",
                    formError = null
                )
            }

            is LedgerClientsEvent.UpdateFormName -> {
                _state.value = _state.value.copy(
                    formName = event.name,
                    formError = null
                )
            }

            is LedgerClientsEvent.UpdateFormEmail -> {
                _state.value = _state.value.copy(formEmail = event.email)
            }

            is LedgerClientsEvent.UpdateFormContact -> {
                _state.value = _state.value.copy(formContact = event.contact)
            }

            is LedgerClientsEvent.UpdateFormAddress -> {
                _state.value = _state.value.copy(formAddress = event.address)
            }

            is LedgerClientsEvent.RefreshClients -> loadClients()
        }
    }

    private fun loadClients(page: Int = 1, append: Boolean = false) {
        viewModelScope.launch {
            // Show appropriate loading indicator
            if (append) {
                _state.value = _state.value.copy(isLoadingMore = true, error = null)
            } else {
                _state.value = _state.value.copy(isLoading = true, error = null)
            }

            try {
                val result = getClientsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = "name",
                    sortOrder = "asc"
                )

                val newClients = if (append) {
                    _state.value.clients + result.data
                } else {
                    result.data
                }

                _state.value = _state.value.copy(
                    clients = newClients,
                    pagination = result.pagination,
                    isLoading = false,
                    isLoadingMore = false,
                    error = null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    isLoadingMore = false,
                    error = e.message
                )
            }
        }
    }
}

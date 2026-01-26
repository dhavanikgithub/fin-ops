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
    val error: String? = null,
    val pagination: LedgerClientPagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val currentSortBy: String = "name",
    val currentSortOrder: String = "asc",
    val isFormVisible: Boolean = false,
    val editingClient: LedgerClientDto? = null
)

sealed class LedgerClientsEvent {
    data class LoadPage(val page: Int) : LedgerClientsEvent()
    data class Search(val query: String) : LedgerClientsEvent()
    data class ChangeSort(val sortBy: String) : LedgerClientsEvent()
    data class DeleteClient(val id: Int) : LedgerClientsEvent()
    data class SaveClient(val createReq: CreateLedgerClientRequest?, val updateReq: UpdateLedgerClientRequest?) : LedgerClientsEvent()
    data class OpenForm(val client: LedgerClientDto? = null) : LedgerClientsEvent()
    object CloseForm : LedgerClientsEvent()
    object Refresh : LedgerClientsEvent()
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
            is LedgerClientsEvent.LoadPage -> loadClients(page = event.page)
            is LedgerClientsEvent.Refresh -> loadClients()
            is LedgerClientsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadClients(1) }
            }
            is LedgerClientsEvent.ChangeSort -> {
                val newOrder = if (state.value.currentSortBy == event.sortBy) toggleOrder(state.value.currentSortOrder) else "asc"
                _state.value = _state.value.copy(currentSortBy = event.sortBy, currentSortOrder = newOrder)
                loadClients(1)
            }
            is LedgerClientsEvent.DeleteClient -> performAction { deleteClientUseCase(event.id) }
            is LedgerClientsEvent.SaveClient -> performAction {
                if (event.updateReq != null) updateClientUseCase(event.updateReq)
                else if (event.createReq != null) createClientUseCase(event.createReq)
                _state.value = _state.value.copy(isFormVisible = false, editingClient = null)
            }
            is LedgerClientsEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingClient = event.client)
            is LedgerClientsEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingClient = null)
        }
    }

    private fun loadClients(page: Int = _state.value.currentPage) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = getClientsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = _state.value.currentSortBy,
                    sortOrder = _state.value.currentSortOrder
                )
                _state.value = _state.value.copy(
                    clients = result.data,
                    pagination = result.pagination,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun performAction(action: suspend () -> Unit) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try { action(); loadClients() }
            catch (e: Exception) { _state.value = _state.value.copy(isLoading = false, error = e.message) }
        }
    }

    private fun toggleOrder(order: String) = if (order == "asc") "desc" else "asc"
}
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

data class ClientsState(
    val clients: List<ProfilerClientDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val currentSortBy: String = "name",
    val currentSortOrder: String = "asc",
    // Form State
    val isFormVisible: Boolean = false,
    val editingClient: ProfilerClientDto? = null
)

sealed class ClientsEvent {
    data class LoadPage(val page: Int) : ClientsEvent()
    data class Search(val query: String) : ClientsEvent()
    data class ChangeSort(val sortBy: String) : ClientsEvent()
    data class DeleteClient(val id: Int) : ClientsEvent()
    data class SaveClient(val createReq: CreateProfilerClientRequest?, val updateReq: UpdateProfilerClientRequest?) : ClientsEvent()
    data class OpenForm(val client: ProfilerClientDto? = null) : ClientsEvent() // Null for Create, Object for Edit
    object CloseForm : ClientsEvent()
    object Refresh : ClientsEvent()
}

@HiltViewModel
class ClientsViewModel @Inject constructor(
    private val getClientsUseCase: GetClientsUseCase,
    private val createClientUseCase: CreateClientUseCase,
    private val updateClientUseCase: UpdateClientUseCase,
    private val deleteClientUseCase: DeleteClientUseCase
) : ViewModel() {

    private val _state = mutableStateOf(ClientsState())
    val state: State<ClientsState> = _state
    private var searchJob: Job? = null

    init {
        loadClients()
    }

    fun onEvent(event: ClientsEvent) {
        when (event) {
            is ClientsEvent.LoadPage -> loadClients(page = event.page)
            is ClientsEvent.Refresh -> loadClients()
            is ClientsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadClients(1) }
            }
            is ClientsEvent.ChangeSort -> {
                val newOrder = if (state.value.currentSortBy == event.sortBy) toggleOrder(state.value.currentSortOrder) else "asc"
                _state.value = _state.value.copy(currentSortBy = event.sortBy, currentSortOrder = newOrder)
                loadClients(1)
            }
            is ClientsEvent.DeleteClient -> performAction { deleteClientUseCase(event.id) }
            is ClientsEvent.SaveClient -> performAction {
                if (event.updateReq != null) updateClientUseCase(event.updateReq)
                else if (event.createReq != null) createClientUseCase(event.createReq)
                _state.value = _state.value.copy(isFormVisible = false)
            }
            is ClientsEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingClient = event.client)
            is ClientsEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingClient = null)
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
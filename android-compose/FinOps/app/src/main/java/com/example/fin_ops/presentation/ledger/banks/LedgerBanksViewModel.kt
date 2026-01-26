package com.example.fin_ops.presentation.ledger.banks

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.LedgerBankDto
import com.example.fin_ops.data.remote.dto.LedgerBankPagination
import com.example.fin_ops.domain.use_case.ledger_bank.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LedgerBanksState(
    val banks: List<LedgerBankDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: LedgerBankPagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val currentSortBy: String = "name",
    val currentSortOrder: String = "asc",
    // Form State
    val isFormVisible: Boolean = false,
    val editingBank: LedgerBankDto? = null // Null for Create, Object for Edit
)

sealed class LedgerBanksEvent {
    data class LoadPage(val page: Int) : LedgerBanksEvent()
    data class Search(val query: String) : LedgerBanksEvent()
    data class ChangeSort(val sortBy: String) : LedgerBanksEvent()
    data class DeleteBank(val id: Int) : LedgerBanksEvent()
    data class SaveBank(val name: String) : LedgerBanksEvent() // Create or Update based on state
    data class OpenForm(val bank: LedgerBankDto? = null) : LedgerBanksEvent()
    object CloseForm : LedgerBanksEvent()
    object Refresh : LedgerBanksEvent()
}

@HiltViewModel
class LedgerBanksViewModel @Inject constructor(
    private val getBanksUseCase: GetLedgerBanksUseCase,
    private val createBankUseCase: CreateLedgerBankUseCase,
    private val updateBankUseCase: UpdateLedgerBankUseCase,
    private val deleteBankUseCase: DeleteLedgerBankUseCase
) : ViewModel() {

    private val _state = mutableStateOf(LedgerBanksState())
    val state: State<LedgerBanksState> = _state
    private var searchJob: Job? = null

    init {
        loadBanks()
    }

    fun onEvent(event: LedgerBanksEvent) {
        when (event) {
            is LedgerBanksEvent.LoadPage -> loadBanks(page = event.page)
            is LedgerBanksEvent.Refresh -> loadBanks()
            is LedgerBanksEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadBanks(1) }
            }
            is LedgerBanksEvent.ChangeSort -> {
                val newOrder = if (state.value.currentSortBy == event.sortBy) toggleOrder(state.value.currentSortOrder) else "asc"
                _state.value = _state.value.copy(currentSortBy = event.sortBy, currentSortOrder = newOrder)
                loadBanks(1)
            }
            is LedgerBanksEvent.DeleteBank -> performAction { deleteBankUseCase(event.id) }
            is LedgerBanksEvent.SaveBank -> performAction {
                if (state.value.editingBank != null) {
                    updateBankUseCase(state.value.editingBank!!.id, event.name)
                } else {
                    createBankUseCase(event.name)
                }
                _state.value = _state.value.copy(isFormVisible = false, editingBank = null)
            }
            is LedgerBanksEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingBank = event.bank)
            is LedgerBanksEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingBank = null)
        }
    }

    private fun loadBanks(page: Int = _state.value.currentPage) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = getBanksUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = _state.value.currentSortBy,
                    sortOrder = _state.value.currentSortOrder
                )
                _state.value = _state.value.copy(
                    banks = result.data,
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
            try { action(); loadBanks() }
            catch (e: Exception) { _state.value = _state.value.copy(isLoading = false, error = e.message) }
        }
    }

    private fun toggleOrder(order: String) = if (order == "asc") "desc" else "asc"
}
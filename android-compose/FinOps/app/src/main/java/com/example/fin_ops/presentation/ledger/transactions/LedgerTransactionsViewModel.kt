package com.example.fin_ops.presentation.ledger.transactions

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.ledger_transaction.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LedgerTransactionsState(
    val transactions: List<LedgerTransactionDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: LedgerTransactionPagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val filterType: Int? = null, // 0=Withdraw, 1=Deposit
    val currentSortBy: String = "create_date",
    val currentSortOrder: String = "desc",
    val isFormVisible: Boolean = false,
    val editingTransaction: LedgerTransactionDto? = null
)

sealed class LedgerTransactionsEvent {
    data class LoadPage(val page: Int) : LedgerTransactionsEvent()
    data class Search(val query: String) : LedgerTransactionsEvent()
    data class FilterByType(val type: Int?) : LedgerTransactionsEvent()
    data class DeleteTransaction(val id: Int) : LedgerTransactionsEvent()
    data class SaveTransaction(val createReq: CreateLedgerTransactionRequest?, val updateReq: UpdateLedgerTransactionRequest?) : LedgerTransactionsEvent()
    data class OpenForm(val transaction: LedgerTransactionDto? = null) : LedgerTransactionsEvent()
    object CloseForm : LedgerTransactionsEvent()
    object Refresh : LedgerTransactionsEvent()
}

@HiltViewModel
class LedgerTransactionsViewModel @Inject constructor(
    private val getTransactionsUseCase: GetLedgerTransactionsUseCase,
    private val createTransactionUseCase: CreateLedgerTransactionUseCase,
    private val updateTransactionUseCase: UpdateLedgerTransactionUseCase,
    private val deleteTransactionUseCase: DeleteLedgerTransactionUseCase
) : ViewModel() {

    private val _state = mutableStateOf(LedgerTransactionsState())
    val state: State<LedgerTransactionsState> = _state
    private var searchJob: Job? = null

    init {
        loadTransactions()
    }

    fun onEvent(event: LedgerTransactionsEvent) {
        when (event) {
            is LedgerTransactionsEvent.LoadPage -> loadTransactions(page = event.page)
            is LedgerTransactionsEvent.Refresh -> loadTransactions()
            is LedgerTransactionsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadTransactions(1) }
            }
            is LedgerTransactionsEvent.FilterByType -> {
                _state.value = _state.value.copy(filterType = event.type, currentPage = 1)
                loadTransactions()
            }
            is LedgerTransactionsEvent.DeleteTransaction -> performAction { deleteTransactionUseCase(event.id) }
            is LedgerTransactionsEvent.SaveTransaction -> performAction {
                if (event.updateReq != null) updateTransactionUseCase(event.updateReq)
                else if (event.createReq != null) createTransactionUseCase(event.createReq)
                _state.value = _state.value.copy(isFormVisible = false)
            }
            is LedgerTransactionsEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingTransaction = event.transaction)
            is LedgerTransactionsEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingTransaction = null)
        }
    }

    private fun loadTransactions(page: Int = _state.value.currentPage) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = getTransactionsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    type = _state.value.filterType,
                    sortBy = _state.value.currentSortBy,
                    sortOrder = _state.value.currentSortOrder
                )
                _state.value = _state.value.copy(
                    transactions = result.data,
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
            try { action(); loadTransactions() }
            catch (e: Exception) { _state.value = _state.value.copy(isLoading = false, error = e.message) }
        }
    }
}
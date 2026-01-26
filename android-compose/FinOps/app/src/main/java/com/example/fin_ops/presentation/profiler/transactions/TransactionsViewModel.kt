package com.example.fin_ops.presentation.profiler.transactions

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.transaction.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransactionsState(
    val transactions: List<ProfilerTransactionDto> = emptyList(),
    val summary: TransactionSummary? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val searchQuery: String = "",
    val filterType: String? = null, // "deposit" or "withdraw"
    val currentPage: Int = 1,
    // Form States
    val isDepositFormOpen: Boolean = false,
    val isWithdrawFormOpen: Boolean = false
)

sealed class TransactionsEvent {
    data class LoadPage(val page: Int) : TransactionsEvent()
    data class Search(val query: String) : TransactionsEvent()
    data class FilterByType(val type: String?) : TransactionsEvent() // null for All
    data class CreateDeposit(val req: CreateDepositRequest) : TransactionsEvent()
    data class CreateWithdraw(val req: CreateWithdrawRequest) : TransactionsEvent()
    data class DeleteTransaction(val id: Int) : TransactionsEvent()
    object Refresh : TransactionsEvent()
}

@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val getTransactionsUseCase: GetTransactionsUseCase,
    private val createDepositUseCase: CreateDepositUseCase,
    private val createWithdrawUseCase: CreateWithdrawUseCase,
    private val deleteTransactionUseCase: DeleteTransactionUseCase
) : ViewModel() {

    private val _state = mutableStateOf(TransactionsState())
    val state: State<TransactionsState> = _state
    private var searchJob: Job? = null

    init {
        loadTransactions()
    }

    fun onEvent(event: TransactionsEvent) {
        when (event) {
            is TransactionsEvent.LoadPage -> loadTransactions(page = event.page)
            is TransactionsEvent.Refresh -> loadTransactions()
            is TransactionsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadTransactions(1) }
            }
            is TransactionsEvent.FilterByType -> {
                _state.value = _state.value.copy(filterType = event.type, currentPage = 1)
                loadTransactions()
            }
            is TransactionsEvent.DeleteTransaction -> performAction { deleteTransactionUseCase(event.id) }
            is TransactionsEvent.CreateDeposit -> performAction {
                createDepositUseCase(event.req)
                _state.value = _state.value.copy(isDepositFormOpen = false)
            }
            is TransactionsEvent.CreateWithdraw -> performAction {
                createWithdrawUseCase(event.req)
                _state.value = _state.value.copy(isWithdrawFormOpen = false)
            }
        }
    }

    private fun loadTransactions(page: Int = _state.value.currentPage) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = getTransactionsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    transactionType = _state.value.filterType
                )
                _state.value = _state.value.copy(
                    transactions = result.data,
                    summary = result.summary,
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
            try {
                action()
                loadTransactions()
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }
}
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
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val pagination: LedgerTransactionPagination? = null,
    val searchQuery: String = "",

    // Filter Tabs
    val selectedTab: String = "Today", // All, Today, Yesterday, This Week, This Month
    val selectedType: String = "All", // All, Deposit, Withdrawal

    // Form State
    val isFormVisible: Boolean = false,
    val editingTransaction: LedgerTransactionDto? = null,
    val formClientId: String = "",
    val formTransactionType: Int = 1, // 1=Deposit, 0=Withdrawal
    val formAmount: String = "",
    val formWithdrawCharges: String = "",
    val formBankId: String = "",
    val formCardId: String = "",
    val formRemark: String = "",
    val formError: String? = null,

    // Delete Confirmation
    val showDeleteDialog: Boolean = false,
    val transactionToDelete: LedgerTransactionDto? = null,

    // Export
    val isExporting: Boolean = false,
    val exportedPdfPath: String? = null,
    val showExportDialog: Boolean = false
)

sealed class LedgerTransactionsEvent {
    object LoadNextPage : LedgerTransactionsEvent()
    data class Search(val query: String) : LedgerTransactionsEvent()
    data class SelectTab(val tab: String) : LedgerTransactionsEvent()
    data class SelectType(val type: String) : LedgerTransactionsEvent()
    data class DeleteTransaction(val transaction: LedgerTransactionDto) : LedgerTransactionsEvent()
    object ConfirmDelete : LedgerTransactionsEvent()
    object CancelDelete : LedgerTransactionsEvent()
    object SaveTransaction : LedgerTransactionsEvent()
    data class OpenForm(val transactionToEdit: LedgerTransactionDto? = null) : LedgerTransactionsEvent()
    object CloseForm : LedgerTransactionsEvent()
    data class UpdateFormClientId(val clientId: String) : LedgerTransactionsEvent()
    data class UpdateFormTransactionType(val type: Int) : LedgerTransactionsEvent()
    data class UpdateFormAmount(val amount: String) : LedgerTransactionsEvent()
    data class UpdateFormWithdrawCharges(val charges: String) : LedgerTransactionsEvent()
    data class UpdateFormBankId(val bankId: String) : LedgerTransactionsEvent()
    data class UpdateFormCardId(val cardId: String) : LedgerTransactionsEvent()
    data class UpdateFormRemark(val remark: String) : LedgerTransactionsEvent()
    object ExportPDF : LedgerTransactionsEvent()
    object DismissExportDialog : LedgerTransactionsEvent()
    object RefreshTransactions : LedgerTransactionsEvent()
}

@HiltViewModel
class LedgerTransactionsViewModel @Inject constructor(
    private val getTransactionsUseCase: GetLedgerTransactionsUseCase,
    private val createTransactionUseCase: CreateLedgerTransactionUseCase,
    private val updateTransactionUseCase: UpdateLedgerTransactionUseCase,
    private val deleteTransactionUseCase: DeleteLedgerTransactionUseCase,
    private val generateReportUseCase: GenerateLedgerReportUseCase
) : ViewModel() {

    private val _state = mutableStateOf(LedgerTransactionsState())
    val state: State<LedgerTransactionsState> = _state
    private var searchJob: Job? = null

    init {
        loadTransactions()
    }

    fun onEvent(event: LedgerTransactionsEvent) {
        when (event) {
            is LedgerTransactionsEvent.LoadNextPage -> {
                val pagination = state.value.pagination
                if (pagination != null &&
                    pagination.hasNextPage &&
                    !state.value.isLoading &&
                    !state.value.isLoadingMore
                ) {
                    loadTransactions(pagination.currentPage + 1, append = true)
                }
            }

            is LedgerTransactionsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch {
                    delay(500) // Debounce
                    loadTransactions(1)
                }
            }

            is LedgerTransactionsEvent.SelectTab -> {
                _state.value = _state.value.copy(selectedTab = event.tab)
                loadTransactions(1)
            }

            is LedgerTransactionsEvent.SelectType -> {
                _state.value = _state.value.copy(selectedType = event.type)
                loadTransactions(1)
            }

            is LedgerTransactionsEvent.DeleteTransaction -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = true,
                    transactionToDelete = event.transaction
                )
            }

            is LedgerTransactionsEvent.ConfirmDelete -> {
                state.value.transactionToDelete?.let { transaction ->
                    viewModelScope.launch {
                        try {
                            deleteTransactionUseCase(transaction.id)
                            _state.value = _state.value.copy(
                                showDeleteDialog = false,
                                transactionToDelete = null
                            )
                            loadTransactions()
                        } catch (e: Exception) {
                            _state.value = _state.value.copy(
                                error = e.message,
                                showDeleteDialog = false,
                                transactionToDelete = null
                            )
                        }
                    }
                }
            }

            is LedgerTransactionsEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    transactionToDelete = null
                )
            }

            is LedgerTransactionsEvent.SaveTransaction -> {
                val clientId = state.value.formClientId.trim().toIntOrNull()
                val amount = state.value.formAmount.trim().toDoubleOrNull()
                val charges = state.value.formWithdrawCharges.trim().toDoubleOrNull() ?: 0.0

                // Validation
                if (clientId == null) {
                    _state.value = _state.value.copy(formError = "Invalid Client ID")
                    return
                }
                if (amount == null || amount <= 0) {
                    _state.value = _state.value.copy(formError = "Invalid amount")
                    return
                }

                viewModelScope.launch {
                    try {
                        if (state.value.editingTransaction != null) {
                            // Update
                            val updateReq = UpdateLedgerTransactionRequest(
                                id = state.value.editingTransaction!!.id,
                                clientId = clientId,
                                transactionType = state.value.formTransactionType,
                                transactionAmount = amount,
                                withdrawCharges = if (state.value.formTransactionType == 0) charges else null,
                                bankId = state.value.formBankId.trim().toIntOrNull(),
                                cardId = state.value.formCardId.trim().toIntOrNull(),
                                remark = state.value.formRemark.trim().ifBlank { null }
                            )
                            updateTransactionUseCase(updateReq)
                        } else {
                            // Create
                            val createReq = CreateLedgerTransactionRequest(
                                clientId = clientId,
                                transactionType = state.value.formTransactionType,
                                transactionAmount = amount,
                                withdrawCharges = if (state.value.formTransactionType == 0) charges else 0.0,
                                bankId = state.value.formBankId.trim().toIntOrNull(),
                                cardId = state.value.formCardId.trim().toIntOrNull(),
                                remark = state.value.formRemark.trim().ifBlank { null }
                            )
                            createTransactionUseCase(createReq)
                        }
                        _state.value = _state.value.copy(
                            isFormVisible = false,
                            editingTransaction = null,
                            formClientId = "",
                            formAmount = "",
                            formWithdrawCharges = "",
                            formBankId = "",
                            formCardId = "",
                            formRemark = "",
                            formError = null
                        )
                        loadTransactions()
                    } catch (e: Exception) {
                        _state.value = _state.value.copy(formError = e.message)
                    }
                }
            }

            is LedgerTransactionsEvent.OpenForm -> {
                val txn = event.transactionToEdit
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingTransaction = txn,
                    formClientId = txn?.clientId?.toString() ?: "",
                    formTransactionType = txn?.transactionType ?: 1,
                    formAmount = txn?.transactionAmount?.toString() ?: "",
                    formWithdrawCharges = txn?.withdrawCharges?.toString() ?: "",
                    formBankId = txn?.bankId?.toString() ?: "",
                    formCardId = txn?.cardId?.toString() ?: "",
                    formRemark = txn?.remark ?: "",
                    formError = null
                )
            }

            is LedgerTransactionsEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingTransaction = null,
                    formClientId = "",
                    formAmount = "",
                    formWithdrawCharges = "",
                    formBankId = "",
                    formCardId = "",
                    formRemark = "",
                    formError = null
                )
            }

            is LedgerTransactionsEvent.UpdateFormClientId -> {
                _state.value = _state.value.copy(formClientId = event.clientId, formError = null)
            }

            is LedgerTransactionsEvent.UpdateFormTransactionType -> {
                _state.value = _state.value.copy(formTransactionType = event.type)
            }

            is LedgerTransactionsEvent.UpdateFormAmount -> {
                _state.value = _state.value.copy(formAmount = event.amount, formError = null)
            }

            is LedgerTransactionsEvent.UpdateFormWithdrawCharges -> {
                _state.value = _state.value.copy(formWithdrawCharges = event.charges)
            }

            is LedgerTransactionsEvent.UpdateFormBankId -> {
                _state.value = _state.value.copy(formBankId = event.bankId)
            }

            is LedgerTransactionsEvent.UpdateFormCardId -> {
                _state.value = _state.value.copy(formCardId = event.cardId)
            }

            is LedgerTransactionsEvent.UpdateFormRemark -> {
                _state.value = _state.value.copy(formRemark = event.remark)
            }

            is LedgerTransactionsEvent.ExportPDF -> {
                exportToPDF()
            }

            is LedgerTransactionsEvent.DismissExportDialog -> {
                _state.value = _state.value.copy(
                    showExportDialog = false,
                    exportedPdfPath = null
                )
            }

            is LedgerTransactionsEvent.RefreshTransactions -> loadTransactions()
        }
    }

    private fun loadTransactions(page: Int = 1, append: Boolean = false) {
        viewModelScope.launch {
            // Show appropriate loading indicator
            if (append) {
                _state.value = _state.value.copy(isLoadingMore = true, error = null)
            } else {
                _state.value = _state.value.copy(isLoading = true, error = null)
            }

            try {
                // Calculate date range based on selected tab
                val dateRange = getDateRangeForTab(_state.value.selectedTab)

                // Get transaction type filter
                val typeFilter = when (_state.value.selectedType) {
                    "Deposit" -> 1
                    "Withdrawal" -> 0
                    else -> null // "All"
                }

                val result = getTransactionsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    type = typeFilter,
                    startDate = dateRange.first,
                    endDate = dateRange.second,
                    sortBy = "create_date",
                    sortOrder = "desc"
                )

                val newTransactions = if (append) {
                    _state.value.transactions + result.data
                } else {
                    result.data
                }

                _state.value = _state.value.copy(
                    transactions = newTransactions,
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

    private fun exportToPDF() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isExporting = true)
            try {
                // Note: This requires date range - you may want to add date pickers
                // For now, using current month as an example
                val result = generateReportUseCase(
                    startDate = "2024-01-01",
                    endDate = "2024-12-31",
                    clientId = null
                )
                // The result contains base64 PDF content and filename
                // You'll need to decode and save it - implementation depends on your requirements
                _state.value = _state.value.copy(
                    isExporting = false,
                    exportedPdfPath = result.filename,
                    showExportDialog = true
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isExporting = false,
                    error = e.message
                )
            }
        }
    }

    private fun getDateRangeForTab(tab: String): Pair<String?, String?> {
        val calendar = java.util.Calendar.getInstance()
        val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())

        return when (tab) {
            "All" -> null to null

            "Today" -> {
                val today = dateFormat.format(calendar.time)
                today to today
            }

            "Yesterday" -> {
                calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
                val yesterday = dateFormat.format(calendar.time)
                yesterday to yesterday
            }

            "This Week" -> {
                // Get start of week (Monday)
                calendar.set(java.util.Calendar.DAY_OF_WEEK, calendar.firstDayOfWeek)
                val startOfWeek = dateFormat.format(calendar.time)

                // Get end of week (Sunday)
                calendar.add(java.util.Calendar.DAY_OF_YEAR, 6)
                val endOfWeek = dateFormat.format(calendar.time)

                startOfWeek to endOfWeek
            }

            "This Month" -> {
                // Get start of month
                calendar.set(java.util.Calendar.DAY_OF_MONTH, 1)
                val startOfMonth = dateFormat.format(calendar.time)

                // Get end of month
                calendar.set(java.util.Calendar.DAY_OF_MONTH, calendar.getActualMaximum(java.util.Calendar.DAY_OF_MONTH))
                val endOfMonth = dateFormat.format(calendar.time)

                startOfMonth to endOfMonth
            }

            else -> null to null
        }
    }
}

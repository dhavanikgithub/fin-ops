package com.example.fin_ops.presentation.profiler.transactions

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.profile.GetProfilesUseCase
import com.example.fin_ops.domain.use_case.transaction.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject


@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val getTransactionsUseCase: GetTransactionsUseCase,
    private val createDepositUseCase: CreateDepositUseCase,
    private val createWithdrawUseCase: CreateWithdrawUseCase,
    private val deleteTransactionUseCase: DeleteTransactionUseCase,
    private val getProfilesUseCase: GetProfilesUseCase
) : ViewModel() {

    private val _state = mutableStateOf(TransactionsState())
    val state: State<TransactionsState> = _state

    private var searchJob: Job? = null
    private var profileSearchJob: Job? = null

    init {
        loadTransactions()
    }

    fun onEvent(event: TransactionsEvent) {
        when (event) {
            is TransactionsEvent.LoadTransactions -> loadTransactions(event.page)

            is TransactionsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }

            is TransactionsEvent.SaveDeposit -> saveDeposit()

            is TransactionsEvent.SaveWithdraw -> saveWithdraw()

            is TransactionsEvent.DeleteTransaction -> confirmDelete(event.transaction)

            is TransactionsEvent.ConfirmDelete -> deleteTransaction()

            is TransactionsEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    transactionToDelete = null
                )
            }

            is TransactionsEvent.OpenDepositForm -> {
                _state.value = _state.value.copy(
                    isDepositFormVisible = true,
                    depositFormProfileId = null,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    selectedProfile = null,
                    profileSearchQuery = "",
                    profileSuggestions = emptyList(),
                    showProfileDropdown = false,
                    formError = null
                )
            }

            is TransactionsEvent.OpenWithdrawForm -> {
                _state.value = _state.value.copy(
                    isWithdrawFormVisible = true,
                    withdrawFormProfileId = null,
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    selectedProfile = null,
                    profileSearchQuery = "",
                    profileSuggestions = emptyList(),
                    showProfileDropdown = false,
                    formError = null
                )
            }

            is TransactionsEvent.CloseDepositForm -> {
                _state.value = _state.value.copy(
                    isDepositFormVisible = false,
                    depositFormProfileId = null,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    selectedProfile = null,
                    profileSearchQuery = "",
                    profileSuggestions = emptyList(),
                    showProfileDropdown = false,
                    formError = null
                )
            }

            is TransactionsEvent.CloseWithdrawForm -> {
                _state.value = _state.value.copy(
                    isWithdrawFormVisible = false,
                    withdrawFormProfileId = null,
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    selectedProfile = null,
                    profileSearchQuery = "",
                    profileSuggestions = emptyList(),
                    showProfileDropdown = false,
                    formError = null
                )
            }

            is TransactionsEvent.UpdateDepositFormAmount -> {
                _state.value = _state.value.copy(depositFormAmount = event.value, formError = null)
            }

            is TransactionsEvent.UpdateDepositFormNotes -> {
                _state.value = _state.value.copy(depositFormNotes = event.value)
            }

            is TransactionsEvent.UpdateWithdrawFormAmount -> {
                _state.value = _state.value.copy(withdrawFormAmount = event.value, formError = null)
            }

            is TransactionsEvent.UpdateWithdrawFormCharges -> {
                _state.value = _state.value.copy(withdrawFormChargesPercentage = event.value, formError = null)
            }

            is TransactionsEvent.UpdateWithdrawFormNotes -> {
                _state.value = _state.value.copy(withdrawFormNotes = event.value)
            }

            is TransactionsEvent.SearchProfile -> {
                _state.value = _state.value.copy(
                    profileSearchQuery = event.query,
                    showProfileDropdown = true,
                    formError = null
                )
                searchProfileDebounced(event.query)
            }

            is TransactionsEvent.SelectProfile -> {
                _state.value = _state.value.copy(
                    selectedProfile = event.profile,
                    depositFormProfileId = event.profile.id,
                    withdrawFormProfileId = event.profile.id,
                    profileSearchQuery = "${event.profile.clientName} - ${event.profile.bankName}",
                    showProfileDropdown = false,
                    profileSuggestions = emptyList(),
                    formError = null
                )
            }

            is TransactionsEvent.ClearProfileSelection -> {
                _state.value = _state.value.copy(
                    selectedProfile = null,
                    depositFormProfileId = null,
                    withdrawFormProfileId = null,
                    profileSearchQuery = "",
                    showProfileDropdown = false,
                    profileSuggestions = emptyList()
                )
            }

            is TransactionsEvent.RefreshTransactions -> {
                _state.value = _state.value.copy(searchQuery = "")
                loadTransactions(1)
            }
        }
    }

    private fun loadTransactions(page: Int = 1) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val result = getTransactionsUseCase(
                    page = page,
                    limit = 50,
                    search = _state.value.searchQuery.ifBlank { null },
                    transactionType = null,
                    sortBy = "created_at",
                    sortOrder = "desc"
                )

                _state.value = _state.value.copy(
                    isLoading = false,
                    transactions = result.data,
                    pagination = result.pagination,
                    summary = result.summary,
                    error = null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load transactions"
                )
            }
        }
    }

    private fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(500L)
            loadTransactions(1)
        }
    }

    private fun searchProfileDebounced(query: String) {
        profileSearchJob?.cancel()
        if (query.isBlank()) {
            _state.value = _state.value.copy(profileSuggestions = emptyList())
            return
        }

        profileSearchJob = viewModelScope.launch {
            delay(300L)
            try {
                val result = getProfilesUseCase(
                    page = 1,
                    limit = 10,
                    search = query,
                    status = "active" // Only show active profiles
                )

                // Convert to autocomplete format
                val suggestions = result.data.map { profile ->
                    com.example.fin_ops.data.remote.dto.AutocompleteProfilerProfileDto(
                        id = profile.id,
                        clientName = profile.clientName,
                        bankName = profile.bankName,
                        creditCardNumber = profile.creditCardNumber,
                        remainingBalance = profile.remainingBalance.toDoubleOrNull() ?: 0.0,
                        status = profile.status
                    )
                }

                _state.value = _state.value.copy(profileSuggestions = suggestions)
            } catch (e: Exception) {
                _state.value = _state.value.copy(profileSuggestions = emptyList())
            }
        }
    }

    private fun saveDeposit() {
        val profileId = _state.value.depositFormProfileId
        val amount = _state.value.depositFormAmount.trim()
        val notes = _state.value.depositFormNotes.trim()

        // Validation
        if (profileId == null) {
            _state.value = _state.value.copy(formError = "Please select a profile")
            return
        }

        if (amount.isBlank()) {
            _state.value = _state.value.copy(formError = "Amount is required")
            return
        }

        val amountValue = amount.toDoubleOrNull()
        if (amountValue == null || amountValue <= 0) {
            _state.value = _state.value.copy(formError = "Please enter a valid amount")
            return
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, formError = null)
            try {
                val request = CreateDepositRequest(
                    profileId = profileId,
                    amount = amountValue,
                    notes = notes.ifBlank { null }
                )
                createDepositUseCase(request)

                _state.value = _state.value.copy(
                    isDepositFormVisible = false,
                    depositFormProfileId = null,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    selectedProfile = null,
                    formError = null
                )

                loadTransactions(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    formError = e.message ?: "Failed to create deposit"
                )
            }
        }
    }

    private fun saveWithdraw() {
        val profileId = _state.value.withdrawFormProfileId
        val amount = _state.value.withdrawFormAmount.trim()
        val chargesPercentage = _state.value.withdrawFormChargesPercentage.trim()
        val notes = _state.value.withdrawFormNotes.trim()

        // Validation
        if (profileId == null) {
            _state.value = _state.value.copy(formError = "Please select a profile")
            return
        }

        if (amount.isBlank()) {
            _state.value = _state.value.copy(formError = "Amount is required")
            return
        }

        val amountValue = amount.toDoubleOrNull()
        if (amountValue == null || amountValue <= 0) {
            _state.value = _state.value.copy(formError = "Please enter a valid amount")
            return
        }

        val chargesValue = if (chargesPercentage.isNotBlank()) {
            val charges = chargesPercentage.toDoubleOrNull()
            if (charges == null || charges < 0 || charges > 100) {
                _state.value = _state.value.copy(formError = "Charges must be between 0 and 100")
                return
            }
            charges
        } else {
            null
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, formError = null)
            try {
                val request = CreateWithdrawRequest(
                    profileId = profileId,
                    amount = amountValue,
                    withdrawChargesPercentage = chargesValue,
                    notes = notes.ifBlank { null }
                )
                createWithdrawUseCase(request)

                _state.value = _state.value.copy(
                    isWithdrawFormVisible = false,
                    withdrawFormProfileId = null,
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    selectedProfile = null,
                    formError = null
                )

                loadTransactions(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    formError = e.message ?: "Failed to create withdrawal"
                )
            }
        }
    }

    private fun confirmDelete(transaction: ProfilerTransactionDto) {
        _state.value = _state.value.copy(
            showDeleteDialog = true,
            transactionToDelete = transaction
        )
    }

    private fun deleteTransaction() {
        val transactionToDelete = _state.value.transactionToDelete ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                showDeleteDialog = false
            )
            try {
                deleteTransactionUseCase(transactionToDelete.id)

                _state.value = _state.value.copy(
                    transactionToDelete = null
                )

                loadTransactions(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to delete transaction",
                    showDeleteDialog = false,
                    transactionToDelete = null
                )
            }
        }
    }
}

// Events sealed class for UI interactions
sealed class TransactionsEvent {
    data class LoadTransactions(val page: Int) : TransactionsEvent()
    data class Search(val query: String) : TransactionsEvent()
    object SaveDeposit : TransactionsEvent()
    object SaveWithdraw : TransactionsEvent()
    data class DeleteTransaction(val transaction: ProfilerTransactionDto) : TransactionsEvent()
    object ConfirmDelete : TransactionsEvent()
    object CancelDelete : TransactionsEvent()
    object OpenDepositForm : TransactionsEvent()
    object OpenWithdrawForm : TransactionsEvent()
    object CloseDepositForm : TransactionsEvent()
    object CloseWithdrawForm : TransactionsEvent()
    data class UpdateDepositFormAmount(val value: String) : TransactionsEvent()
    data class UpdateDepositFormNotes(val value: String) : TransactionsEvent()
    data class UpdateWithdrawFormAmount(val value: String) : TransactionsEvent()
    data class UpdateWithdrawFormCharges(val value: String) : TransactionsEvent()
    data class UpdateWithdrawFormNotes(val value: String) : TransactionsEvent()
    data class SearchProfile(val query: String) : TransactionsEvent()
    data class SelectProfile(val profile: com.example.fin_ops.data.remote.dto.AutocompleteProfilerProfileDto) : TransactionsEvent()
    object ClearProfileSelection : TransactionsEvent()
    object RefreshTransactions : TransactionsEvent()
}
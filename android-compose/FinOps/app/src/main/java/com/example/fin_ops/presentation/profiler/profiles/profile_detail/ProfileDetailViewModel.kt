package com.example.fin_ops.presentation.profiler.profile_detail

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.CreateDepositRequest
import com.example.fin_ops.data.remote.dto.CreateWithdrawRequest
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.domain.use_case.profile.GetProfilesUseCase
import com.example.fin_ops.domain.use_case.transaction.*
import com.example.fin_ops.presentation.profiler.profiles.profile_detail.ProfileDetailState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileDetailViewModel @Inject constructor(
    private val getProfilesUseCase: GetProfilesUseCase,
    private val getTransactionsUseCase: GetTransactionsUseCase,
    private val createDepositUseCase: CreateDepositUseCase,
    private val createWithdrawUseCase: CreateWithdrawUseCase,
    private val deleteTransactionUseCase: DeleteTransactionUseCase,
    private val getTransactionSummaryUseCase: GetTransactionSummaryUseCase,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _state = mutableStateOf(ProfileDetailState())
    val state: State<ProfileDetailState> = _state

    private val profileId: Int = savedStateHandle.get<Int>("profileId") ?: -1

    private var searchJob: Job? = null

    init {
        if (profileId != -1) {
            loadProfileDetails()
            loadTransactions()
            loadSummary()
        }
    }

    fun onEvent(event: ProfileDetailEvent) {
        when (event) {
            is ProfileDetailEvent.LoadTransactions -> loadTransactions(event.page)

            is ProfileDetailEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }

            is ProfileDetailEvent.SaveDeposit -> saveDeposit()

            is ProfileDetailEvent.SaveWithdraw -> saveWithdraw()

            is ProfileDetailEvent.DeleteTransaction -> confirmDelete(event.transaction)

            is ProfileDetailEvent.ConfirmDelete -> deleteTransaction()

            is ProfileDetailEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteTransactionDialog = false,
                    transactionToDelete = null
                )
            }

            is ProfileDetailEvent.OpenDepositForm -> {
                _state.value = _state.value.copy(
                    isDepositFormVisible = true,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    formError = null
                )
            }

            is ProfileDetailEvent.OpenWithdrawForm -> {
                _state.value = _state.value.copy(
                    isWithdrawFormVisible = true,
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    formError = null
                )
            }

            is ProfileDetailEvent.CloseDepositForm -> {
                _state.value = _state.value.copy(
                    isDepositFormVisible = false,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    formError = null
                )
            }

            is ProfileDetailEvent.CloseWithdrawForm -> {
                _state.value = _state.value.copy(
                    isWithdrawFormVisible = false,
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    formError = null
                )
            }

            is ProfileDetailEvent.UpdateDepositFormAmount -> {
                _state.value = _state.value.copy(depositFormAmount = event.value, formError = null)
            }

            is ProfileDetailEvent.UpdateDepositFormNotes -> {
                _state.value = _state.value.copy(depositFormNotes = event.value)
            }

            is ProfileDetailEvent.UpdateWithdrawFormAmount -> {
                _state.value = _state.value.copy(withdrawFormAmount = event.value, formError = null)
            }

            is ProfileDetailEvent.UpdateWithdrawFormCharges -> {
                _state.value = _state.value.copy(withdrawFormChargesPercentage = event.value, formError = null)
            }

            is ProfileDetailEvent.UpdateWithdrawFormNotes -> {
                _state.value = _state.value.copy(withdrawFormNotes = event.value)
            }

            is ProfileDetailEvent.ExportPDF -> exportPDF()

            is ProfileDetailEvent.RefreshAll -> {
                loadProfileDetails()
                loadTransactions(1)
                loadSummary()
            }
        }
    }

    private fun loadProfileDetails() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoadingProfile = true, profileError = null)
            try {
                // Get profile by filtering with profile id
                val result = getProfilesUseCase(
                    page = 1,
                    limit = 1,
                    search = null,
                    status = null
                )

                val profile = result.data.find { it.id == profileId }

                if (profile != null) {
                    _state.value = _state.value.copy(
                        profile = profile,
                        isLoadingProfile = false,
                        profileError = null
                    )
                } else {
                    _state.value = _state.value.copy(
                        isLoadingProfile = false,
                        profileError = "Profile not found"
                    )
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingProfile = false,
                    profileError = e.message ?: "Failed to load profile"
                )
            }
        }
    }

    private fun loadTransactions(page: Int = 1) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoadingTransactions = true, transactionsError = null)
            try {
                val result = getTransactionsUseCase(
                    page = page,
                    limit = 20,
                    search = _state.value.searchQuery.ifBlank { null },
                    transactionType = null,
                    sortBy = "created_at",
                    sortOrder = "desc",
                    profileId = profileId
                )

                val newTransactions = if (page == 1) {
                    result.data
                } else {
                    _state.value.transactions + result.data
                }

                _state.value = _state.value.copy(
                    transactions = newTransactions,
                    pagination = result.pagination,
                    isLoadingTransactions = false,
                    transactionsError = null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingTransactions = false,
                    transactionsError = e.message ?: "Failed to load transactions"
                )
            }
        }
    }

    private fun loadSummary() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoadingSummary = true)
            try {
                val summary = getTransactionSummaryUseCase(profileId)
                _state.value = _state.value.copy(
                    summary = summary,
                    isLoadingSummary = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingSummary = false
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

    private fun saveDeposit() {
        val amount = _state.value.depositFormAmount.trim()
        val notes = _state.value.depositFormNotes.trim()

        // Validation
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
            _state.value = _state.value.copy(isLoadingTransactions = true, formError = null)
            try {
                val request = CreateDepositRequest(
                    profileId = profileId,
                    amount = amountValue,
                    notes = notes.ifBlank { null }
                )
                createDepositUseCase(request)

                _state.value = _state.value.copy(
                    isDepositFormVisible = false,
                    depositFormAmount = "",
                    depositFormNotes = "",
                    formError = null
                )

                // Refresh data
                loadProfileDetails()
                loadTransactions(1)
                loadSummary()
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingTransactions = false,
                    formError = e.message ?: "Failed to create deposit"
                )
            }
        }
    }

    private fun saveWithdraw() {
        val amount = _state.value.withdrawFormAmount.trim()
        val chargesPercentage = _state.value.withdrawFormChargesPercentage.trim()
        val notes = _state.value.withdrawFormNotes.trim()

        // Validation
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
            _state.value = _state.value.copy(isLoadingTransactions = true, formError = null)
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
                    withdrawFormAmount = "",
                    withdrawFormChargesPercentage = "",
                    withdrawFormNotes = "",
                    formError = null
                )

                // Refresh data
                loadProfileDetails()
                loadTransactions(1)
                loadSummary()
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingTransactions = false,
                    formError = e.message ?: "Failed to create withdrawal"
                )
            }
        }
    }

    private fun confirmDelete(transaction: ProfilerTransactionDto) {
        _state.value = _state.value.copy(
            showDeleteTransactionDialog = true,
            transactionToDelete = transaction
        )
    }

    private fun deleteTransaction() {
        val transactionToDelete = _state.value.transactionToDelete ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoadingTransactions = true,
                showDeleteTransactionDialog = false
            )
            try {
                deleteTransactionUseCase(transactionToDelete.id)

                _state.value = _state.value.copy(
                    transactionToDelete = null
                )

                // Refresh data
                loadProfileDetails()
                loadTransactions(1)
                loadSummary()
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoadingTransactions = false,
                    error = e.message ?: "Failed to delete transaction",
                    showDeleteTransactionDialog = false,
                    transactionToDelete = null
                )
            }
        }
    }

    private fun exportPDF() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isExporting = true)
            try {
                // TODO: Implement PDF export functionality
                // This would use exportProfilerTransactionPdf from repository
                _state.value = _state.value.copy(isExporting = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isExporting = false,
                    error = e.message ?: "Failed to export PDF"
                )
            }
        }
    }
}

// Events sealed class for UI interactions
sealed class ProfileDetailEvent {
    data class LoadTransactions(val page: Int) : ProfileDetailEvent()
    data class Search(val query: String) : ProfileDetailEvent()
    object SaveDeposit : ProfileDetailEvent()
    object SaveWithdraw : ProfileDetailEvent()
    data class DeleteTransaction(val transaction: ProfilerTransactionDto) : ProfileDetailEvent()
    object ConfirmDelete : ProfileDetailEvent()
    object CancelDelete : ProfileDetailEvent()
    object OpenDepositForm : ProfileDetailEvent()
    object OpenWithdrawForm : ProfileDetailEvent()
    object CloseDepositForm : ProfileDetailEvent()
    object CloseWithdrawForm : ProfileDetailEvent()
    data class UpdateDepositFormAmount(val value: String) : ProfileDetailEvent()
    data class UpdateDepositFormNotes(val value: String) : ProfileDetailEvent()
    data class UpdateWithdrawFormAmount(val value: String) : ProfileDetailEvent()
    data class UpdateWithdrawFormCharges(val value: String) : ProfileDetailEvent()
    data class UpdateWithdrawFormNotes(val value: String) : ProfileDetailEvent()
    object ExportPDF : ProfileDetailEvent()
    object RefreshAll : ProfileDetailEvent()
}
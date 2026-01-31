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
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val pagination: LedgerBankPagination? = null,
    val searchQuery: String = "",
    // Form State
    val isFormVisible: Boolean = false,
    val editingBank: LedgerBankDto? = null, // Null for Create, Object for Edit
    val formBankName: String = "",
    val formError: String? = null,
    // Delete Confirmation
    val showDeleteDialog: Boolean = false,
    val bankToDelete: LedgerBankDto? = null
)

sealed class LedgerBanksEvent {
    data class LoadBanks(val page: Int) : LedgerBanksEvent()
    object LoadNextPage : LedgerBanksEvent()
    data class Search(val query: String) : LedgerBanksEvent()
    data class DeleteBank(val bank: LedgerBankDto) : LedgerBanksEvent()
    object ConfirmDelete : LedgerBanksEvent()
    object CancelDelete : LedgerBanksEvent()
    object SaveBank : LedgerBanksEvent()
    data class OpenForm(val bankToEdit: LedgerBankDto? = null) : LedgerBanksEvent()
    object CloseForm : LedgerBanksEvent()
    data class UpdateFormBankName(val name: String) : LedgerBanksEvent()
    object RefreshBanks : LedgerBanksEvent()
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
            is LedgerBanksEvent.LoadBanks -> loadBanks(event.page)

            is LedgerBanksEvent.LoadNextPage -> {
                val pagination = state.value.pagination
                if (pagination != null &&
                    pagination.hasNextPage &&
                    !state.value.isLoading &&
                    !state.value.isLoadingMore
                ) {
                    loadBanks(pagination.currentPage + 1, append = true)
                }
            }

            is LedgerBanksEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch {
                    delay(500) // Debounce
                    loadBanks(1)
                }
            }

            is LedgerBanksEvent.DeleteBank -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = true,
                    bankToDelete = event.bank
                )
            }

            is LedgerBanksEvent.ConfirmDelete -> {
                state.value.bankToDelete?.let { bank ->
                    viewModelScope.launch {
                        try {
                            deleteBankUseCase(bank.id)
                            _state.value = _state.value.copy(
                                showDeleteDialog = false,
                                bankToDelete = null
                            )
                            loadBanks()
                        } catch (e: Exception) {
                            _state.value = _state.value.copy(
                                error = e.message,
                                showDeleteDialog = false,
                                bankToDelete = null
                            )
                        }
                    }
                }
            }

            is LedgerBanksEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    bankToDelete = null
                )
            }

            is LedgerBanksEvent.SaveBank -> {
                val bankName = state.value.formBankName.trim()
                if (bankName.isBlank()) {
                    _state.value = _state.value.copy(formError = "Bank name cannot be empty")
                    return
                }

                viewModelScope.launch {
                    try {
                        if (state.value.editingBank != null) {
                            // Update existing bank
                            updateBankUseCase(state.value.editingBank!!.id, bankName)
                        } else {
                            // Create new bank
                            createBankUseCase(bankName)
                        }
                        _state.value = _state.value.copy(
                            isFormVisible = false,
                            editingBank = null,
                            formBankName = "",
                            formError = null
                        )
                        loadBanks()
                    } catch (e: Exception) {
                        _state.value = _state.value.copy(formError = e.message)
                    }
                }
            }

            is LedgerBanksEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingBank = event.bankToEdit,
                    formBankName = event.bankToEdit?.name ?: "",
                    formError = null
                )
            }

            is LedgerBanksEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingBank = null,
                    formBankName = "",
                    formError = null
                )
            }

            is LedgerBanksEvent.UpdateFormBankName -> {
                _state.value = _state.value.copy(
                    formBankName = event.name,
                    formError = null
                )
            }

            is LedgerBanksEvent.RefreshBanks -> loadBanks()
        }
    }

    private fun loadBanks(page: Int = 1, append: Boolean = false) {
        viewModelScope.launch {
            // Show appropriate loading indicator
            if (append) {
                _state.value = _state.value.copy(isLoadingMore = true, error = null)
            } else {
                _state.value = _state.value.copy(isLoading = true, error = null)
            }

            try {
                val result = getBanksUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = "name",
                    sortOrder = "asc"
                )

                val newBanks = if (append) {
                    _state.value.banks + result.data
                } else {
                    result.data
                }

                _state.value = _state.value.copy(
                    banks = newBanks,
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
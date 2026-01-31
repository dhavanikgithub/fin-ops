package com.example.fin_ops.presentation.profiler.banks

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.ProfilerBankDto
import com.example.fin_ops.domain.use_case.bank.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BanksViewModel @Inject constructor(
    private val getBanksUseCase: GetBanksUseCase,
    private val createBankUseCase: CreateBankUseCase,
    private val updateBankUseCase: UpdateBankUseCase,
    private val deleteBankUseCase: DeleteBankUseCase,
    private val searchBanksUseCase: SearchBanksUseCase
) : ViewModel() {

    private val _state = mutableStateOf(BanksState())
    val state: State<BanksState> = _state

    private var searchJob: Job? = null
    private var loadJob: Job? = null // 1. Add a Job reference

    init {
        loadBanks()
    }

    fun onEvent(event: BanksEvent) {
        when (event) {
            is BanksEvent.LoadBanks -> loadBanks(event.page)

            is BanksEvent.LoadNextPage -> {
                val pagination = state.value.pagination
                if (pagination != null &&
                    pagination.hasNextPage &&
                    !state.value.isLoading &&
                    !state.value.isLoadingMore
                ) {
                    loadBanks(pagination.currentPage + 1)
                }
            }

            is BanksEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }

            is BanksEvent.SaveBank -> saveBank()

            is BanksEvent.DeleteBank -> confirmDelete(event.bank)

            is BanksEvent.ConfirmDelete -> deleteBank()

            is BanksEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    bankToDelete = null
                )
            }

            is BanksEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingBank = event.bankToEdit,
                    formBankName = event.bankToEdit?.bankName ?: "",
                    formError = null
                )
            }

            is BanksEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingBank = null,
                    formBankName = "",
                    formError = null
                )
            }

            is BanksEvent.UpdateFormBankName -> {
                _state.value = _state.value.copy(
                    formBankName = event.name,
                    formError = null
                )
            }

            is BanksEvent.RefreshBanks -> {
                _state.value = _state.value.copy(searchQuery = "")
                loadBanks(1)
            }
        }
    }

    private fun loadBanks(page: Int = 1) {
        viewModelScope.launch {
            val isFirstPage = page == 1

            // 2. If loading page 1 (Reset), cancel any existing pagination request
            if (isFirstPage) {
                loadJob?.cancel()
                _state.value = _state.value.copy(
                    isLoading = true,
                    isLoadingMore = false, // <--- Added this
                    error = null
                )
            }
            else {
                _state.value = _state.value.copy(
                    isLoadingMore = true,
                    error = null
                )
            }

            // Update loading state
            if (isFirstPage) {
                _state.value = _state.value.copy(isLoading = true, error = null)
            } else {
                _state.value = _state.value.copy(isLoadingMore = true, error = null)
            }
            try {
                val result = getBanksUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = "bank_name",
                    sortOrder = "asc",
                    hasProfiles = null
                )
                // Append if loading more, Replace if first page
                if (isFirstPage || page == (state.value.pagination?.currentPage?.plus(1))) {
                    val updatedList = if (isFirstPage) {
                        result.data
                    } else {
                        state.value.banks + result.data
                    }
                    _state.value = _state.value.copy(
                        isLoading = false,
                        isLoadingMore = false,
                        banks = updatedList,
                        pagination = result.pagination
                    )
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load banks"
                )
            }
        }
    }

    private fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            if (query.isNotBlank()) {
                _state.value = _state.value.copy(banks = emptyList(), isLoading = true)
            }
            delay(500L) // Debounce
            _state.value = _state.value.copy(banks = emptyList(), isLoading = true)
            if (query.isBlank()) {
                loadBanks(1)
                _state.value = _state.value.copy(autocompleteSuggestions = emptyList())
                return@launch
            }

            // Load banks with search
            loadBanks(1)

            // Get autocomplete suggestions
            try {
                val suggestions = searchBanksUseCase(query)
                _state.value = _state.value.copy(autocompleteSuggestions = suggestions)
            } catch (e: Exception) {
                // Handle error silently for autocomplete
                _state.value = _state.value.copy(autocompleteSuggestions = emptyList())
            }
        }
    }

    private fun saveBank() {
        val name = _state.value.formBankName.trim()

        // Validation
        if (name.isBlank()) {
            _state.value = _state.value.copy(formError = "Bank name cannot be empty")
            return
        }

        if (name.length < 2) {
            _state.value = _state.value.copy(formError = "Bank name must be at least 2 characters")
            return
        }

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, formError = null)
            try {
                val editingBank = _state.value.editingBank
                if (editingBank != null) {
                    // Update existing bank
                    updateBankUseCase(editingBank.id, name)
                } else {
                    // Create new bank
                    createBankUseCase(name)
                }

                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingBank = null,
                    formBankName = "",
                    formError = null
                )

                // Refresh list
                loadBanks(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    formError = e.message ?: "Failed to save bank"
                )
            }
        }
    }

    private fun confirmDelete(bank: ProfilerBankDto) {
        _state.value = _state.value.copy(
            showDeleteDialog = true,
            bankToDelete = bank
        )
    }

    private fun deleteBank() {
        val bankToDelete = _state.value.bankToDelete ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                showDeleteDialog = false
            )
            try {
                deleteBankUseCase(bankToDelete.id)

                _state.value = _state.value.copy(
                    bankToDelete = null
                )

                // Refresh list
                loadBanks(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to delete bank",
                    showDeleteDialog = false,
                    bankToDelete = null
                )
            }
        }
    }
}

// Events sealed class for UI interactions
sealed class BanksEvent {
    data class LoadBanks(val page: Int) : BanksEvent()
    object LoadNextPage : BanksEvent() // Added for infinite scroll
    data class Search(val query: String) : BanksEvent()
    object SaveBank : BanksEvent()
    data class DeleteBank(val bank: ProfilerBankDto) : BanksEvent()
    object ConfirmDelete : BanksEvent()
    object CancelDelete : BanksEvent()
    data class OpenForm(val bankToEdit: ProfilerBankDto? = null) : BanksEvent()
    object CloseForm : BanksEvent()
    data class UpdateFormBankName(val name: String) : BanksEvent()
    object RefreshBanks : BanksEvent()
}
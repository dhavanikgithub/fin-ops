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

    init {
        loadBanks()
    }

    fun onEvent(event: BanksEvent) {
        when (event) {
            is BanksEvent.LoadBanks -> loadBanks(event.page)
            is BanksEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchDebounced(event.query)
            }
            is BanksEvent.SaveBank -> {
                if (state.value.editingBank != null) {
                    updateBank(state.value.editingBank!!.id, event.name)
                } else {
                    createBank(event.name)
                }
            }
            is BanksEvent.DeleteBank -> deleteBank(event.id)
            is BanksEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingBank = event.bankToEdit // null for create
                )
            }
            is BanksEvent.CloseForm -> {
                _state.value = _state.value.copy(isFormVisible = false, editingBank = null)
            }
        }
    }

    private fun loadBanks(page: Int = 1) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val result = getBanksUseCase(page, _state.value.searchQuery.ifBlank { null })
                _state.value = _state.value.copy(
                    isLoading = false,
                    banks = result.data,
                    pagination = result.pagination
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(500L) // Debounce
            if (query.isBlank()) {
                loadBanks(1)
                _state.value = _state.value.copy(autocompleteSuggestions = emptyList())
                return@launch
            }

            // Parallel: Refresh list AND get autocomplete suggestions
            launch { loadBanks(1) }
            launch {
                try {
                    val suggestions = searchBanksUseCase(query)
                    _state.value = _state.value.copy(autocompleteSuggestions = suggestions)
                } catch (e: Exception) {
                    // Handle error silently for autocomplete
                }
            }
        }
    }

    private fun createBank(name: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                createBankUseCase(name)
                _state.value = _state.value.copy(isFormVisible = false)
                loadBanks(1) // Refresh list
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun updateBank(id: Int, name: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                updateBankUseCase(id, name)
                _state.value = _state.value.copy(isFormVisible = false, editingBank = null)
                loadBanks(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun deleteBank(id: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                deleteBankUseCase(id)
                loadBanks(_state.value.pagination?.currentPage ?: 1)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }
}

// Events sealed class for UI interactions
sealed class BanksEvent {
    data class LoadBanks(val page: Int) : BanksEvent()
    data class Search(val query: String) : BanksEvent()
    data class SaveBank(val name: String) : BanksEvent() // Used for Create or Update based on state
    data class DeleteBank(val id: Int) : BanksEvent()
    data class OpenForm(val bankToEdit: ProfilerBankDto? = null) : BanksEvent()
    object CloseForm : BanksEvent()
}
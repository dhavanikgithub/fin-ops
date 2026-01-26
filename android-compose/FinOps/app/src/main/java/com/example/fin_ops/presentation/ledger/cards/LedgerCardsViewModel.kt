package com.example.fin_ops.presentation.ledger.cards

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.LedgerCardDto
import com.example.fin_ops.data.remote.dto.LedgerCardPagination
import com.example.fin_ops.domain.use_case.ledger_card.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LedgerCardsState(
    val cards: List<LedgerCardDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: LedgerCardPagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val currentSortBy: String = "name",
    val currentSortOrder: String = "asc",
    // Form State
    val isFormVisible: Boolean = false,
    val editingCard: LedgerCardDto? = null // Null for Create, Object for Edit
)

sealed class LedgerCardsEvent {
    data class LoadPage(val page: Int) : LedgerCardsEvent()
    data class Search(val query: String) : LedgerCardsEvent()
    data class ChangeSort(val sortBy: String) : LedgerCardsEvent()
    data class DeleteCard(val id: Int) : LedgerCardsEvent()
    data class SaveCard(val name: String) : LedgerCardsEvent() // Create or Update based on state
    data class OpenForm(val card: LedgerCardDto? = null) : LedgerCardsEvent()
    object CloseForm : LedgerCardsEvent()
    object Refresh : LedgerCardsEvent()
}

@HiltViewModel
class LedgerCardsViewModel @Inject constructor(
    private val getCardsUseCase: GetLedgerCardsUseCase,
    private val createCardUseCase: CreateLedgerCardUseCase,
    private val updateCardUseCase: UpdateLedgerCardUseCase,
    private val deleteCardUseCase: DeleteLedgerCardUseCase
) : ViewModel() {

    private val _state = mutableStateOf(LedgerCardsState())
    val state: State<LedgerCardsState> = _state
    private var searchJob: Job? = null

    init {
        loadCards()
    }

    fun onEvent(event: LedgerCardsEvent) {
        when (event) {
            is LedgerCardsEvent.LoadPage -> loadCards(page = event.page)
            is LedgerCardsEvent.Refresh -> loadCards()
            is LedgerCardsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch { delay(500); loadCards(1) }
            }
            is LedgerCardsEvent.ChangeSort -> {
                val newOrder = if (state.value.currentSortBy == event.sortBy) toggleOrder(state.value.currentSortOrder) else "asc"
                _state.value = _state.value.copy(currentSortBy = event.sortBy, currentSortOrder = newOrder)
                loadCards(1)
            }
            is LedgerCardsEvent.DeleteCard -> performAction { deleteCardUseCase(event.id) }
            is LedgerCardsEvent.SaveCard -> performAction {
                if (state.value.editingCard != null) {
                    updateCardUseCase(state.value.editingCard!!.id, event.name)
                } else {
                    createCardUseCase(event.name)
                }
                _state.value = _state.value.copy(isFormVisible = false, editingCard = null)
            }
            is LedgerCardsEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingCard = event.card)
            is LedgerCardsEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingCard = null)
        }
    }

    private fun loadCards(page: Int = _state.value.currentPage) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = getCardsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = _state.value.currentSortBy,
                    sortOrder = _state.value.currentSortOrder
                )
                _state.value = _state.value.copy(
                    cards = result.data,
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
            try { action(); loadCards() }
            catch (e: Exception) { _state.value = _state.value.copy(isLoading = false, error = e.message) }
        }
    }

    private fun toggleOrder(order: String) = if (order == "asc") "desc" else "asc"
}
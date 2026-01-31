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
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val pagination: LedgerCardPagination? = null,
    val searchQuery: String = "",

    // Form State
    val isFormVisible: Boolean = false,
    val editingCard: LedgerCardDto? = null,
    val formCardName: String = "",
    val formError: String? = null,

    // Delete Confirmation
    val showDeleteDialog: Boolean = false,
    val cardToDelete: LedgerCardDto? = null
)

sealed class LedgerCardsEvent {
    object LoadNextPage : LedgerCardsEvent()
    data class Search(val query: String) : LedgerCardsEvent()
    data class DeleteCard(val card: LedgerCardDto) : LedgerCardsEvent()
    object ConfirmDelete : LedgerCardsEvent()
    object CancelDelete : LedgerCardsEvent()
    object SaveCard : LedgerCardsEvent()
    data class OpenForm(val cardToEdit: LedgerCardDto? = null) : LedgerCardsEvent()
    object CloseForm : LedgerCardsEvent()
    data class UpdateFormCardName(val name: String) : LedgerCardsEvent()
    object RefreshCards : LedgerCardsEvent()
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
            is LedgerCardsEvent.LoadNextPage -> {
                val pagination = state.value.pagination
                if (pagination != null &&
                    pagination.hasNextPage &&
                    !state.value.isLoading &&
                    !state.value.isLoadingMore
                ) {
                    loadCards(pagination.currentPage + 1, append = true)
                }
            }

            is LedgerCardsEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                searchJob?.cancel()
                searchJob = viewModelScope.launch {
                    delay(500) // Debounce
                    loadCards(1)
                }
            }

            is LedgerCardsEvent.DeleteCard -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = true,
                    cardToDelete = event.card
                )
            }

            is LedgerCardsEvent.ConfirmDelete -> {
                state.value.cardToDelete?.let { card ->
                    viewModelScope.launch {
                        try {
                            deleteCardUseCase(card.id)
                            _state.value = _state.value.copy(
                                showDeleteDialog = false,
                                cardToDelete = null
                            )
                            loadCards()
                        } catch (e: Exception) {
                            _state.value = _state.value.copy(
                                error = e.message,
                                showDeleteDialog = false,
                                cardToDelete = null
                            )
                        }
                    }
                }
            }

            is LedgerCardsEvent.CancelDelete -> {
                _state.value = _state.value.copy(
                    showDeleteDialog = false,
                    cardToDelete = null
                )
            }

            is LedgerCardsEvent.SaveCard -> {
                val cardName = state.value.formCardName.trim()
                if (cardName.isBlank()) {
                    _state.value = _state.value.copy(formError = "Card name cannot be empty")
                    return
                }

                viewModelScope.launch {
                    try {
                        if (state.value.editingCard != null) {
                            // Update existing card
                            updateCardUseCase(state.value.editingCard!!.id, cardName)
                        } else {
                            // Create new card
                            createCardUseCase(cardName)
                        }
                        _state.value = _state.value.copy(
                            isFormVisible = false,
                            editingCard = null,
                            formCardName = "",
                            formError = null
                        )
                        loadCards()
                    } catch (e: Exception) {
                        _state.value = _state.value.copy(formError = e.message)
                    }
                }
            }

            is LedgerCardsEvent.OpenForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = true,
                    editingCard = event.cardToEdit,
                    formCardName = event.cardToEdit?.name ?: "",
                    formError = null
                )
            }

            is LedgerCardsEvent.CloseForm -> {
                _state.value = _state.value.copy(
                    isFormVisible = false,
                    editingCard = null,
                    formCardName = "",
                    formError = null
                )
            }

            is LedgerCardsEvent.UpdateFormCardName -> {
                _state.value = _state.value.copy(
                    formCardName = event.name,
                    formError = null
                )
            }

            is LedgerCardsEvent.RefreshCards -> loadCards()
        }
    }

    private fun loadCards(page: Int = 1, append: Boolean = false) {
        viewModelScope.launch {
            // Show appropriate loading indicator
            if (append) {
                _state.value = _state.value.copy(isLoadingMore = true, error = null)
            } else {
                _state.value = _state.value.copy(isLoading = true, error = null)
            }

            try {
                val result = getCardsUseCase(
                    page = page,
                    search = _state.value.searchQuery.ifBlank { null },
                    sortBy = "name",
                    sortOrder = "asc"
                )

                val newCards = if (append) {
                    _state.value.cards + result.data
                } else {
                    result.data
                }

                _state.value = _state.value.copy(
                    cards = newCards,
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

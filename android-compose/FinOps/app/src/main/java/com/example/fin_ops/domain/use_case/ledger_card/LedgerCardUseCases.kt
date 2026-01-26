package com.example.fin_ops.domain.use_case.ledger_card

import com.example.fin_ops.data.remote.dto.LedgerCardAutocompleteItem
import com.example.fin_ops.data.remote.dto.LedgerCardDto
import com.example.fin_ops.data.remote.dto.LedgerCardPaginatedData
import com.example.fin_ops.domain.repository.LedgerCardRepository
import javax.inject.Inject

class GetLedgerCardsUseCase @Inject constructor(private val repository: LedgerCardRepository) {
    suspend operator fun invoke(
        page: Int = 1, limit: Int = 50, search: String? = null,
        sortBy: String = "name", sortOrder: String = "asc"
    ): LedgerCardPaginatedData = repository.getCards(page, limit, search, sortBy, sortOrder)
}

class CreateLedgerCardUseCase @Inject constructor(private val repository: LedgerCardRepository) {
    suspend operator fun invoke(name: String): LedgerCardDto? = repository.createCard(name)
}

class UpdateLedgerCardUseCase @Inject constructor(private val repository: LedgerCardRepository) {
    suspend operator fun invoke(id: Int, name: String): LedgerCardDto? = repository.updateCard(id, name)
}

class DeleteLedgerCardUseCase @Inject constructor(private val repository: LedgerCardRepository) {
    suspend operator fun invoke(id: Int): Boolean = repository.deleteCard(id)
}

class SearchLedgerCardsUseCase @Inject constructor(private val repository: LedgerCardRepository) {
    suspend operator fun invoke(query: String): List<LedgerCardAutocompleteItem> = repository.getAutocomplete(query)
}
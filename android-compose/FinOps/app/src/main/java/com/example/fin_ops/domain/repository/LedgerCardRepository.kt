package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface LedgerCardRepository {
    suspend fun getCards(page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String): LedgerCardPaginatedData
    suspend fun createCard(name: String): LedgerCardDto?
    suspend fun updateCard(id: Int, name: String): LedgerCardDto?
    suspend fun deleteCard(id: Int): Boolean
    suspend fun getAutocomplete(search: String): List<LedgerCardAutocompleteItem>
}
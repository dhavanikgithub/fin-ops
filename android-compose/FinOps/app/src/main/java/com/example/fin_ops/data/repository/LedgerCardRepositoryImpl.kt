package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerCardRepository
import javax.inject.Inject

class LedgerCardRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : LedgerCardRepository {

    override suspend fun getCards(
        page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String
    ): LedgerCardPaginatedData {
        return apiService.getLedgerCards(page, limit, search, sortBy, sortOrder).data
    }

    override suspend fun createCard(name: String): LedgerCardDto? {
        return apiService.createLedgerCard(CreateLedgerCardRequest(name)).data
    }

    override suspend fun updateCard(id: Int, name: String): LedgerCardDto? {
        return apiService.updateLedgerCard(UpdateLedgerCardRequest(id, name)).data
    }

    override suspend fun deleteCard(id: Int): Boolean {
        return apiService.deleteLedgerCard(DeleteLedgerCardRequest(id)).success
    }

    override suspend fun getAutocomplete(search: String): List<LedgerCardAutocompleteItem> {
        return apiService.getLedgerCardAutocomplete(search).data.data
    }
}
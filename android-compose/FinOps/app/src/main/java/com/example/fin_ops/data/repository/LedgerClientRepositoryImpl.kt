package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerClientRepository
import javax.inject.Inject

class LedgerClientRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : LedgerClientRepository {

    override suspend fun getClients(
        page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String
    ): LedgerClientPaginatedData {
        return apiService.getLedgerClients(page, limit, search, sortBy, sortOrder).data
    }

    override suspend fun createClient(request: CreateLedgerClientRequest): LedgerClientDto? {
        return apiService.createLedgerClient(request).data
    }

    override suspend fun updateClient(request: UpdateLedgerClientRequest): LedgerClientDto? {
        return apiService.updateLedgerClient(request).data
    }

    override suspend fun deleteClient(id: Int): Boolean {
        return apiService.deleteLedgerClient(DeleteLedgerClientRequest(id)).success
    }

    override suspend fun getAutocomplete(search: String): List<LedgerClientAutocompleteItem> {
        return apiService.getLedgerClientAutocomplete(search).data.data
    }
}
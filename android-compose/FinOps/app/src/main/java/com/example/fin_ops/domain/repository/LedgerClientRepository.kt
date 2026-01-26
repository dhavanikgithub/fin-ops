package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface LedgerClientRepository {
    suspend fun getClients(page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String): LedgerClientPaginatedData
    suspend fun createClient(request: CreateLedgerClientRequest): LedgerClientDto?
    suspend fun updateClient(request: UpdateLedgerClientRequest): LedgerClientDto?
    suspend fun deleteClient(id: Int): Boolean
    suspend fun getAutocomplete(search: String): List<LedgerClientAutocompleteItem>
}
package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface LedgerBankRepository {
    suspend fun getBanks(page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String): LedgerBankPaginatedData
    suspend fun createBank(name: String): LedgerBankDto?
    suspend fun updateBank(id: Int, name: String): LedgerBankDto?
    suspend fun deleteBank(id: Int): Boolean
    suspend fun getAutocomplete(search: String): List<LedgerBankAutocompleteItem>
}
package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerBankRepository
import javax.inject.Inject

class LedgerBankRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : LedgerBankRepository {

    override suspend fun getBanks(
        page: Int, limit: Int, search: String?, sortBy: String, sortOrder: String
    ): LedgerBankPaginatedData {
        return apiService.getLedgerBanks(page, limit, search, sortBy, sortOrder).data
    }

    override suspend fun createBank(name: String): LedgerBankDto? {
        return apiService.createLedgerBank(CreateLedgerBankRequest(name)).data
    }

    override suspend fun updateBank(id: Int, name: String): LedgerBankDto? {
        return apiService.updateLedgerBank(UpdateLedgerBankRequest(id, name)).data
    }

    override suspend fun deleteBank(id: Int): Boolean {
        return apiService.deleteLedgerBank(DeleteLedgerBankRequest(id)).success
    }

    override suspend fun getAutocomplete(search: String): List<LedgerBankAutocompleteItem> {
        return apiService.getLedgerBankAutocomplete(search).data.data
    }
}
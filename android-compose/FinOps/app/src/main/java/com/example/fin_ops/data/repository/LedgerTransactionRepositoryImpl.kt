package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerTransactionRepository
import javax.inject.Inject

class LedgerTransactionRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : LedgerTransactionRepository {

    override suspend fun getTransactions(
        page: Int, limit: Int, search: String?, type: Int?, minAmount: Double?, maxAmount: Double?,
        startDate: String?, endDate: String?, sortBy: String, sortOrder: String
    ): LedgerTransactionPaginatedData {
        return apiService.getLedgerTransactions(
            page, limit, search, type, minAmount, maxAmount, startDate, endDate, sortBy, sortOrder
        ).data
    }

    override suspend fun createTransaction(req: CreateLedgerTransactionRequest): LedgerTransactionDto? {
        return apiService.createLedgerTransaction(req).data
    }

    override suspend fun updateTransaction(req: UpdateLedgerTransactionRequest): LedgerTransactionDto? {
        return apiService.updateLedgerTransaction(req).data
    }

    override suspend fun deleteTransaction(id: Int): Boolean {
        return apiService.deleteLedgerTransaction(DeleteLedgerTransactionRequest(id)).success
    }

    override suspend fun generateReport(startDate: String, endDate: String, clientId: String?): LedgerReportData {
        return apiService.generateLedgerReport(GenerateReportRequest(startDate, endDate, clientId)).data
    }
}
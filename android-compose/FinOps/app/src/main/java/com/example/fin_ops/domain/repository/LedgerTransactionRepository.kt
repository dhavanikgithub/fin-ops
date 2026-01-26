package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface LedgerTransactionRepository {
    suspend fun getTransactions(
        page: Int, limit: Int, search: String?, type: Int?, minAmount: Double?, maxAmount: Double?,
        startDate: String?, endDate: String?, sortBy: String, sortOrder: String
    ): LedgerTransactionPaginatedData

    suspend fun createTransaction(req: CreateLedgerTransactionRequest): LedgerTransactionDto?
    suspend fun updateTransaction(req: UpdateLedgerTransactionRequest): LedgerTransactionDto?
    suspend fun deleteTransaction(id: Int): Boolean
    suspend fun generateReport(startDate: String, endDate: String, clientId: String?): LedgerReportData
}
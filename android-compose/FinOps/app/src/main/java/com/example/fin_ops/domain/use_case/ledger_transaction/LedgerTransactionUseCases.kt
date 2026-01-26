package com.example.fin_ops.domain.use_case.ledger_transaction

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerTransactionRepository
import javax.inject.Inject

class GetLedgerTransactionsUseCase @Inject constructor(private val repository: LedgerTransactionRepository) {
    suspend operator fun invoke(
        page: Int = 1, limit: Int = 50, search: String? = null,
        type: Int? = null, minAmount: Double? = null, maxAmount: Double? = null,
        startDate: String? = null, endDate: String? = null,
        sortBy: String = "create_date", sortOrder: String = "desc"
    ) = repository.getTransactions(page, limit, search, type, minAmount, maxAmount, startDate, endDate, sortBy, sortOrder)
}

class CreateLedgerTransactionUseCase @Inject constructor(private val repository: LedgerTransactionRepository) {
    suspend operator fun invoke(req: CreateLedgerTransactionRequest) = repository.createTransaction(req)
}

class UpdateLedgerTransactionUseCase @Inject constructor(private val repository: LedgerTransactionRepository) {
    suspend operator fun invoke(req: UpdateLedgerTransactionRequest) = repository.updateTransaction(req)
}

class DeleteLedgerTransactionUseCase @Inject constructor(private val repository: LedgerTransactionRepository) {
    suspend operator fun invoke(id: Int) = repository.deleteTransaction(id)
}

class GenerateLedgerReportUseCase @Inject constructor(private val repository: LedgerTransactionRepository) {
    suspend operator fun invoke(startDate: String, endDate: String, clientId: String?) = repository.generateReport(startDate, endDate, clientId)
}
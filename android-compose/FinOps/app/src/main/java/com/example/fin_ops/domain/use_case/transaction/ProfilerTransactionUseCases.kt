package com.example.fin_ops.domain.use_case.transaction

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerTransactionRepository
import okhttp3.ResponseBody
import javax.inject.Inject

class GetTransactionsUseCase @Inject constructor(private val repository: ProfilerTransactionRepository) {
    suspend operator fun invoke(
        page: Int = 1,
        limit: Int = 10,
        search: String? = null,
        transactionType: String? = null,
        sortBy: String = "created_at",
        sortOrder: String = "desc",
        profileId: Int? = null
    ) = repository.getTransactions(page, limit, search, transactionType, sortBy, sortOrder, profileId)
}

class CreateDepositUseCase @Inject constructor(private val repository: ProfilerTransactionRepository) {
    suspend operator fun invoke(req: CreateDepositRequest) = repository.createDeposit(req)
}

class CreateWithdrawUseCase @Inject constructor(private val repository: ProfilerTransactionRepository) {
    suspend operator fun invoke(req: CreateWithdrawRequest) = repository.createWithdraw(req)
}

class DeleteTransactionUseCase @Inject constructor(private val repository: ProfilerTransactionRepository) {
    suspend operator fun invoke(id: Int) = repository.deleteTransaction(id)
}

class GetTransactionSummaryUseCase @Inject constructor(
    private val repository: ProfilerTransactionRepository
) {
    suspend operator fun invoke(profileId: Int) = repository.getSummary(profileId)
}

class ExportProfilePdfUseCase @Inject constructor(
    private val repository: ProfilerTransactionRepository
) {
    suspend operator fun invoke(profileId: Int): ResponseBody {
        return repository.exportPdf(profileId)
    }
}
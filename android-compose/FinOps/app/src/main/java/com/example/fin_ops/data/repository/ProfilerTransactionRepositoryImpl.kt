package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerTransactionRepository
import okhttp3.ResponseBody
import javax.inject.Inject

class ProfilerTransactionRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProfilerTransactionRepository {

    override suspend fun getTransactions(
        page: Int, limit: Int, search: String?,
        transactionType: String?, sortBy: String, sortOrder: String
    ): TransactionData {
        return apiService.getProfilerTransactions(
            page = page, limit = limit, search = search,
            transactionType = transactionType, sortBy = sortBy, sortOrder = sortOrder
        ).data
    }

    override suspend fun createDeposit(request: CreateDepositRequest): ProfilerTransactionDto {
        return apiService.createProfilerTransactionDeposit(request).data
    }

    override suspend fun createWithdraw(request: CreateWithdrawRequest): ProfilerTransactionDto {
        return apiService.createProfilerTransactionWithdraw(request).data
    }

    override suspend fun deleteTransaction(id: Int): Boolean {
        return apiService.deleteProfilerTransaction(DeleteTransactionRequest(id)).success
    }

    override suspend fun getSummary(profileId: Int): TransactionSummary {
        return apiService.getProfilerTransactionSummary(profileId).data.data
    }

    override suspend fun exportPdf(profileId: Int): ResponseBody {
        return apiService.exportProfilerTransactionPdf(profileId)
    }
}
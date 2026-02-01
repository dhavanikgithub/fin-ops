package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.CreateDepositRequest
import com.example.fin_ops.data.remote.dto.CreateWithdrawRequest
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.data.remote.dto.TransactionData
import com.example.fin_ops.data.remote.dto.TransactionSummary
import okhttp3.ResponseBody

interface ProfilerTransactionRepository {

    suspend fun getTransactions(
        page: Int,
        limit: Int,
        search: String?,
        transactionType: String?,
        sortBy: String,
        sortOrder: String,
        profileId: Int? = null
    ): TransactionData

    suspend fun createDeposit(request: CreateDepositRequest): ProfilerTransactionDto
    suspend fun createWithdraw(request: CreateWithdrawRequest): ProfilerTransactionDto
    suspend fun deleteTransaction(id: Int): Boolean
    suspend fun getSummary(profileId: Int): TransactionSummary
    suspend fun exportPdf(profileId: Int): ResponseBody
}
package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// Top-level response wrapper
data class TransactionResponse(
    val success: Boolean,
    val data: TransactionData,
    val successCode: String,
    val timestamp: String,
    val statusCode: Int,
    val message: String
)

// Contains the list of transactions, pagination, and summary
data class TransactionData(
    val data: List<ProfilerTransactionDto>,
    val pagination: Pagination, // Reusing Pagination from ProfilerProfileDto.kt
    @SerializedName("sort_applied")
    val sortApplied: SortApplied, // Reusing SortApplied from ProfilerProfileDto.kt
    val summary: TransactionSummary
)

// Represents a single transaction item
data class ProfilerTransactionDto(
    val id: Int,
    @SerializedName("profile_id")
    val profileId: Int,
    @SerializedName("transaction_type")
    val transactionType: String, // "withdraw" or "deposit"
    val amount: String,
    @SerializedName("withdraw_charges_percentage")
    val withdrawChargesPercentage: String?, // Nullable
    @SerializedName("withdraw_charges_amount")
    val withdrawChargesAmount: String?, // Nullable
    val notes: String?, // Nullable
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String,
    @SerializedName("client_name")
    val clientName: String,
    @SerializedName("bank_name")
    val bankName: String,
    @SerializedName("credit_card_number")
    val creditCardNumber: String,
    @SerializedName("profile_status")
    val profileStatus: String
)

// Represents the summary block in the response
data class TransactionSummary(
    @SerializedName("total_deposits")
    val totalDeposits: Double,
    @SerializedName("total_withdrawals")
    val totalWithdrawals: Double,
    @SerializedName("total_charges")
    val totalCharges: Double,
    @SerializedName("net_amount")
    val netAmount: Double,
    @SerializedName("transaction_difference")
    val transactionDifference: Double,
    @SerializedName("credit_uncountable")
    val creditUncountable: Double
)


data class SingleTransactionResponse(
    val success: Boolean,
    val data: ProfilerTransactionDto, // For /deposit, /withdraw, /{id} endpoints
    val message: String?
)

data class TransactionSummaryResponse(
    val success: Boolean,
    val data: TransactionSummaryData,
    val message: String?
)

data class TransactionSummaryData(
    val data: TransactionSummary // Nested inside 'data' property in schema
)


data class CreateDepositRequest(
    @SerializedName("profile_id")
    val profileId: Int,
    val amount: Double,
    val notes: String?
)

data class CreateWithdrawRequest(
    @SerializedName("profile_id")
    val profileId: Int,
    val amount: Double,
    @SerializedName("withdraw_charges_percentage")
    val withdrawChargesPercentage: Double?,
    val notes: String?
)

data class DeleteTransactionRequest(
    val id: Int
)
package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class LedgerTransactionResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerTransactionDto?
)

data class LedgerTransactionListResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: List<LedgerTransactionDto>
)

data class LedgerTransactionPaginatedResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerTransactionPaginatedData
)

data class LedgerTransactionPaginatedData(
    val data: List<LedgerTransactionDto>,
    val pagination: LedgerTransactionPagination,
    @SerializedName("filters_applied")
    val filtersApplied: Map<String, Any>?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied?
)

data class LedgerTransactionDto(
    val id: Int,
    @SerializedName("client_id")
    val clientId: Int,
    @SerializedName("transaction_type")
    val transactionType: Int, // 0 for Withdraw, 1 for Deposit
    @SerializedName("widthdraw_charges")
    val withdrawCharges: Double?,
    @SerializedName("transaction_amount")
    val transactionAmount: Double,
    @SerializedName("client_name")
    val clientName: String,
    @SerializedName("bank_id")
    val bankId: Int?,
    @SerializedName("bank_name")
    val bankName: String?,
    @SerializedName("card_id")
    val cardId: Int?,
    @SerializedName("card_name")
    val cardName: String?,
    val remark: String?,
    @SerializedName("create_date")
    val createDate: String?,
    @SerializedName("create_time")
    val createTime: String?
)

data class LedgerTransactionPagination(
    @SerializedName("current_page")
    val currentPage: Int,
    @SerializedName("per_page")
    val perPage: Int,
    @SerializedName("total_count")
    val totalCount: Int,
    @SerializedName("total_pages")
    val totalPages: Int,
    @SerializedName("has_next_page")
    val hasNextPage: Boolean,
    @SerializedName("has_previous_page")
    val hasPreviousPage: Boolean
)

data class LedgerReportResponse(
    val success: Boolean,
    val successCode: String?,
    val data: LedgerReportData
)

data class LedgerReportData(
    val pdfContent: String, // Base64
    val filename: String
)

// --- Requests ---

data class CreateLedgerTransactionRequest(
    @SerializedName("client_id")
    val clientId: Int,
    @SerializedName("transaction_type")
    val transactionType: Int,
    @SerializedName("widthdraw_charges")
    val withdrawCharges: Double,
    @SerializedName("transaction_amount")
    val transactionAmount: Double,
    @SerializedName("bank_id")
    val bankId: Int?,
    @SerializedName("card_id")
    val cardId: Int?,
    val remark: String?
)

data class UpdateLedgerTransactionRequest(
    val id: Int,
    @SerializedName("client_id")
    val clientId: Int?,
    @SerializedName("transaction_type")
    val transactionType: Int?,
    @SerializedName("widthdraw_charges")
    val withdrawCharges: Double?,
    @SerializedName("transaction_amount")
    val transactionAmount: Double?,
    @SerializedName("bank_id")
    val bankId: Int?,
    @SerializedName("card_id")
    val cardId: Int?,
    val remark: String?
)

data class DeleteLedgerTransactionRequest(
    val id: Int
)

data class GenerateReportRequest(
    val startDate: String,
    val endDate: String,
    val clientId: String?
)
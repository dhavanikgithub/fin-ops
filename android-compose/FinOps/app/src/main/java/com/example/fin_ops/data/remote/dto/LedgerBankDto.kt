package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class LedgerBankResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerBankDto?
)

data class LedgerBankListResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: List<LedgerBankDto>
)

data class LedgerBankPaginatedResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerBankPaginatedData
)

data class LedgerBankPaginatedData(
    val data: List<LedgerBankDto>,
    val pagination: LedgerBankPagination,
    @SerializedName("search_applied")
    val searchApplied: String?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied?
)

data class LedgerBankDto(
    val id: Int,
    val name: String,
    @SerializedName("create_date")
    val createDate: String?,
    @SerializedName("create_time")
    val createTime: String?,
    @SerializedName("modify_date")
    val modifyDate: String?,
    @SerializedName("modify_time")
    val modifyTime: String?,
    @SerializedName("transaction_count")
    val transactionCount: Int
)

data class LedgerBankPagination(
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

// --- Autocomplete ---

data class LedgerBankAutocompleteResponse(
    val success: Boolean,
    val data: LedgerBankAutocompleteData
)

data class LedgerBankAutocompleteData(
    val data: List<LedgerBankAutocompleteItem>,
    @SerializedName("search_query")
    val searchQuery: String?,
    @SerializedName("result_count")
    val resultCount: Int
)

data class LedgerBankAutocompleteItem(
    val id: Int,
    val name: String
)

// --- Requests ---

data class CreateLedgerBankRequest(
    val name: String
)

data class UpdateLedgerBankRequest(
    val id: Int,
    val name: String
)

data class DeleteLedgerBankRequest(
    val id: Int
)
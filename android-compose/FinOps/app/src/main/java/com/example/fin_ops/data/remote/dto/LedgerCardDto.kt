package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class LedgerCardResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerCardDto?
)

data class LedgerCardListResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: List<LedgerCardDto>
)

data class LedgerCardPaginatedResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerCardPaginatedData
)

data class LedgerCardPaginatedData(
    val data: List<LedgerCardDto>,
    val pagination: LedgerCardPagination,
    @SerializedName("search_applied")
    val searchApplied: String?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied?
)

data class LedgerCardDto(
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

data class LedgerCardPagination(
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

data class LedgerCardAutocompleteResponse(
    val success: Boolean,
    val data: LedgerCardAutocompleteData
)

data class LedgerCardAutocompleteData(
    val data: List<LedgerCardAutocompleteItem>,
    @SerializedName("search_query")
    val searchQuery: String?,
    @SerializedName("result_count")
    val resultCount: Int
)

data class LedgerCardAutocompleteItem(
    val id: Int,
    val name: String
)

// --- Requests ---

data class CreateLedgerCardRequest(
    val name: String
)

data class UpdateLedgerCardRequest(
    val id: Int,
    val name: String
)

data class DeleteLedgerCardRequest(
    val id: Int
)
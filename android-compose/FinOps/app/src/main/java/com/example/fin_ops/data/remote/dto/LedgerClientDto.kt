package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class LedgerClientResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerClientDto?
)

data class LedgerClientListResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: List<LedgerClientDto>
)

data class LedgerClientPaginatedResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: LedgerClientPaginatedData
)

data class LedgerClientPaginatedData(
    val data: List<LedgerClientDto>,
    val pagination: LedgerClientPagination,
    @SerializedName("search_applied")
    val searchApplied: String?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied?
)

data class LedgerClientDto(
    val id: Int,
    val name: String,
    val email: String?,
    val contact: String?,
    val address: String?,
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

data class LedgerClientPagination(
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

data class LedgerClientAutocompleteResponse(
    val success: Boolean,
    val data: LedgerClientAutocompleteData
)

data class LedgerClientAutocompleteData(
    val data: List<LedgerClientAutocompleteItem>,
    @SerializedName("search_query")
    val searchQuery: String?,
    @SerializedName("result_count")
    val resultCount: Int
)

data class LedgerClientAutocompleteItem(
    val id: Int,
    val name: String
)

// --- Requests ---

data class CreateLedgerClientRequest(
    val name: String,
    val email: String?,
    val contact: String?,
    val address: String?
)

data class UpdateLedgerClientRequest(
    val id: Int,
    val name: String,
    val email: String?,
    val contact: String?,
    val address: String?
)

data class DeleteLedgerClientRequest(
    val id: Int
)
package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class ProfilerBankResponse(
    val success: Boolean,
    val data: ProfilerBankData,
    val successCode: String,
    val message: String,
    val statusCode: Int
)

data class ProfilerBankData(
    val data: List<ProfilerBankDto>,
    val pagination: Pagination,
    @SerializedName("search_applied")
    val searchApplied: String?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied
)

data class ProfilerBankDto(
    val id: Int,
    @SerializedName("bank_name")
    val bankName: String,
    @SerializedName("profile_count")
    val profileCount: Int,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)

data class SingleProfilerBankResponse(
    val success: Boolean,
    val data: ProfilerBankDto, // The 'data' field directly contains the Bank object in SingleProfilerBankResponse schema
    val message: String
)

data class AutocompleteProfilerBankResponse(
    val success: Boolean,
    val data: AutocompleteProfilerBankData
)

data class AutocompleteProfilerBankData(
    val data: List<AutocompleteProfilerBankDto>,
    @SerializedName("total_count")
    val totalCount: Int
)

data class AutocompleteProfilerBankDto(
    val id: Int,
    @SerializedName("bank_name")
    val bankName: String,
    @SerializedName("profile_count")
    val profileCount: Int
)

// --- Requests ---

data class CreateProfilerBankRequest(
    @SerializedName("bank_name")
    val bankName: String
)

data class UpdateProfilerBankRequest(
    val id: Int,
    @SerializedName("bank_name")
    val bankName: String
)

data class DeleteProfilerBankRequest(
    val id: Int
)

// Reusing Pagination and SortApplied from ProfilerProfileDto.kt if accessible,
// otherwise they should be defined here as well.

package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ProfilerProfileResponse(
    val success: Boolean,
    val data: ProfilerProfileData,
    val successCode: String,
    val timestamp: String,
    val statusCode: Int,
    val message: String
)

data class ProfilerProfileData(
    val data: List<ProfilerProfileDto>,
    val pagination: Pagination,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied
)

data class ProfilerProfileDto(
    val id: Int,
    @SerializedName("client_id")
    val clientId: Int,
    @SerializedName("bank_id")
    val bankId: Int,
    @SerializedName("credit_card_number")
    val creditCardNumber: String,
    @SerializedName("pre_planned_deposit_amount")
    val prePlannedDepositAmount: String,
    @SerializedName("current_balance")
    val currentBalance: String,
    @SerializedName("total_withdrawn_amount")
    val totalWithdrawnAmount: String,
    @SerializedName("carry_forward_enabled")
    val carryForwardEnabled: Boolean,
    val status: String,
    val notes: String?,
    @SerializedName("marked_done_at")
    val markedDoneAt: String?,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String,
    @SerializedName("client_name")
    val clientName: String,
    @SerializedName("client_email")
    val clientEmail: String,
    @SerializedName("client_mobile")
    val clientMobile: String,
    @SerializedName("bank_name")
    val bankName: String,
    @SerializedName("remaining_balance")
    val remainingBalance: String,
    @SerializedName("transaction_count")
    val transactionCount: String
)

data class Pagination(
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

data class SortApplied(
    @SerializedName("sort_by")
    val sortBy: String,
    @SerializedName("sort_order")
    val sortOrder: String
)


data class SingleProfilerProfileResponse(
    val success: Boolean,
    val data: ProfilerProfileDto, // Wraps single ProfilerProfile
    val message: String?
)

data class AutocompleteProfilerProfileResponse(
    val success: Boolean,
    val data: AutocompleteProfilerProfileData
)

data class AutocompleteProfilerProfileData(
    val data: List<AutocompleteProfilerProfileDto>,
    @SerializedName("total_count")
    val totalCount: Int
)

data class AutocompleteProfilerProfileDto(
    val id: Int,
    @SerializedName("client_name")
    val clientName: String,
    @SerializedName("bank_name")
    val bankName: String,
    @SerializedName("credit_card_number")
    val creditCardNumber: String,
    @SerializedName("remaining_balance")
    val remainingBalance: Double,
    val status: String
)

// --- Requests ---

data class CreateProfilerProfileRequest(
    @SerializedName("client_id")
    val clientId: Int,
    @SerializedName("bank_id")
    val bankId: Int,
    @SerializedName("credit_card_number")
    val creditCardNumber: String,
    @SerializedName("pre_planned_deposit_amount")
    val prePlannedDepositAmount: Double,
    @SerializedName("carry_forward_enabled")
    val carryForwardEnabled: Boolean,
    val notes: String?
)

data class UpdateProfilerProfileRequest(
    val id: Int,
    @SerializedName("bank_id")
    val bankId: Int, // Required in schema
    @SerializedName("credit_card_number")
    val creditCardNumber: String?,
    @SerializedName("pre_planned_deposit_amount")
    val prePlannedDepositAmount: Double?,
    @SerializedName("carry_forward_enabled")
    val carryForwardEnabled: Boolean?,
    val notes: String?
)

data class MarkProfilerProfileDoneRequest(
    val id: Int
)

data class DeleteProfilerProfileRequest(
    val id: Int
)
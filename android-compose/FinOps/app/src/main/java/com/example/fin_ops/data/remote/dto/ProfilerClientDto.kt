package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class ProfilerClientResponse(
    val success: Boolean,
    val data: ProfilerClientData,
    val message: String?
)

data class SingleProfilerClientResponse(
    val success: Boolean,
    val data: ProfilerClientDto,
    val message: String?
)

data class ProfilerClientData(
    val data: List<ProfilerClientDto>,
    val pagination: Pagination,
    @SerializedName("search_applied")
    val searchApplied: String?,
    @SerializedName("sort_applied")
    val sortApplied: SortApplied?
)

data class ProfilerClientDto(
    val id: Int,
    val name: String,
    val email: String?,
    @SerializedName("mobile_number")
    val mobileNumber: String?,
    @SerializedName("aadhaar_card_number")
    val aadhaarCardNumber: String?,
    @SerializedName("aadhaar_card_image")
    val aadhaarCardImage: String?,
    val notes: String?,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String,
    @SerializedName("profile_count")
    val profileCount: Int
)

data class AutocompleteProfilerClientResponse(
    val success: Boolean,
    val data: AutocompleteProfilerClientData
)

data class AutocompleteProfilerClientData(
    val data: List<AutocompleteProfilerClientItem>,
    @SerializedName("total_count")
    val totalCount: Int
)

data class AutocompleteProfilerClientItem(
    val id: Int,
    val name: String,
    val email: String?,
    @SerializedName("mobile_number")
    val mobileNumber: String?,
    @SerializedName("profile_count")
    val profileCount: Int
)

// --- Requests ---

data class CreateProfilerClientRequest(
    val name: String,
    val email: String,
    @SerializedName("mobile_number")
    val mobileNumber: String,
    @SerializedName("aadhaar_card_number")
    val aadhaarCardNumber: String?,
    @SerializedName("aadhaar_card_image")
    val aadhaarCardImage: String?,
    val notes: String?
)

data class UpdateProfilerClientRequest(
    val id: Int,
    val name: String,
    val email: String,
    @SerializedName("mobile_number")
    val mobileNumber: String,
    @SerializedName("aadhaar_card_number")
    val aadhaarCardNumber: String?,
    @SerializedName("aadhaar_card_image")
    val aadhaarCardImage: String?,
    val notes: String?
)

data class DeleteProfilerClientRequest(
    val id: Int
)
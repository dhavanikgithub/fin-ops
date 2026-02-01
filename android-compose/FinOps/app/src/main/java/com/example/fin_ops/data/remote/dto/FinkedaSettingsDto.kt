package com.example.fin_ops.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Responses ---

data class FinkedaSettingsResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: FinkedaSettingsDto?
)

data class FinkedaSettingsHistoryResponse(
    val success: Boolean,
    val successCode: String?,
    val message: String?,
    val data: List<FinkedaSettingsHistoryDto>
)

data class FinkedaSettingsDto(
    val id: Int,
    @SerializedName("rupay_card_charge_amount")
    val rupayCardChargeAmount: Float,
    @SerializedName("master_card_charge_amount")
    val masterCardChargeAmount: Float,
    @SerializedName("create_date")
    val createDate: String?,
    @SerializedName("create_time")
    val createTime: String?,
    @SerializedName("modify_date")
    val modifyDate: String?,
    @SerializedName("modify_time")
    val modifyTime: String?
)

data class FinkedaSettingsHistoryDto(
    val id: Int,
    @SerializedName("calculator_settings_id")
    val calculatorSettingsId: Int,
    @SerializedName("previous_rupay_amount")
    val previousRupayAmount: Float,
    @SerializedName("previous_master_amount")
    val previousMasterAmount: Float,
    @SerializedName("new_rupay_amount")
    val newRupayAmount: Float,
    @SerializedName("new_master_amount")
    val newMasterAmount: Float,
    @SerializedName("create_date")
    val createDate: String?,
    @SerializedName("create_time")
    val createTime: String?
)

// --- Requests ---

data class UpdateFinkedaSettingsRequest(
    @SerializedName("rupay_card_charge_amount")
    val rupayCardChargeAmount: Float,
    @SerializedName("master_card_charge_amount")
    val masterCardChargeAmount: Float
)
package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.FinkedaSettingsDto
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryDto
import com.example.fin_ops.data.remote.dto.UpdateFinkedaSettingsRequest
import com.example.fin_ops.domain.repository.FinkedaSettingsRepository
import javax.inject.Inject

class FinkedaSettingsRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : FinkedaSettingsRepository {

    override suspend fun getSettings(): FinkedaSettingsDto? {
        return apiService.getFinkedaSettings().data
    }

    override suspend fun updateSettings(rupayAmount: Float, masterAmount: Float): FinkedaSettingsDto? {
        val request = UpdateFinkedaSettingsRequest(
            rupayCardChargeAmount = rupayAmount,
            masterCardChargeAmount = masterAmount
        )
        return apiService.updateFinkedaSettings(request).data
    }

    override suspend fun getSettingsHistory(): List<FinkedaSettingsHistoryDto> {
        return apiService.getFinkedaSettingsHistory().data
    }
}
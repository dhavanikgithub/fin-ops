package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.FinkedaSettingsDto
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryDto

interface FinkedaSettingsRepository {
    suspend fun getSettings(): FinkedaSettingsDto?
    suspend fun updateSettings(rupayAmount: Float, masterAmount: Float): FinkedaSettingsDto?
    suspend fun getSettingsHistory(): List<FinkedaSettingsHistoryDto>
}
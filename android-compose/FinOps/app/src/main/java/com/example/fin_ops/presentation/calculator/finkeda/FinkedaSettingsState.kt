package com.example.fin_ops.presentation.calculator.finkeda


import com.example.fin_ops.data.remote.dto.FinkedaSettingsDto
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryDto

data class FinkedaSettingsState(
    val settings: FinkedaSettingsDto? = null,
    val history: List<FinkedaSettingsHistoryDto> = emptyList(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)
package com.example.fin_ops.domain.use_case.finkeda

import com.example.fin_ops.data.remote.dto.FinkedaSettingsDto
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryDto
import com.example.fin_ops.domain.repository.FinkedaSettingsRepository
import javax.inject.Inject

class GetFinkedaSettingsUseCase @Inject constructor(
    private val repository: FinkedaSettingsRepository
) {
    suspend operator fun invoke(): FinkedaSettingsDto? {
        return repository.getSettings()
    }
}

class UpdateFinkedaSettingsUseCase @Inject constructor(
    private val repository: FinkedaSettingsRepository
) {
    suspend operator fun invoke(rupayAmount: Float, masterAmount: Float): FinkedaSettingsDto? {
        return repository.updateSettings(rupayAmount, masterAmount)
    }
}

class GetFinkedaHistoryUseCase @Inject constructor(
    private val repository: FinkedaSettingsRepository
) {
    suspend operator fun invoke(): List<FinkedaSettingsHistoryDto> {
        return repository.getSettingsHistory()
    }
}
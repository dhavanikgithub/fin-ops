package com.example.fin_ops.domain.use_case.core

import com.example.fin_ops.data.remote.dto.ApiInfoResponse
import com.example.fin_ops.domain.repository.HealthRepository
import javax.inject.Inject

class GetApiInfoUseCase @Inject constructor(
    private val repository: HealthRepository
) {
    suspend operator fun invoke(): ApiInfoResponse {
        return repository.getApiInfo()
    }
}
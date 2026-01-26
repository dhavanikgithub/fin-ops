package com.example.fin_ops.domain.use_case.core

import com.example.fin_ops.data.remote.dto.HealthResponse
import com.example.fin_ops.domain.repository.HealthRepository
import javax.inject.Inject

class GetSystemHealthUseCase @Inject constructor(
    private val repository: HealthRepository
) {
    suspend operator fun invoke(): HealthResponse {
        return repository.getHealthStatus()
    }
}
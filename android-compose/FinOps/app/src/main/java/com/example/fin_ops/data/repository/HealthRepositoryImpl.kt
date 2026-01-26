package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.ApiInfoResponse
import com.example.fin_ops.data.remote.dto.HealthResponse
import com.example.fin_ops.domain.repository.HealthRepository
import javax.inject.Inject

class HealthRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : HealthRepository {

    override suspend fun getApiInfo(): ApiInfoResponse {
        return apiService.getApiInfo()
    }

    override suspend fun getHealthStatus(): HealthResponse {
        return apiService.getSystemHealth()
    }
}
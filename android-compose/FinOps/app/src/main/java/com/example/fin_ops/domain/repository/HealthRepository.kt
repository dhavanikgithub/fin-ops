package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.ApiInfoResponse
import com.example.fin_ops.data.remote.dto.HealthResponse

interface HealthRepository {
    suspend fun getApiInfo(): ApiInfoResponse
    suspend fun getHealthStatus(): HealthResponse
}
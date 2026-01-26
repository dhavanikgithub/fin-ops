package com.example.fin_ops.presentation.core

import com.example.fin_ops.data.remote.dto.ApiInfoResponse
import com.example.fin_ops.data.remote.dto.HealthResponse

data class HealthState(
    val apiInfo: ApiInfoResponse? = null,
    val healthStatus: HealthResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)
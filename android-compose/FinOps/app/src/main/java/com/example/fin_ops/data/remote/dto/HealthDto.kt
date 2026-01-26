package com.example.fin_ops.data.remote.dto

// --- Responses ---

data class ApiInfoResponse(
    val name: String?,
    val version: String?,
    val environment: String?,
    val endpoints: Any? // Can be Map<String, String> or generic Object depending on API strictness
)

data class HealthResponse(
    val status: String,
    val timestamp: String?,
    val uptime: Double?,
    val environment: String?,
    val version: String?,
    val apiVersion: String?
)
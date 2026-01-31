package com.example.fin_ops.presentation.settings

import com.example.fin_ops.data.remote.dto.HealthResponse

data class SettingsState(
    val serverStatus: ServerStatus = ServerStatus.CHECKING,
    val lastHealthCheck: HealthResponse? = null,
    val lastSuccessfulCheckTime: Long? = null,
    val healthCheckError: String? = null,
    val isCheckingHealth: Boolean = false,
    val isMonitoring: Boolean = false
)

enum class ServerStatus {
    CHECKING,      // Initial/loading state
    CONNECTED,     // Health check successful, status = "UP"
    DISCONNECTED,  // Network error or timeout
    DEGRADED,      // Health check returned but status != "UP"
    ERROR          // Other errors
}

sealed class SettingsEvent {
    object StartHealthMonitoring : SettingsEvent()
    object StopHealthMonitoring : SettingsEvent()
    object CheckHealthNow : SettingsEvent()
}

package com.example.fin_ops.presentation.settings

import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.domain.use_case.core.GetSystemHealthUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val getSystemHealthUseCase: GetSystemHealthUseCase
) : ViewModel() {

    private val _state = mutableStateOf(SettingsState())
    val state: State<SettingsState> = _state

    private var healthMonitoringJob: Job? = null

    fun onEvent(event: SettingsEvent) {
        when (event) {
            is SettingsEvent.StartHealthMonitoring -> startHealthMonitoring()
            is SettingsEvent.StopHealthMonitoring -> stopHealthMonitoring()
            is SettingsEvent.CheckHealthNow -> checkHealth()
        }
    }

    private fun startHealthMonitoring() {
        if (_state.value.isMonitoring) return

        _state.value = _state.value.copy(isMonitoring = true)

        healthMonitoringJob?.cancel()
        healthMonitoringJob = viewModelScope.launch {
            checkHealth() // Immediate first check
            while (isActive) {
                delay(30_000L) // 30 seconds
                checkHealth()
            }
        }
    }

    private fun stopHealthMonitoring() {
        healthMonitoringJob?.cancel()
        healthMonitoringJob = null
        _state.value = _state.value.copy(isMonitoring = false)
    }

    private fun checkHealth() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isCheckingHealth = true)

            try {
                val response = getSystemHealthUseCase()

                val status = when (response.status.uppercase()) {
                    "OK" -> ServerStatus.CONNECTED
                    else -> ServerStatus.DISCONNECTED
                }

                _state.value = _state.value.copy(
                    serverStatus = status,
                    lastHealthCheck = response,
                    lastSuccessfulCheckTime = System.currentTimeMillis(),
                    healthCheckError = null,
                    isCheckingHealth = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    serverStatus = ServerStatus.DISCONNECTED,
                    healthCheckError = e.message ?: "Connection failed",
                    isCheckingHealth = false
                )
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopHealthMonitoring()
    }
}

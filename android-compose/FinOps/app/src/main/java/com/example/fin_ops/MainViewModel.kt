package com.example.fin_ops

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.ThemeStorage
import com.example.fin_ops.domain.repository.HealthRepository
import com.example.fin_ops.utils.NetworkConnectivityObserver
import com.example.fin_ops.utils.NetworkStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.Job
enum class AppTheme {
    LIGHT, DARK, SYSTEM
}
// Define the connection states
sealed class ConnectivityState {
    object Connected : ConnectivityState()
    object NoInternet : ConnectivityState()
    object ServerDown : ConnectivityState()
}
@HiltViewModel
class MainViewModel @Inject constructor(
    private val themeStorage: ThemeStorage,
    private val healthRepository: HealthRepository,
    private val networkObserver: NetworkConnectivityObserver
) : ViewModel() {

    // 1. Observe DataStore as a StateFlow
    // "SharingStarted.Eagerly" ensures it loads immediately when the app starts
    val currentTheme: StateFlow<AppTheme> = themeStorage.theme
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = AppTheme.SYSTEM // Initial value before DataStore loads
        )

    // 2. Save to DataStore
    fun setTheme(theme: AppTheme) {
        viewModelScope.launch {
            themeStorage.setTheme(theme)
        }
    }

    // --- Connectivity Logic ---
    private val _connectionState = mutableStateOf<ConnectivityState>(ConnectivityState.Connected)
    val connectionState: State<ConnectivityState> = _connectionState

    private var serverPollJob: Job? = null

    init {
        observeNetwork()
    }

    private fun observeNetwork() {
        viewModelScope.launch {
            networkObserver.observe().collectLatest { status ->
                when (status) {
                    NetworkStatus.Available -> {
                        // Internet is back, check Server immediately then poll
                        checkServerHealth()
                        startServerPolling()
                    }
                    NetworkStatus.Unavailable, NetworkStatus.Lost -> {
                        // Device offline
                        stopServerPolling()
                        _connectionState.value = ConnectivityState.NoInternet
                    }
                    NetworkStatus.Losing -> { /* Ignore flickering */ }
                }
            }
        }
    }

    private fun startServerPolling() {
        serverPollJob?.cancel()
        serverPollJob = viewModelScope.launch {
            while (true) {
                delay(10_000) // Poll every 10 seconds
                checkServerHealth()
            }
        }
    }

    private fun stopServerPolling() {
        serverPollJob?.cancel()
    }

    private suspend fun checkServerHealth() {
        try {
            // Call your Health API
            healthRepository.getHealthStatus()
            // If successful, we are connected
            if (_connectionState.value != ConnectivityState.Connected) {
                _connectionState.value = ConnectivityState.Connected
            }
        } catch (e: Exception) {
            // If API fails (timeout/500/unreachable)
            _connectionState.value = ConnectivityState.ServerDown
        }
    }
}

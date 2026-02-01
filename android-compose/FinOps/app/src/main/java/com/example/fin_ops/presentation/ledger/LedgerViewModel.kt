package com.example.fin_ops.presentation.ledger

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.ExportConfig
import com.example.fin_ops.data.local.ExportConfigStorage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

// --- 2. ViewModel & State ---
data class LedgerState(
    val isLoading: Boolean = true,
    val recentExports: List<ExportConfig> = emptyList()
)

@HiltViewModel
class LedgerViewModel @Inject constructor(
    private val exportConfigStorage: ExportConfigStorage
) : ViewModel() {
    var state by mutableStateOf(LedgerState())
        private set

    init {
        loadData()
        loadRecentExports()
    }

    private fun loadData() {
        viewModelScope.launch {
            state = state.copy(isLoading = true)
            delay(2500) // Simulate delay
            state = state.copy(isLoading = false)
        }
    }

    private fun loadRecentExports() {
        viewModelScope.launch {
            exportConfigStorage.recentExports.collectLatest { exports ->
                state = state.copy(recentExports = exports)
            }
        }
    }
}
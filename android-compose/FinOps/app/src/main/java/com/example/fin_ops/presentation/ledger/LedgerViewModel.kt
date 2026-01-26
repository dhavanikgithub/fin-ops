package com.example.fin_ops.presentation.ledger

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

// --- 2. ViewModel & State ---
data class LedgerState(
    val isLoading: Boolean = true,
    // Add real data classes here if needed (e.g. balances, transactions)
)

@HiltViewModel
class LedgerViewModel @Inject constructor() : ViewModel() {
    var state by mutableStateOf(LedgerState())
        private set

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            state = state.copy(isLoading = true)
            delay(2500) // Simulate delay
            state = state.copy(isLoading = false)
        }
    }
}
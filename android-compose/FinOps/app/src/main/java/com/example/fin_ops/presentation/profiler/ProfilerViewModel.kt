package com.example.fin_ops.presentation.profiler

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.TransactionData
import com.example.fin_ops.domain.use_case.profile.GetProfilesUseCase
import com.example.fin_ops.domain.use_case.transaction.GetTransactionsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject


@HiltViewModel
class ProfilerViewModel @Inject constructor(
    private val getProfilesUseCase: GetProfilesUseCase,
    private val getProfilerTransactionsUseCase: GetTransactionsUseCase
) : ViewModel() {

    private val _state = mutableStateOf(ProfilerState())
    val state: State<ProfilerState> = _state

    private val _transactionsState = mutableStateOf(TransactionState())
    val transactionsState: State<TransactionState> = _transactionsState


    init {
        getProfiles()
        getTransactions()
    }

    private fun getTransactions() {
        viewModelScope.launch {
            _transactionsState.value = transactionsState.value.copy(
                isLoading = true
            )
            try {
                val transactions = getProfilerTransactionsUseCase()
                _transactionsState.value = transactionsState.value.copy(
                    transactions = transactions,
                    isLoading = false
                )

            } catch (e: Exception) {
                _transactionsState.value = transactionsState.value.copy(
                    error = e.message ?: "An unexpected error occurred",
                    isLoading = false
                )
            }
        }
    }

    private fun getProfiles() {
        viewModelScope.launch {
            _state.value = state.value.copy(
                isLoading = true
            )
            try {
                val profiles = getProfilesUseCase(page = 1).data
                _state.value = state.value.copy(
                    profiles = profiles,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = state.value.copy(
                    error = e.message ?: "An unexpected error occurred",
                    isLoading = false
                )
            }
        }
    }
}
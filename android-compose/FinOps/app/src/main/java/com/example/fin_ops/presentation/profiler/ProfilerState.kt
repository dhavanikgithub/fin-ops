package com.example.fin_ops.presentation.profiler

import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.TransactionData

data class ProfilerState(
    val profiles: List<ProfilerProfileDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String = ""
)
data class TransactionState(
    val transactions: TransactionData? = null,
    val isLoading: Boolean = false,
    val error: String = ""
)
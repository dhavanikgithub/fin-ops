package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface ProfilerBankRepository {
    suspend fun getBanks(
        page: Int,
        search: String?,
        sortBy: String = "bank_name",
        sortOrder: String = "asc",
        hasProfiles: Boolean? = null
    ): ProfilerBankData

    suspend fun createBank(name: String): ProfilerBankDto
    suspend fun updateBank(id: Int, name: String): ProfilerBankDto
    suspend fun deleteBank(id: Int): Boolean
    suspend fun getAutocomplete(search: String): List<AutocompleteProfilerBankDto>
}
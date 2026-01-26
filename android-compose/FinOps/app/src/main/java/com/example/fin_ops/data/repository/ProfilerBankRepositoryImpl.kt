package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerBankRepository
import javax.inject.Inject

class ProfilerBankRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProfilerBankRepository {

    override suspend fun getBanks(page: Int, search: String?): ProfilerBankData {
        return apiService.getProfilerBanks(page = page, search = search).data
    }

    override suspend fun createBank(name: String): ProfilerBankDto {
        return apiService.createProfilerBank(CreateProfilerBankRequest(name)).data
    }

    override suspend fun updateBank(id: Int, name: String): ProfilerBankDto {
        return apiService.updateProfilerBank(UpdateProfilerBankRequest(id, name)).data
    }

    override suspend fun deleteBank(id: Int): Boolean {
        return apiService.deleteProfilerBank(DeleteProfilerBankRequest(id)).success
    }

    override suspend fun getAutocomplete(search: String): List<AutocompleteProfilerBankDto> {
        return apiService.getProfilerBankAutocomplete(search = search).data.data
    }
}
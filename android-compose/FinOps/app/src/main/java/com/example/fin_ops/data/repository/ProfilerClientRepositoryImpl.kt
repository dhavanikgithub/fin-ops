package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerClientRepository
import javax.inject.Inject

class ProfilerClientRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProfilerClientRepository {

    override suspend fun getClients(
        page: Int, limit: Int, search: String?, hasProfiles: Boolean?, sortBy: String, sortOrder: String
    ): ProfilerClientData {
        return apiService.getProfilerClients(page, limit, search, hasProfiles, sortBy, sortOrder).data
    }

    override suspend fun createClient(request: CreateProfilerClientRequest): ProfilerClientDto {
        return apiService.createProfilerClient(request).data
    }

    override suspend fun updateClient(request: UpdateProfilerClientRequest): ProfilerClientDto {
        return apiService.updateProfilerClient(request).data
    }

    override suspend fun deleteClient(id: Int): Boolean {
        return apiService.deleteProfilerClient(DeleteProfilerClientRequest(id)).success
    }

    override suspend fun getAutocomplete(search: String): List<AutocompleteProfilerClientItem> {
        return apiService.getProfilerClientAutocomplete(search = search).data.data
    }
}
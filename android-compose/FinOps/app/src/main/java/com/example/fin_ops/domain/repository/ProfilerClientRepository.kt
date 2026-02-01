package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.*

interface ProfilerClientRepository {
    suspend fun getClients(
        page: Int, limit: Int, search: String?, hasProfiles: Boolean?, sortBy: String, sortOrder: String
    ): ProfilerClientData

    suspend fun createClient(request: CreateProfilerClientRequest): ProfilerClientDto
    suspend fun updateClient(request: UpdateProfilerClientRequest): ProfilerClientDto
    suspend fun deleteClient(id: Int): Boolean
    suspend fun getAutocomplete(search: String): List<AutocompleteProfilerClientItem>
}
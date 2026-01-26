package com.example.fin_ops.domain.use_case.client

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerClientRepository
import javax.inject.Inject

class GetClientsUseCase @Inject constructor(private val repository: ProfilerClientRepository) {
    suspend operator fun invoke(
        page: Int = 1, limit: Int = 10, search: String? = null,
        hasProfiles: Boolean? = null, sortBy: String = "name", sortOrder: String = "asc"
    ) = repository.getClients(page, limit, search, hasProfiles, sortBy, sortOrder)
}

class CreateClientUseCase @Inject constructor(private val repository: ProfilerClientRepository) {
    suspend operator fun invoke(req: CreateProfilerClientRequest) = repository.createClient(req)
}

class UpdateClientUseCase @Inject constructor(private val repository: ProfilerClientRepository) {
    suspend operator fun invoke(req: UpdateProfilerClientRequest) = repository.updateClient(req)
}

class DeleteClientUseCase @Inject constructor(private val repository: ProfilerClientRepository) {
    suspend operator fun invoke(id: Int) = repository.deleteClient(id)
}

class SearchClientsUseCase @Inject constructor(private val repository: ProfilerClientRepository) {
    suspend operator fun invoke(query: String) = repository.getAutocomplete(query)
}
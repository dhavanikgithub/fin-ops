package com.example.fin_ops.domain.use_case.ledger_client

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.LedgerClientRepository
import javax.inject.Inject

class GetLedgerClientsUseCase @Inject constructor(private val repository: LedgerClientRepository) {
    suspend operator fun invoke(
        page: Int = 1, limit: Int = 50, search: String? = null,
        sortBy: String = "name", sortOrder: String = "asc"
    ): LedgerClientPaginatedData = repository.getClients(page, limit, search, sortBy, sortOrder)
}

class CreateLedgerClientUseCase @Inject constructor(private val repository: LedgerClientRepository) {
    suspend operator fun invoke(req: CreateLedgerClientRequest): LedgerClientDto? = repository.createClient(req)
}

class UpdateLedgerClientUseCase @Inject constructor(private val repository: LedgerClientRepository) {
    suspend operator fun invoke(req: UpdateLedgerClientRequest): LedgerClientDto? = repository.updateClient(req)
}

class DeleteLedgerClientUseCase @Inject constructor(private val repository: LedgerClientRepository) {
    suspend operator fun invoke(id: Int): Boolean = repository.deleteClient(id)
}

class SearchLedgerClientsUseCase @Inject constructor(private val repository: LedgerClientRepository) {
    suspend operator fun invoke(query: String): List<LedgerClientAutocompleteItem> = repository.getAutocomplete(query)
}
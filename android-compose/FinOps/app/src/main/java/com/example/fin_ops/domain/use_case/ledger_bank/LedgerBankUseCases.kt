package com.example.fin_ops.domain.use_case.ledger_bank

import com.example.fin_ops.data.remote.dto.LedgerBankAutocompleteItem
import com.example.fin_ops.data.remote.dto.LedgerBankDto
import com.example.fin_ops.data.remote.dto.LedgerBankPaginatedData
import com.example.fin_ops.domain.repository.LedgerBankRepository
import javax.inject.Inject

class GetLedgerBanksUseCase @Inject constructor(private val repository: LedgerBankRepository) {
    suspend operator fun invoke(
        page: Int = 1, limit: Int = 50, search: String? = null,
        sortBy: String = "name", sortOrder: String = "asc"
    ): LedgerBankPaginatedData = repository.getBanks(page, limit, search, sortBy, sortOrder)
}

class CreateLedgerBankUseCase @Inject constructor(private val repository: LedgerBankRepository) {
    suspend operator fun invoke(name: String): LedgerBankDto? = repository.createBank(name)
}

class UpdateLedgerBankUseCase @Inject constructor(private val repository: LedgerBankRepository) {
    suspend operator fun invoke(id: Int, name: String): LedgerBankDto? = repository.updateBank(id, name)
}

class DeleteLedgerBankUseCase @Inject constructor(private val repository: LedgerBankRepository) {
    suspend operator fun invoke(id: Int): Boolean = repository.deleteBank(id)
}

class SearchLedgerBanksUseCase @Inject constructor(private val repository: LedgerBankRepository) {
    suspend operator fun invoke(query: String): List<LedgerBankAutocompleteItem> = repository.getAutocomplete(query)
}
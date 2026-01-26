package com.example.fin_ops.domain.use_case.bank

import com.example.fin_ops.data.remote.dto.AutocompleteProfilerBankDto
import com.example.fin_ops.data.remote.dto.ProfilerBankData
import com.example.fin_ops.data.remote.dto.ProfilerBankDto
import com.example.fin_ops.domain.repository.ProfilerBankRepository
import javax.inject.Inject

class GetBanksUseCase @Inject constructor(private val repository: ProfilerBankRepository) {
    suspend operator fun invoke(page: Int, search: String? = null): ProfilerBankData =
        repository.getBanks(page, search)
}

class CreateBankUseCase @Inject constructor(private val repository: ProfilerBankRepository) {
    suspend operator fun invoke(name: String): ProfilerBankDto =
        repository.createBank(name)
}

class UpdateBankUseCase @Inject constructor(private val repository: ProfilerBankRepository) {
    suspend operator fun invoke(id: Int, name: String): ProfilerBankDto =
        repository.updateBank(id, name)
}

class DeleteBankUseCase @Inject constructor(private val repository: ProfilerBankRepository) {
    suspend operator fun invoke(id: Int): Boolean =
        repository.deleteBank(id)
}

class SearchBanksUseCase @Inject constructor(private val repository: ProfilerBankRepository) {
    suspend operator fun invoke(query: String): List<AutocompleteProfilerBankDto> =
        repository.getAutocomplete(query)
}
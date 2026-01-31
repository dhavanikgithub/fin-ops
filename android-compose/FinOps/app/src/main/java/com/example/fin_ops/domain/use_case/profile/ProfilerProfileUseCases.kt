package com.example.fin_ops.domain.use_case.profile

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerProfileRepository
import javax.inject.Inject

class GetProfilesUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(
        page: Int,
        limit: Int = 10,
        search: String? = null,
        clientId: String? = null,
        bankId: String? = null,
        status: String? = null,
        carryForwardEnabled: Boolean? = null,
        hasPositiveBalance: Boolean? = null,
        hasNegativeBalance: Boolean? = null,
        balanceGreaterThan: Double? = null,
        balanceLessThan: Double? = null,
        createdAtStart: String? = null,
        createdAtEnd: String? = null,
        prePlannedDepositAmount: Double? = null,
        minDepositAmount: Double? = null,
        maxDepositAmount: Double? = null,
        sortBy: String = "created_at",
        sortOrder: String = "desc"
    ) = repository.getProfiles(
        page = page,
        limit = limit,
        search = search,
        clientId = clientId,
        bankId = bankId,
        status = status,
        carryForwardEnabled = carryForwardEnabled,
        hasPositiveBalance = hasPositiveBalance,
        hasNegativeBalance = hasNegativeBalance,
        balanceGreaterThan = balanceGreaterThan,
        balanceLessThan = balanceLessThan,
        createdAtStart = createdAtStart,
        createdAtEnd = createdAtEnd,
        prePlannedDepositAmount = prePlannedDepositAmount,
        minDepositAmount = minDepositAmount,
        maxDepositAmount = maxDepositAmount,
        sortBy = sortBy,
        sortOrder = sortOrder
    )
}

class GetDashboardUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(page: Int) = repository.getDashboardProfiles(page)
}

class CreateProfileUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(req: CreateProfilerProfileRequest) = repository.createProfile(req)
}

class UpdateProfileUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(req: UpdateProfilerProfileRequest) = repository.updateProfile(req)
}

class DeleteProfileUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(id: Int) = repository.deleteProfile(id)
}

class MarkProfileDoneUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(id: Int) = repository.markProfileDone(id)
}
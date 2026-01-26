package com.example.fin_ops.domain.use_case.profile

import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerProfileRepository
import javax.inject.Inject

class GetProfilesUseCase @Inject constructor(private val repository: ProfilerProfileRepository) {
    suspend operator fun invoke(
        page: Int, limit: Int = 10, search: String? = null, status: String? = null,
        sortBy: String = "created_at", sortOrder: String = "desc"
    ) = repository.getProfiles(page, limit, search, status, sortBy, sortOrder)
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
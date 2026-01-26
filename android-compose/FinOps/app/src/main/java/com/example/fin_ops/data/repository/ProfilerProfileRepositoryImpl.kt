package com.example.fin_ops.data.repository

import com.example.fin_ops.data.remote.ApiService
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.repository.ProfilerProfileRepository
import javax.inject.Inject

class ProfilerProfileRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProfilerProfileRepository {

    override suspend fun getProfiles(
        page: Int, limit: Int, search: String?, status: String?, sortBy: String, sortOrder: String
    ): ProfilerProfileData {
        return apiService.getProfilerProfiles(page, limit, search, status = status, sortBy = sortBy, sortOrder = sortOrder).data
    }

    override suspend fun getDashboardProfiles(page: Int): ProfilerProfileData {
        return apiService.getProfilerDashboardProfiles(page = page).data
    }

    override suspend fun createProfile(request: CreateProfilerProfileRequest): ProfilerProfileDto {
        return apiService.createProfilerProfile(request).data
    }

    override suspend fun updateProfile(request: UpdateProfilerProfileRequest): ProfilerProfileDto {
        return apiService.updateProfilerProfile(request).data
    }

    override suspend fun deleteProfile(id: Int): Boolean {
        return apiService.deleteProfilerProfile(DeleteProfilerProfileRequest(id)).success
    }

    override suspend fun markProfileDone(id: Int): ProfilerProfileDto {
        return apiService.markProfilerProfileDone(MarkProfilerProfileDoneRequest(id)).data
    }
}
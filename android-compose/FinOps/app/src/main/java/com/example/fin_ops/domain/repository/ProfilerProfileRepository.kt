
package com.example.fin_ops.domain.repository

import com.example.fin_ops.data.remote.dto.CreateProfilerProfileRequest
import com.example.fin_ops.data.remote.dto.ProfilerProfileData
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.UpdateProfilerProfileRequest

interface ProfilerProfileRepository {
    suspend fun getProfiles(page: Int, limit: Int, search: String?, status: String?, sortBy: String, sortOrder: String): ProfilerProfileData
    suspend fun getDashboardProfiles(page: Int): ProfilerProfileData
    suspend fun createProfile(request: CreateProfilerProfileRequest): ProfilerProfileDto
    suspend fun updateProfile(request: UpdateProfilerProfileRequest): ProfilerProfileDto
    suspend fun deleteProfile(id: Int): Boolean
    suspend fun markProfileDone(id: Int): ProfilerProfileDto
}

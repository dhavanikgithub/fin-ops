package com.example.fin_ops.presentation.profiler.profiles

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.remote.dto.*
import com.example.fin_ops.domain.use_case.profile.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfilesState(
    val profiles: List<ProfilerProfileDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pagination: Pagination? = null,
    val currentPage: Int = 1,
    val searchQuery: String = "",
    val filterStatus: String? = "active",
    val currentSortBy: String = "created_at",
    val currentSortOrder: String = "desc",
    val isDashboardMode: Boolean = false,
    val isFormVisible: Boolean = false,
    val editingProfile: ProfilerProfileDto? = null
)

sealed class ProfilesEvent {
    data class LoadPage(val page: Int) : ProfilesEvent()
    object Refresh : ProfilesEvent()
    data class Search(val query: String) : ProfilesEvent()
    data class ToggleDashboardMode(val enabled: Boolean) : ProfilesEvent()
    data class ChangeStatusFilter(val status: String?) : ProfilesEvent()
    data class DeleteProfile(val id: Int) : ProfilesEvent()
    data class MarkDone(val id: Int) : ProfilesEvent()
    data class SaveProfile(val createReq: CreateProfilerProfileRequest?, val updateReq: UpdateProfilerProfileRequest?) : ProfilesEvent()
    data class OpenForm(val profile: ProfilerProfileDto? = null) : ProfilesEvent()
    object CloseForm : ProfilesEvent()
}

@HiltViewModel
class ProfilesViewModel @Inject constructor(
    private val getProfilesUseCase: GetProfilesUseCase,
    private val getDashboardUseCase: GetDashboardUseCase,
    private val createProfileUseCase: CreateProfileUseCase,
    private val updateProfileUseCase: UpdateProfileUseCase,
    private val deleteProfileUseCase: DeleteProfileUseCase,
    private val markProfileDoneUseCase: MarkProfileDoneUseCase
) : ViewModel() {

    private val _state = mutableStateOf(ProfilesState())
    val state: State<ProfilesState> = _state
    private var job: Job? = null

    init { loadData() }

    fun onEvent(event: ProfilesEvent) {
        when (event) {
            is ProfilesEvent.LoadPage -> loadData(page = event.page)
            is ProfilesEvent.Refresh -> loadData()
            is ProfilesEvent.Search -> {
                _state.value = _state.value.copy(searchQuery = event.query)
                job?.cancel()
                job = viewModelScope.launch { delay(500); loadData(1) }
            }
            is ProfilesEvent.ToggleDashboardMode -> {
                _state.value = _state.value.copy(isDashboardMode = event.enabled, currentPage = 1)
                loadData()
            }
            is ProfilesEvent.ChangeStatusFilter -> {
                _state.value = _state.value.copy(filterStatus = event.status, currentPage = 1)
                loadData()
            }
            is ProfilesEvent.DeleteProfile -> performAction { deleteProfileUseCase(event.id) }
            is ProfilesEvent.MarkDone -> performAction { markProfileDoneUseCase(event.id) }
            is ProfilesEvent.SaveProfile -> performAction {
                if (event.updateReq != null) updateProfileUseCase(event.updateReq)
                else if (event.createReq != null) createProfileUseCase(event.createReq)
                _state.value = _state.value.copy(isFormVisible = false)
            }
            is ProfilesEvent.OpenForm -> _state.value = _state.value.copy(isFormVisible = true, editingProfile = event.profile)
            is ProfilesEvent.CloseForm -> _state.value = _state.value.copy(isFormVisible = false, editingProfile = null)
        }
    }

    private fun loadData(page: Int = _state.value.currentPage) {
        job?.cancel()
        job = viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, currentPage = page)
            try {
                val result = if (_state.value.isDashboardMode) {
                    getDashboardUseCase(page)
                } else {
                    getProfilesUseCase(
                        page, search = _state.value.searchQuery.ifBlank { null },
                        status = _state.value.filterStatus,
                        sortBy = _state.value.currentSortBy,
                        sortOrder = _state.value.currentSortOrder
                    )
                }
                _state.value = _state.value.copy(profiles = result.data, pagination = result.pagination, isLoading = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun performAction(action: suspend () -> Unit) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try { action(); loadData() }
            catch (e: Exception) { _state.value = _state.value.copy(isLoading = false, error = e.message) }
        }
    }
}
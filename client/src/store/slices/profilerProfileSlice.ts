import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfilerProfile, ProfilerProfilePaginationInfo, ProfilerProfileSortApplied } from '../../services/profilerProfileService';
import { 
    fetchProfilerProfiles,
    fetchDashboardProfiles,
    loadMoreProfilerProfiles, 
    searchProfilerProfiles, 
    sortProfilerProfiles,
    getProfilerProfileById,
    fetchProfilerProfileById,
    getProfilesByClient,
    createProfilerProfile,
    updateProfilerProfile,
    markProfilerProfileDone,
    deleteProfilerProfile
} from '../actions/profilerProfileActions';

export interface ProfilerProfileState {
    profiles: ProfilerProfile[];
    selectedProfile: ProfilerProfile | null;
    pagination: ProfilerProfilePaginationInfo | null;
    searchQuery: string;
    sortConfig: ProfilerProfileSortApplied;
    loading: boolean;
    loadingMore: boolean;
    creating: boolean;
    savingProfileIds: number[];
    deletingProfileIds: number[];
    markingDoneIds: number[];
    error: string | null;
    hasMore: boolean;
}

const initialState: ProfilerProfileState = {
    profiles: [],
    selectedProfile: null,
    pagination: null,
    searchQuery: '',
    sortConfig: {
        sort_by: 'created_at',
        sort_order: 'desc',
    },
    loading: false,
    loadingMore: false,
    creating: false,
    savingProfileIds: [],
    deletingProfileIds: [],
    markingDoneIds: [],
    error: null,
    hasMore: false,
};

const profilerProfileSlice = createSlice({
    name: 'profilerProfiles',
    initialState,
    reducers: {
        clearProfilerProfiles: (state) => {
            state.profiles = [];
            state.pagination = null;
            state.error = null;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedProfilerProfile: (state, action: PayloadAction<ProfilerProfile | null>) => {
            state.selectedProfile = action.payload;
        },
        setSortConfig: (state, action: PayloadAction<ProfilerProfileSortApplied>) => {
            state.sortConfig = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetProfilerProfileState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchProfilerProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler profiles';
                state.profiles = [];
                state.pagination = null;
            })
            .addCase(fetchDashboardProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchDashboardProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch dashboard profiles';
                state.profiles = [];
                state.pagination = null;
            })
            .addCase(loadMoreProfilerProfiles.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreProfilerProfiles.fulfilled, (state, action) => {
                state.loadingMore = false;
                state.profiles = [...state.profiles, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreProfilerProfiles.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more profiler profiles';
            })
            .addCase(searchProfilerProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProfilerProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchProfilerProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search profiler profiles';
            })
            .addCase(sortProfilerProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortProfilerProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortProfilerProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort profiler profiles';
            })
            .addCase(getProfilerProfileById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfilerProfileById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProfile = action.payload.data;
                state.error = null;
            })
            .addCase(getProfilerProfileById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler profile';
            })
            .addCase(fetchProfilerProfileById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerProfileById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProfile = action.payload.data;
                state.error = null;
            })
            .addCase(fetchProfilerProfileById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler profile';
            })
            .addCase(getProfilesByClient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfilesByClient.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.error = null;
            })
            .addCase(getProfilesByClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiles by client';
            })
            .addCase(createProfilerProfile.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createProfilerProfile.fulfilled, (state, action) => {
                state.creating = false;
                state.profiles = [action.payload.data, ...state.profiles];
                state.error = null;
            })
            .addCase(createProfilerProfile.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create profiler profile';
            })
            .addCase(updateProfilerProfile.pending, (state, action) => {
                const profileId = action.meta.arg.id;
                if (!state.savingProfileIds.includes(profileId)) {
                    state.savingProfileIds.push(profileId);
                }
                state.error = null;
            })
            .addCase(updateProfilerProfile.fulfilled, (state, action) => {
                const profileId = action.payload.data.id;
                state.savingProfileIds = state.savingProfileIds.filter(id => id !== profileId);
                const index = state.profiles.findIndex(p => p.id === profileId);
                if (index !== -1) {
                    state.profiles[index] = action.payload.data;
                }
                if (state.selectedProfile?.id === profileId) {
                    state.selectedProfile = action.payload.data;
                }
                state.error = null;
            })
            .addCase(updateProfilerProfile.rejected, (state, action) => {
                const profileId = action.meta.arg.id;
                state.savingProfileIds = state.savingProfileIds.filter(id => id !== profileId);
                state.error = action.payload || 'Failed to update profiler profile';
            })
            .addCase(markProfilerProfileDone.pending, (state, action) => {
                const profileId = action.meta.arg.id;
                if (!state.markingDoneIds.includes(profileId)) {
                    state.markingDoneIds.push(profileId);
                }
                state.error = null;
            })
            .addCase(markProfilerProfileDone.fulfilled, (state, action) => {
                const profileId = action.payload.data.id;
                state.markingDoneIds = state.markingDoneIds.filter(id => id !== profileId);
                const index = state.profiles.findIndex(p => p.id === profileId);
                if (index !== -1) {
                    state.profiles[index] = action.payload.data;
                }
                if (state.selectedProfile?.id === profileId) {
                    state.selectedProfile = action.payload.data;
                }
                state.error = null;
            })
            .addCase(markProfilerProfileDone.rejected, (state, action) => {
                const profileId = action.meta.arg.id;
                state.markingDoneIds = state.markingDoneIds.filter(id => id !== profileId);
                state.error = action.payload || 'Failed to mark profile as done';
            })
            .addCase(deleteProfilerProfile.pending, (state, action) => {
                const profileId = action.meta.arg.id;
                if (!state.deletingProfileIds.includes(profileId)) {
                    state.deletingProfileIds.push(profileId);
                }
                state.error = null;
            })
            .addCase(deleteProfilerProfile.fulfilled, (state, action) => {
                const profileId = action.meta.arg.id;
                state.deletingProfileIds = state.deletingProfileIds.filter(id => id !== profileId);
                state.profiles = state.profiles.filter(p => p.id !== profileId);
                if (state.selectedProfile?.id === profileId) {
                    state.selectedProfile = null;
                }
                state.error = null;
            })
            .addCase(deleteProfilerProfile.rejected, (state, action) => {
                const profileId = action.meta.arg.id;
                state.deletingProfileIds = state.deletingProfileIds.filter(id => id !== profileId);
                state.error = action.payload || 'Failed to delete profiler profile';
            });
    }
});

export const { 
    clearProfilerProfiles, 
    setSearchQuery, 
    setSelectedProfilerProfile, 
    setSortConfig, 
    clearError, 
    resetProfilerProfileState 
} = profilerProfileSlice.actions;

export default profilerProfileSlice.reducer;

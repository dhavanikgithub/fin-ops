import { createAsyncThunk } from '@reduxjs/toolkit';
import profilerProfileService, { 
    ProfilerProfileAutocompleteFilters, 
    ProfilerProfileAutocompleteResponse, 
    ProfilerProfileFilters, 
    ProfilerProfilePaginatedResponse,
    CreateProfilerProfileRequest,
    UpdateProfilerProfileRequest,
    MarkProfileDoneRequest,
    DeleteProfilerProfileRequest,
    ProfilerProfileResponse,
    DeleteProfilerProfileResponse
} from '../../services/profilerProfileService';
import { RootState } from '../index';

// Fetch profiler profiles with filters and sorting
export const fetchProfilerProfiles = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    ProfilerProfileFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'profilerProfiles/fetchProfiles',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.profilerProfiles;

            const requestFilters: ProfilerProfileFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await profilerProfileService.getPaginatedProfiles(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler profiles'
            );
        }
    }
);

// Fetch dashboard profiles (active with positive balance)
export const fetchDashboardProfiles = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    Omit<ProfilerProfileFilters, 'status' | 'has_positive_balance'> | undefined,
    { rejectValue: string; state: RootState }
>(
    'profilerProfiles/fetchDashboard',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.profilerProfiles;

            const requestFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await profilerProfileService.getDashboardProfiles(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch dashboard profiles'
            );
        }
    }
);

// Load more profiler profiles for infinite scroll
export const loadMoreProfilerProfiles = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'profilerProfiles/loadMoreProfiles',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig, pagination } = state.profilerProfiles;

            if (!pagination?.has_next_page) {
                throw new Error('No more profiler profiles to load');
            }

            const requestFilters: ProfilerProfileFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerProfileService.getPaginatedProfiles(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more profiler profiles'
            );
        }
    }
);

// Search profiler profiles with current sort
export const searchProfilerProfiles = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'profilerProfiles/searchProfiles',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { sortConfig } = state.profilerProfiles;

            const requestFilters: ProfilerProfileFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerProfileService.getPaginatedProfiles(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search profiler profiles'
            );
        }
    }
);

// Sort profiler profiles
export const sortProfilerProfiles = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'profilerProfiles/sortProfiles',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery } = state.profilerProfiles;

            const requestFilters: ProfilerProfileFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerProfileService.getPaginatedProfiles(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort profiler profiles'
            );
        }
    }
);

// Get profiler profile by ID
export const getProfilerProfileById = createAsyncThunk<
    ProfilerProfileResponse,
    number,
    { rejectValue: string }
>(
    'profilerProfiles/getProfileById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.getProfileById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler profile'
            );
        }
    }
);

// Fetch profiler profile by ID and set as selected
export const fetchProfilerProfileById = createAsyncThunk<
    ProfilerProfileResponse,
    { id: number },
    { rejectValue: string }
>(
    'profilerProfiles/fetchProfileById',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.getProfileById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler profile'
            );
        }
    }
);

// Get profiles by client ID
export const getProfilesByClient = createAsyncThunk<
    ProfilerProfilePaginatedResponse,
    number,
    { rejectValue: string }
>(
    'profilerProfiles/getByClient',
    async (clientId, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.getProfilesByClient(clientId);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiles by client'
            );
        }
    }
);

// Create profiler profile
export const createProfilerProfile = createAsyncThunk<
    ProfilerProfileResponse,
    CreateProfilerProfileRequest,
    { rejectValue: string }
>(
    'profilerProfiles/createProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.createProfile(profileData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create profiler profile'
            );
        }
    }
);

// Update profiler profile
export const updateProfilerProfile = createAsyncThunk<
    ProfilerProfileResponse,
    UpdateProfilerProfileRequest,
    { rejectValue: string }
>(
    'profilerProfiles/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.updateProfile(profileData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update profiler profile'
            );
        }
    }
);

// Mark profile as done
export const markProfilerProfileDone = createAsyncThunk<
    ProfilerProfileResponse,
    MarkProfileDoneRequest,
    { rejectValue: string }
>(
    'profilerProfiles/markDone',
    async (markDoneData, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.markProfileDone(markDoneData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to mark profile as done'
            );
        }
    }
);

// Delete profiler profile
export const deleteProfilerProfile = createAsyncThunk<
    DeleteProfilerProfileResponse,
    DeleteProfilerProfileRequest,
    { rejectValue: string }
>(
    'profilerProfiles/deleteProfile',
    async (deleteData, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.deleteProfile(deleteData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete profiler profile'
            );
        }
    }
);

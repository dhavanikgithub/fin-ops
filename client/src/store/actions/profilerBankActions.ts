import { createAsyncThunk } from '@reduxjs/toolkit';
import profilerBankService, { 
    ProfilerBankAutocompleteFilters, 
    ProfilerBankAutocompleteResponse, 
    ProfilerBankFilters, 
    ProfilerBankPaginatedResponse,
    CreateProfilerBankRequest,
    UpdateProfilerBankRequest,
    DeleteProfilerBankRequest,
    ProfilerBankResponse,
    DeleteProfilerBankResponse
} from '../../services/profilerBankService';
import { RootState } from '../index';

// Fetch profiler banks with filters and sorting
export const fetchProfilerBanks = createAsyncThunk<
    ProfilerBankPaginatedResponse,
    ProfilerBankFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'profilerBanks/fetchBanks',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.profilerBanks;

            const requestFilters: ProfilerBankFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await profilerBankService.getPaginatedBanks(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler banks'
            );
        }
    }
);

// Load more profiler banks for infinite scroll
export const loadMoreProfilerBanks = createAsyncThunk<
    ProfilerBankPaginatedResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'profilerBanks/loadMoreBanks',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig, pagination } = state.profilerBanks;

            if (!pagination?.has_next_page) {
                throw new Error('No more profiler banks to load');
            }

            const requestFilters: ProfilerBankFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerBankService.getPaginatedBanks(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more profiler banks'
            );
        }
    }
);

// Search profiler banks with current sort
export const searchProfilerBanks = createAsyncThunk<
    ProfilerBankPaginatedResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'profilerBanks/searchBanks',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { sortConfig } = state.profilerBanks;

            const requestFilters: ProfilerBankFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerBankService.getPaginatedBanks(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search profiler banks'
            );
        }
    }
);

// Sort profiler banks
export const sortProfilerBanks = createAsyncThunk<
    ProfilerBankPaginatedResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'profilerBanks/sortBanks',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery } = state.profilerBanks;

            const requestFilters: ProfilerBankFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerBankService.getPaginatedBanks(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort profiler banks'
            );
        }
    }
);

// Get profiler bank by ID
export const getProfilerBankById = createAsyncThunk<
    ProfilerBankResponse,
    number,
    { rejectValue: string }
>(
    'profilerBanks/getBankById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await profilerBankService.getBankById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler bank'
            );
        }
    }
);

// Create profiler bank
export const createProfilerBank = createAsyncThunk<
    ProfilerBankResponse,
    CreateProfilerBankRequest,
    { rejectValue: string }
>(
    'profilerBanks/createBank',
    async (bankData, { rejectWithValue }) => {
        try {
            const response = await profilerBankService.createBank(bankData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create profiler bank'
            );
        }
    }
);

// Update profiler bank
export const updateProfilerBank = createAsyncThunk<
    ProfilerBankResponse,
    UpdateProfilerBankRequest,
    { rejectValue: string }
>(
    'profilerBanks/updateBank',
    async (bankData, { rejectWithValue }) => {
        try {
            const response = await profilerBankService.updateBank(bankData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update profiler bank'
            );
        }
    }
);

// Delete profiler bank
export const deleteProfilerBank = createAsyncThunk<
    DeleteProfilerBankResponse,
    DeleteProfilerBankRequest,
    { rejectValue: string }
>(
    'profilerBanks/deleteBank',
    async (deleteData, { rejectWithValue }) => {
        try {
            const response = await profilerBankService.deleteBank(deleteData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete profiler bank'
            );
        }
    }
);

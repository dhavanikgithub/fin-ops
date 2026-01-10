import { createAsyncThunk } from '@reduxjs/toolkit';
import profilerClientService, { 
    ProfilerClientAutocompleteFilters, 
    ProfilerClientAutocompleteResponse, 
    ProfilerClientFilters, 
    ProfilerClientPaginatedResponse,
    CreateProfilerClientRequest,
    UpdateProfilerClientRequest,
    DeleteProfilerClientRequest,
    ProfilerClientResponse,
    DeleteProfilerClientResponse
} from '../../services/profilerClientService';
import { RootState } from '../index';

// Fetch profiler clients with filters and sorting
export const fetchProfilerClients = createAsyncThunk<
    ProfilerClientPaginatedResponse,
    ProfilerClientFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'profilerClients/fetchClients',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.profilerClients;

            const requestFilters: ProfilerClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await profilerClientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler clients'
            );
        }
    }
);

// Load more profiler clients for infinite scroll
export const loadMoreProfilerClients = createAsyncThunk<
    ProfilerClientPaginatedResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'profilerClients/loadMoreClients',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig, pagination } = state.profilerClients;

            if (!pagination?.has_next_page) {
                throw new Error('No more profiler clients to load');
            }

            const requestFilters: ProfilerClientFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerClientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more profiler clients'
            );
        }
    }
);

// Search profiler clients with current sort
export const searchProfilerClients = createAsyncThunk<
    ProfilerClientPaginatedResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'profilerClients/searchClients',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { sortConfig } = state.profilerClients;

            const requestFilters: ProfilerClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerClientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search profiler clients'
            );
        }
    }
);

// Sort profiler clients
export const sortProfilerClients = createAsyncThunk<
    ProfilerClientPaginatedResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'profilerClients/sortClients',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery } = state.profilerClients;

            const requestFilters: ProfilerClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerClientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort profiler clients'
            );
        }
    }
);

// Get profiler client by ID
export const getProfilerClientById = createAsyncThunk<
    ProfilerClientResponse,
    number,
    { rejectValue: string }
>(
    'profilerClients/getClientById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await profilerClientService.getClientById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler client'
            );
        }
    }
);

// Create profiler client
export const createProfilerClient = createAsyncThunk<
    ProfilerClientResponse,
    CreateProfilerClientRequest,
    { rejectValue: string }
>(
    'profilerClients/createClient',
    async (clientData, { rejectWithValue }) => {
        try {
            const response = await profilerClientService.createClient(clientData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create profiler client'
            );
        }
    }
);

// Update profiler client
export const updateProfilerClient = createAsyncThunk<
    ProfilerClientResponse,
    UpdateProfilerClientRequest,
    { rejectValue: string }
>(
    'profilerClients/updateClient',
    async (clientData, { rejectWithValue }) => {
        try {
            const response = await profilerClientService.updateClient(clientData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update profiler client'
            );
        }
    }
);

// Delete profiler client
export const deleteProfilerClient = createAsyncThunk<
    DeleteProfilerClientResponse,
    DeleteProfilerClientRequest,
    { rejectValue: string }
>(
    'profilerClients/deleteClient',
    async (deleteData, { rejectWithValue }) => {
        try {
            const response = await profilerClientService.deleteClient(deleteData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete profiler client'
            );
        }
    }
);

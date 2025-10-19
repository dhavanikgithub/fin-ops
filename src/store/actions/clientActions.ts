import { createAsyncThunk } from '@reduxjs/toolkit';
import clientService, { ClientAutocompleteFilters, ClientAutocompleteResponse, ClientFilters, ClientPaginatedResponse } from '../../services/clientService';
import { RootState } from '../index';

// Fetch clients with filters and sorting
export const fetchClients = createAsyncThunk<
    ClientPaginatedResponse,
    ClientFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'clients/fetchClients',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.clients;

            const requestFilters: ClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await clientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch clients'
            );
        }
    }
);

// Load more clients for infinite scroll
export const loadMoreClients = createAsyncThunk<
    ClientPaginatedResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'clients/loadMoreClients',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig, pagination } = state.clients;

            if (!pagination?.has_next_page) {
                throw new Error('No more clients to load');
            }

            const requestFilters: ClientFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await clientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more clients'
            );
        }
    }
);

// Search clients with current sort
export const searchClients = createAsyncThunk<
    ClientPaginatedResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'clients/searchClients',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { sortConfig } = state.clients;

            const requestFilters: ClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await clientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search clients'
            );
        }
    }
);

// Sort clients
export const sortClients = createAsyncThunk<
    ClientPaginatedResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'clients/sortClients',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery } = state.clients;

            const requestFilters: ClientFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await clientService.getPaginatedClients(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort clients'
            );
        }
    }
);

// Fetch client autocomplete data
export const fetchClientAutocomplete = createAsyncThunk<
    ClientAutocompleteResponse['data'],
    ClientAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'clientAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await clientService.getClientAutocomplete(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch client autocomplete data'
            );
        }
    }
);
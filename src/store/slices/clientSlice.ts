import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientPaginationInfo, ClientSortApplied } from '../../services/clientService';
import { fetchClients, loadMoreClients, searchClients, sortClients } from '../actions/clientActions';

export interface ClientState {
    clients: Client[];
    pagination: ClientPaginationInfo | null;
    searchQuery: string;
    sortConfig: ClientSortApplied;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
}

const initialState: ClientState = {
    clients: [],
    pagination: null,
    searchQuery: '',
    sortConfig: {
        sort_by: 'name',
        sort_order: 'asc',
    },
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
};

const clientSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {
        // Clear clients
        clearClients: (state) => {
            state.clients = [];
            state.pagination = null;
            state.error = null;
        },

        // Set search query
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        // Set sort configuration
        setSortConfig: (state, action: PayloadAction<ClientSortApplied>) => {
            state.sortConfig = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset state
        resetClientState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch clients
        builder
            .addCase(fetchClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch clients';
                state.clients = [];
                state.pagination = null;
            })

        // Load more clients
        builder
            .addCase(loadMoreClients.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreClients.fulfilled, (state, action) => {
                state.loadingMore = false;
                // Append new clients to existing ones
                state.clients = [...state.clients, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreClients.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more clients';
            })

        // Search clients
        builder
            .addCase(searchClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search clients';
            })

        // Sort clients
        builder
            .addCase(sortClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort clients';
            });
    },
});

export const {
    clearClients,
    setSearchQuery,
    setSortConfig,
    clearError,
    resetClientState,
} = clientSlice.actions;

export default clientSlice.reducer;
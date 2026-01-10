import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfilerClient, ProfilerClientPaginationInfo, ProfilerClientSortApplied } from '../../services/profilerClientService';
import { 
    fetchProfilerClients, 
    loadMoreProfilerClients, 
    searchProfilerClients, 
    sortProfilerClients,
    getProfilerClientById,
    createProfilerClient,
    updateProfilerClient,
    deleteProfilerClient
} from '../actions/profilerClientActions';

export interface ProfilerClientState {
    clients: ProfilerClient[];
    selectedClient: ProfilerClient | null;
    pagination: ProfilerClientPaginationInfo | null;
    searchQuery: string;
    sortConfig: ProfilerClientSortApplied;
    loading: boolean;
    loadingMore: boolean;
    creating: boolean;
    savingClientIds: number[];
    deletingClientIds: number[];
    error: string | null;
    hasMore: boolean;
}

const initialState: ProfilerClientState = {
    clients: [],
    selectedClient: null,
    pagination: null,
    searchQuery: '',
    sortConfig: {
        sort_by: 'name',
        sort_order: 'asc',
    },
    loading: false,
    loadingMore: false,
    creating: false,
    savingClientIds: [],
    deletingClientIds: [],
    error: null,
    hasMore: false,
};

const profilerClientSlice = createSlice({
    name: 'profilerClients',
    initialState,
    reducers: {
        clearProfilerClients: (state) => {
            state.clients = [];
            state.pagination = null;
            state.error = null;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedProfilerClient: (state, action: PayloadAction<ProfilerClient | null>) => {
            state.selectedClient = action.payload;
        },
        setSortConfig: (state, action: PayloadAction<ProfilerClientSortApplied>) => {
            state.sortConfig = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetProfilerClientState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch profiler clients
        builder
            .addCase(fetchProfilerClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchProfilerClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler clients';
                state.clients = [];
                state.pagination = null;
            })

        // Load more profiler clients
        builder
            .addCase(loadMoreProfilerClients.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreProfilerClients.fulfilled, (state, action) => {
                state.loadingMore = false;
                state.clients = [...state.clients, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreProfilerClients.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more profiler clients';
            })

        // Search profiler clients
        builder
            .addCase(searchProfilerClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProfilerClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchProfilerClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search profiler clients';
            })

        // Sort profiler clients
        builder
            .addCase(sortProfilerClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortProfilerClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortProfilerClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort profiler clients';
            })

        // Get profiler client by ID
        builder
            .addCase(getProfilerClientById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfilerClientById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedClient = action.payload.data;
                state.error = null;
            })
            .addCase(getProfilerClientById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler client';
            })

        // Create profiler client
        builder
            .addCase(createProfilerClient.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createProfilerClient.fulfilled, (state, action) => {
                state.creating = false;
                state.clients = [action.payload.data, ...state.clients];
                state.error = null;
            })
            .addCase(createProfilerClient.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create profiler client';
            })

        // Update profiler client
        builder
            .addCase(updateProfilerClient.pending, (state, action) => {
                const clientId = action.meta.arg.id;
                if (!state.savingClientIds.includes(clientId)) {
                    state.savingClientIds.push(clientId);
                }
                state.error = null;
            })
            .addCase(updateProfilerClient.fulfilled, (state, action) => {
                const clientId = action.payload.data.id;
                state.savingClientIds = state.savingClientIds.filter(id => id !== clientId);
                const index = state.clients.findIndex(c => c.id === clientId);
                if (index !== -1) {
                    state.clients[index] = action.payload.data;
                }
                if (state.selectedClient?.id === clientId) {
                    state.selectedClient = action.payload.data;
                }
                state.error = null;
            })
            .addCase(updateProfilerClient.rejected, (state, action) => {
                const clientId = action.meta.arg.id;
                state.savingClientIds = state.savingClientIds.filter(id => id !== clientId);
                state.error = action.payload || 'Failed to update profiler client';
            })

        // Delete profiler client
        builder
            .addCase(deleteProfilerClient.pending, (state, action) => {
                const clientId = action.meta.arg.id;
                if (!state.deletingClientIds.includes(clientId)) {
                    state.deletingClientIds.push(clientId);
                }
                state.error = null;
            })
            .addCase(deleteProfilerClient.fulfilled, (state, action) => {
                const clientId = action.meta.arg.id;
                state.deletingClientIds = state.deletingClientIds.filter(id => id !== clientId);
                state.clients = state.clients.filter(c => c.id !== clientId);
                if (state.selectedClient?.id === clientId) {
                    state.selectedClient = null;
                }
                state.error = null;
            })
            .addCase(deleteProfilerClient.rejected, (state, action) => {
                const clientId = action.meta.arg.id;
                state.deletingClientIds = state.deletingClientIds.filter(id => id !== clientId);
                state.error = action.payload || 'Failed to delete profiler client';
            });
    }
});

export const { 
    clearProfilerClients, 
    setSearchQuery, 
    setSelectedProfilerClient, 
    setSortConfig, 
    clearError, 
    resetProfilerClientState 
} = profilerClientSlice.actions;

export default profilerClientSlice.reducer;

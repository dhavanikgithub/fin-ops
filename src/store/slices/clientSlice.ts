import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientPaginationInfo, ClientSortApplied } from '../../services/clientService';
import { 
    fetchClients, 
    loadMoreClients, 
    searchClients, 
    sortClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../actions/clientActions';

export interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    pagination: ClientPaginationInfo | null;
    searchQuery: string;
    sortConfig: ClientSortApplied;
    loading: boolean;
    loadingMore: boolean;
    creating: boolean;
    savingClientIds: number[];
    deletingClientIds: number[];
    error: string | null;
    hasMore: boolean;
}

const initialState: ClientState = {
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

        // Set selected client
        setSelectedClient: (state, action: PayloadAction<Client | null>) => {
            state.selectedClient = action.payload;
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
            })

        // Get client by ID
        builder
            .addCase(getClientById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getClientById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedClient = action.payload.data;
                state.error = null;
            })
            .addCase(getClientById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch client';
            })

        // Create client
        builder
            .addCase(createClient.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.creating = false;
                // Add the new client to the beginning of the list
                state.clients = [action.payload.data, ...state.clients];
                state.error = null;
            })
            .addCase(createClient.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create client';
            })

        // Update client
        builder
            .addCase(updateClient.pending, (state, action) => {
                const clientId = action.meta.arg.id;
                if (!state.savingClientIds.includes(clientId)) {
                    state.savingClientIds.push(clientId);
                }
                state.error = null;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                const clientId = action.payload.data.id;
                state.savingClientIds = state.savingClientIds.filter(id => id !== clientId);
                // Update the client in the list
                const index = state.clients.findIndex(client => client.id === clientId);
                if (index !== -1) {
                    state.clients[index] = action.payload.data;
                }
                // Update selected client if it's the same one
                if (state.selectedClient?.id === clientId) {
                    state.selectedClient = action.payload.data;
                }
                state.error = null;
            })
            .addCase(updateClient.rejected, (state, action) => {
                const clientId = action.meta.arg.id;
                state.savingClientIds = state.savingClientIds.filter(id => id !== clientId);
                state.error = action.payload || 'Failed to update client';
            })

        // Delete client
        builder
            .addCase(deleteClient.pending, (state, action) => {
                const clientId = action.meta.arg.id;
                if (!state.deletingClientIds.includes(clientId)) {
                    state.deletingClientIds.push(clientId);
                }
                state.error = null;
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                const clientId = action.payload.data.id;
                state.deletingClientIds = state.deletingClientIds.filter(id => id !== clientId);
                // Remove the client from the list
                state.clients = state.clients.filter(client => client.id !== clientId);
                // Clear selected client if it's the deleted one
                if (state.selectedClient?.id === clientId) {
                    state.selectedClient = null;
                }
                state.error = null;
            })
            .addCase(deleteClient.rejected, (state, action) => {
                const clientId = action.meta.arg.id;
                state.deletingClientIds = state.deletingClientIds.filter(id => id !== clientId);
                state.error = action.payload || 'Failed to delete client';
            });
    },
});

export const {
    clearClients,
    setSearchQuery,
    setSelectedClient,
    setSortConfig,
    clearError,
    resetClientState,
} = clientSlice.actions;

export default clientSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, PaginationInfo, FiltersApplied, SortApplied } from '../../services/transactionService';
import { fetchTransactions, loadMoreTransactions, searchTransactions, applyFilters, sortTransactions, editTransaction, deleteTransaction } from '../actions/transactionActions';

export interface TransactionState {
    transactions: Transaction[];
    pagination: PaginationInfo | null;
    filters: FiltersApplied;
    searchQuery: string;
    sortConfig: SortApplied;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
}

const initialState: TransactionState = {
    transactions: [],
    pagination: null,
    filters: {},
    searchQuery: '',
    sortConfig: {
        sort_by: 'create_date',
        sort_order: 'desc',
    },
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        // Clear transactions
        clearTransactions: (state) => {
            state.transactions = [];
            state.pagination = null;
            state.error = null;
        },

        // Set search query
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        // Set sort configuration
        setSortConfig: (state, action: PayloadAction<SortApplied>) => {
            state.sortConfig = action.payload;
        },

        // Set filters
        setFilters: (state, action: PayloadAction<FiltersApplied>) => {
            state.filters = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset state
        resetTransactionState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch transactions
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.filters = action.payload.data.filters_applied;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch transactions';
                state.transactions = [];
                state.pagination = null;
            })

        // Load more transactions
        builder
            .addCase(loadMoreTransactions.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreTransactions.fulfilled, (state, action) => {
                state.loadingMore = false;
                // Append new transactions to existing ones
                state.transactions = [...state.transactions, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreTransactions.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more transactions';
            })

        // Search transactions
        builder
            .addCase(searchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.filters = action.payload.data.filters_applied;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search transactions';
            })

        // Apply filters
        builder
            .addCase(applyFilters.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(applyFilters.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.filters = action.payload.data.filters_applied;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(applyFilters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to apply filters';
            })

        // Sort transactions
        builder
            .addCase(sortTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.filters = action.payload.data.filters_applied;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort transactions';
            });

        // Edit transaction
        builder
            .addCase(editTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.transaction;
                state.transactions = state.transactions.map((t) =>
                    t.id === updated.id ? { ...t, ...updated } : t
                );
                state.error = null;
            })
            .addCase(editTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to edit transaction';
            });

        // Delete transaction
        builder
            .addCase(deleteTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload.id;
                state.transactions = state.transactions.filter((t) => t.id !== deletedId);
                state.error = null;
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete transaction';
            });
    },
});

export const {
    clearTransactions,
    setSearchQuery,
    setSortConfig,
    setFilters,
    clearError,
    resetTransactionState,
} = transactionSlice.actions;

export default transactionSlice.reducer;
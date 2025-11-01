import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, PaginationInfo, FiltersApplied, SortApplied } from '../../services/transactionService';
import { fetchTransactions, loadMoreTransactions, searchTransactions, applyFilters, sortTransactions, editTransaction, deleteTransaction, createTransaction, generateTransactionReport } from '../actions/transactionActions';

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
    editingTransactionIds: number[];
    deletingTransactionIds: number[];
    reportLoading: boolean;
    reportError: string | null;
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
    editingTransactionIds: [],
    deletingTransactionIds: [],
    reportLoading: false,
    reportError: null,
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

        // Add transaction ID to editing list
        addEditingTransactionId: (state, action: PayloadAction<number>) => {
            if (!state.editingTransactionIds.includes(action.payload)) {
                state.editingTransactionIds.push(action.payload);
            }
        },

        // Remove transaction ID from editing list
        removeEditingTransactionId: (state, action: PayloadAction<number>) => {
            state.editingTransactionIds = state.editingTransactionIds.filter(id => id !== action.payload);
        },

        // Add transaction ID to deleting list
        addDeletingTransactionId: (state, action: PayloadAction<number>) => {
            if (!state.deletingTransactionIds.includes(action.payload)) {
                state.deletingTransactionIds.push(action.payload);
            }
        },

        // Remove transaction ID from deleting list
        removeDeletingTransactionId: (state, action: PayloadAction<number>) => {
            state.deletingTransactionIds = state.deletingTransactionIds.filter(id => id !== action.payload);
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

        // Create transaction
        builder
            .addCase(createTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.loading = false;
                // Add the new transaction to the beginning of the list
                const newTransaction = action.payload.data;
                state.transactions = [newTransaction, ...state.transactions];
                state.error = null;
            })
            .addCase(createTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create transaction';
            });

        // Edit transaction
        builder
            .addCase(editTransaction.pending, (state, action) => {
                state.loading = true;
                const transactionId = action.meta.arg.id;
                if (!state.editingTransactionIds.includes(transactionId)) {
                    state.editingTransactionIds.push(transactionId);
                }
                state.error = null;
            })
            .addCase(editTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.data;
                // Remove from editing list
                state.editingTransactionIds = state.editingTransactionIds.filter(id => id !== updated.id);
                // Update the transaction in the list
                state.transactions = state.transactions.map((t) =>
                    t.id === updated.id ? { ...t, ...updated } : t
                );
                state.error = null;
            })
            .addCase(editTransaction.rejected, (state, action) => {
                state.loading = false;
                const transactionId = action.meta.arg.id;
                // Remove from editing list on failure
                state.editingTransactionIds = state.editingTransactionIds.filter(id => id !== transactionId);
                state.error = action.payload || 'Failed to edit transaction';
            });

        // Delete transaction
        builder
            .addCase(deleteTransaction.pending, (state, action) => {
                state.loading = true;
                const transactionId = action.meta.arg;
                if (!state.deletingTransactionIds.includes(transactionId)) {
                    state.deletingTransactionIds.push(transactionId);
                }
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload.data.id;
                // Remove from deleting list
                state.deletingTransactionIds = state.deletingTransactionIds.filter(id => id !== deletedId);
                // Remove from transactions list
                state.transactions = state.transactions.filter((t) => t.id !== deletedId);
                state.error = null;
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = false;
                const transactionId = action.meta.arg;
                // Remove from deleting list on failure
                state.deletingTransactionIds = state.deletingTransactionIds.filter(id => id !== transactionId);
                state.error = action.payload || 'Failed to delete transaction';
            });

        // Generate transaction report
        builder
            .addCase(generateTransactionReport.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(generateTransactionReport.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.reportError = null;
                // Report data is handled in the component for immediate download
            })
            .addCase(generateTransactionReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload || 'Failed to generate report';
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
    addEditingTransactionId,
    removeEditingTransactionId,
    addDeletingTransactionId,
    removeDeletingTransactionId,
} = transactionSlice.actions;

export default transactionSlice.reducer;
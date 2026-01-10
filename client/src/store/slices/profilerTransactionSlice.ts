import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfilerTransaction, ProfilerTransactionPaginationInfo, ProfilerTransactionSortApplied, ProfilerTransactionSummary } from '../../services/profilerTransactionService';
import { 
    fetchProfilerTransactions, 
    loadMoreProfilerTransactions, 
    searchProfilerTransactions, 
    sortProfilerTransactions,
    getProfilerTransactionById,
    getTransactionsByProfile,
    getProfileTransactionSummary,
    createDepositTransaction,
    createWithdrawTransaction,
    deleteProfilerTransaction
} from '../actions/profilerTransactionActions';

export interface ProfilerTransactionState {
    transactions: ProfilerTransaction[];
    selectedTransaction: ProfilerTransaction | null;
    pagination: ProfilerTransactionPaginationInfo | null;
    summary: ProfilerTransactionSummary | null;
    searchQuery: string;
    sortConfig: ProfilerTransactionSortApplied;
    loading: boolean;
    loadingMore: boolean;
    creating: boolean;
    deletingTransactionIds: number[];
    error: string | null;
    hasMore: boolean;
}

const initialState: ProfilerTransactionState = {
    transactions: [],
    selectedTransaction: null,
    pagination: null,
    summary: null,
    searchQuery: '',
    sortConfig: {
        sort_by: 'created_at',
        sort_order: 'desc',
    },
    loading: false,
    loadingMore: false,
    creating: false,
    deletingTransactionIds: [],
    error: null,
    hasMore: false,
};

const profilerTransactionSlice = createSlice({
    name: 'profilerTransactions',
    initialState,
    reducers: {
        clearProfilerTransactions: (state) => {
            state.transactions = [];
            state.pagination = null;
            state.summary = null;
            state.error = null;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedProfilerTransaction: (state, action: PayloadAction<ProfilerTransaction | null>) => {
            state.selectedTransaction = action.payload;
        },
        setSortConfig: (state, action: PayloadAction<ProfilerTransactionSortApplied>) => {
            state.sortConfig = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetProfilerTransactionState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.summary = action.payload.data.summary;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchProfilerTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler transactions';
                state.transactions = [];
                state.pagination = null;
                state.summary = null;
            })
            .addCase(loadMoreProfilerTransactions.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreProfilerTransactions.fulfilled, (state, action) => {
                state.loadingMore = false;
                state.transactions = [...state.transactions, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.summary = action.payload.data.summary;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreProfilerTransactions.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more profiler transactions';
            })
            .addCase(searchProfilerTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProfilerTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.summary = action.payload.data.summary;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchProfilerTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search profiler transactions';
            })
            .addCase(sortProfilerTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortProfilerTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.summary = action.payload.data.summary;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortProfilerTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort profiler transactions';
            })
            .addCase(getProfilerTransactionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfilerTransactionById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedTransaction = action.payload.data;
                state.error = null;
            })
            .addCase(getProfilerTransactionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler transaction';
            })
            .addCase(getTransactionsByProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactionsByProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.summary = action.payload.data.summary;
                state.error = null;
            })
            .addCase(getTransactionsByProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch transactions by profile';
            })
            .addCase(getProfileTransactionSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfileTransactionSummary.fulfilled, (state, action) => {
                state.loading = false;
                const { transaction_count, ...summary } = action.payload.data;
                state.summary = summary;
                state.error = null;
            })
            .addCase(getProfileTransactionSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch transaction summary';
            })
            .addCase(createDepositTransaction.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createDepositTransaction.fulfilled, (state, action) => {
                state.creating = false;
                state.transactions = [action.payload.data, ...state.transactions];
                state.error = null;
            })
            .addCase(createDepositTransaction.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create deposit transaction';
            })
            .addCase(createWithdrawTransaction.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createWithdrawTransaction.fulfilled, (state, action) => {
                state.creating = false;
                state.transactions = [action.payload.data, ...state.transactions];
                state.error = null;
            })
            .addCase(createWithdrawTransaction.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create withdraw transaction';
            })
            .addCase(deleteProfilerTransaction.pending, (state, action) => {
                const transactionId = action.meta.arg.id;
                if (!state.deletingTransactionIds.includes(transactionId)) {
                    state.deletingTransactionIds.push(transactionId);
                }
                state.error = null;
            })
            .addCase(deleteProfilerTransaction.fulfilled, (state, action) => {
                const transactionId = action.meta.arg.id;
                state.deletingTransactionIds = state.deletingTransactionIds.filter(id => id !== transactionId);
                state.transactions = state.transactions.filter(t => t.id !== transactionId);
                if (state.selectedTransaction?.id === transactionId) {
                    state.selectedTransaction = null;
                }
                state.error = null;
            })
            .addCase(deleteProfilerTransaction.rejected, (state, action) => {
                const transactionId = action.meta.arg.id;
                state.deletingTransactionIds = state.deletingTransactionIds.filter(id => id !== transactionId);
                state.error = action.payload || 'Failed to delete profiler transaction';
            });
    }
});

export const { 
    clearProfilerTransactions, 
    setSearchQuery, 
    setSelectedProfilerTransaction, 
    setSortConfig, 
    clearError, 
    resetProfilerTransactionState 
} = profilerTransactionSlice.actions;

export default profilerTransactionSlice.reducer;

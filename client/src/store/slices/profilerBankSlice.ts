import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfilerBank, ProfilerBankPaginationInfo, ProfilerBankSortApplied } from '../../services/profilerBankService';
import { 
    fetchProfilerBanks, 
    loadMoreProfilerBanks, 
    searchProfilerBanks, 
    sortProfilerBanks,
    getProfilerBankById,
    createProfilerBank,
    updateProfilerBank,
    deleteProfilerBank
} from '../actions/profilerBankActions';

export interface ProfilerBankState {
    banks: ProfilerBank[];
    selectedBank: ProfilerBank | null;
    pagination: ProfilerBankPaginationInfo | null;
    searchQuery: string;
    sortConfig: ProfilerBankSortApplied;
    loading: boolean;
    loadingMore: boolean;
    creating: boolean;
    savingBankIds: number[];
    deletingBankIds: number[];
    error: string | null;
    hasMore: boolean;
}

const initialState: ProfilerBankState = {
    banks: [],
    selectedBank: null,
    pagination: null,
    searchQuery: '',
    sortConfig: {
        sort_by: 'bank_name',
        sort_order: 'asc',
    },
    loading: false,
    loadingMore: false,
    creating: false,
    savingBankIds: [],
    deletingBankIds: [],
    error: null,
    hasMore: false,
};

const profilerBankSlice = createSlice({
    name: 'profilerBanks',
    initialState,
    reducers: {
        clearProfilerBanks: (state) => {
            state.banks = [];
            state.pagination = null;
            state.error = null;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedProfilerBank: (state, action: PayloadAction<ProfilerBank | null>) => {
            state.selectedBank = action.payload;
        },
        setSortConfig: (state, action: PayloadAction<ProfilerBankSortApplied>) => {
            state.sortConfig = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetProfilerBankState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(fetchProfilerBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler banks';
                state.banks = [];
                state.pagination = null;
            })
            .addCase(loadMoreProfilerBanks.pending, (state) => {
                state.loadingMore = true;
                state.error = null;
            })
            .addCase(loadMoreProfilerBanks.fulfilled, (state, action) => {
                state.loadingMore = false;
                state.banks = [...state.banks, ...action.payload.data.data];
                state.pagination = action.payload.data.pagination;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(loadMoreProfilerBanks.rejected, (state, action) => {
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load more profiler banks';
            })
            .addCase(searchProfilerBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProfilerBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(searchProfilerBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to search profiler banks';
            })
            .addCase(sortProfilerBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sortProfilerBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortConfig = action.payload.data.sort_applied;
                state.hasMore = action.payload.data.pagination.has_next_page;
                state.error = null;
            })
            .addCase(sortProfilerBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to sort profiler banks';
            })
            .addCase(getProfilerBankById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfilerBankById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBank = action.payload.data;
                state.error = null;
            })
            .addCase(getProfilerBankById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler bank';
            })
            .addCase(createProfilerBank.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createProfilerBank.fulfilled, (state, action) => {
                state.creating = false;
                state.banks = [action.payload.data, ...state.banks];
                state.error = null;
            })
            .addCase(createProfilerBank.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Failed to create profiler bank';
            })
            .addCase(updateProfilerBank.pending, (state, action) => {
                const bankId = action.meta.arg.id;
                if (!state.savingBankIds.includes(bankId)) {
                    state.savingBankIds.push(bankId);
                }
                state.error = null;
            })
            .addCase(updateProfilerBank.fulfilled, (state, action) => {
                const bankId = action.payload.data.id;
                state.savingBankIds = state.savingBankIds.filter(id => id !== bankId);
                const index = state.banks.findIndex(b => b.id === bankId);
                if (index !== -1) {
                    state.banks[index] = action.payload.data;
                }
                if (state.selectedBank?.id === bankId) {
                    state.selectedBank = action.payload.data;
                }
                state.error = null;
            })
            .addCase(updateProfilerBank.rejected, (state, action) => {
                const bankId = action.meta.arg.id;
                state.savingBankIds = state.savingBankIds.filter(id => id !== bankId);
                state.error = action.payload || 'Failed to update profiler bank';
            })
            .addCase(deleteProfilerBank.pending, (state, action) => {
                const bankId = action.meta.arg.id;
                if (!state.deletingBankIds.includes(bankId)) {
                    state.deletingBankIds.push(bankId);
                }
                state.error = null;
            })
            .addCase(deleteProfilerBank.fulfilled, (state, action) => {
                const bankId = action.meta.arg.id;
                state.deletingBankIds = state.deletingBankIds.filter(id => id !== bankId);
                state.banks = state.banks.filter(b => b.id !== bankId);
                if (state.selectedBank?.id === bankId) {
                    state.selectedBank = null;
                }
                state.error = null;
            })
            .addCase(deleteProfilerBank.rejected, (state, action) => {
                const bankId = action.meta.arg.id;
                state.deletingBankIds = state.deletingBankIds.filter(id => id !== bankId);
                state.error = action.payload || 'Failed to delete profiler bank';
            });
    }
});

export const { 
    clearProfilerBanks, 
    setSearchQuery, 
    setSelectedProfilerBank, 
    setSortConfig, 
    clearError, 
    resetProfilerBankState 
} = profilerBankSlice.actions;

export default profilerBankSlice.reducer;

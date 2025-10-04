import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchBankAutocomplete } from '../actions/bankActions';
import { BankAutocompleteItem } from '../../services/bankService';

// Re-export for convenience
export type { BankAutocompleteItem };

export interface BankAutocompleteState {
    items: BankAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
    limitApplied: number;
}

const initialState: BankAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0,
    limitApplied: 5
};

const bankAutocompleteSlice = createSlice({
    name: 'bankAutocomplete',
    initialState,
    reducers: {
        clearBankAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetBankAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBankAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search_query;
                state.resultCount = action.payload.result_count;
                state.limitApplied = action.payload.limit_applied;
                state.error = null;
            })
            .addCase(fetchBankAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch bank autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearBankAutocomplete, resetBankAutocompleteError } = bankAutocompleteSlice.actions;
export default bankAutocompleteSlice.reducer;
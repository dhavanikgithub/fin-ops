import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCardAutocomplete } from '../actions/cardActions';
import { CardAutocompleteItem } from '../../services/cardService';

// Re-export for convenience
export type { CardAutocompleteItem };

export interface CardAutocompleteState {
    items: CardAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
    limitApplied: number;
}

const initialState: CardAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0,
    limitApplied: 5
};

const cardAutocompleteSlice = createSlice({
    name: 'cardAutocomplete',
    initialState,
    reducers: {
        clearCardAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetCardAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCardAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCardAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search_query;
                state.resultCount = action.payload.result_count;
                state.limitApplied = action.payload.limit_applied;
                state.error = null;
            })
            .addCase(fetchCardAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch card autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearCardAutocomplete, resetCardAutocompleteError } = cardAutocompleteSlice.actions;
export default cardAutocompleteSlice.reducer;
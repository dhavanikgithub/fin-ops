import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchClientAutocomplete } from '../actions/clientActions';
import { ClientAutocompleteItem } from '../../services/clientService';

// Re-export for convenience
export type { ClientAutocompleteItem };

export interface ClientAutocompleteState {
    items: ClientAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
    limitApplied: number;
}

const initialState: ClientAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0,
    limitApplied: 5
};

const clientAutocompleteSlice = createSlice({
    name: 'clientAutocomplete',
    initialState,
    reducers: {
        clearClientAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetClientAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClientAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search_query;
                state.resultCount = action.payload.result_count;
                state.limitApplied = action.payload.limit_applied;
                state.error = null;
            })
            .addCase(fetchClientAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch client autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearClientAutocomplete, resetClientAutocompleteError } = clientAutocompleteSlice.actions;
export default clientAutocompleteSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfilerBankAutocompleteItem } from '../../services/profilerBankService';
import profilerBankService, { ProfilerBankAutocompleteFilters } from '../../services/profilerBankService';

export type { ProfilerBankAutocompleteItem };

export interface ProfilerBankAutocompleteState {
    items: ProfilerBankAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
}

const initialState: ProfilerBankAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0
};

export const fetchProfilerBankAutocomplete = createAsyncThunk<
    { data: ProfilerBankAutocompleteItem[]; total_count: number; search?: string },
    ProfilerBankAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'profilerBankAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await profilerBankService.getBankAutocomplete(filters);
            return {
                data: response.data.data,
                total_count: response.data.total_count,
                search: filters.search
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler bank autocomplete'
            );
        }
    }
);

const profilerBankAutocompleteSlice = createSlice({
    name: 'profilerBankAutocomplete',
    initialState,
    reducers: {
        clearProfilerBankAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetProfilerBankAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerBankAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerBankAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search || '';
                state.resultCount = action.payload.total_count;
                state.error = null;
            })
            .addCase(fetchProfilerBankAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler bank autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearProfilerBankAutocomplete, resetProfilerBankAutocompleteError } = profilerBankAutocompleteSlice.actions;
export default profilerBankAutocompleteSlice.reducer;

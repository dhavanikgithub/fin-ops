import { createSlice } from '@reduxjs/toolkit';
import { ProfilerClientAutocompleteItem } from '../../services/profilerClientService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import profilerClientService, { ProfilerClientAutocompleteFilters } from '../../services/profilerClientService';

export type { ProfilerClientAutocompleteItem };

export interface ProfilerClientAutocompleteState {
    items: ProfilerClientAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
}

const initialState: ProfilerClientAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0
};

// Fetch profiler client autocomplete
export const fetchProfilerClientAutocomplete = createAsyncThunk<
    { data: ProfilerClientAutocompleteItem[]; total_count: number; search?: string },
    ProfilerClientAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'profilerClientAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await profilerClientService.getClientAutocomplete(filters);
            return {
                data: response.data.data,
                total_count: response.data.total_count,
                search: filters.search
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler client autocomplete'
            );
        }
    }
);

const profilerClientAutocompleteSlice = createSlice({
    name: 'profilerClientAutocomplete',
    initialState,
    reducers: {
        clearProfilerClientAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetProfilerClientAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerClientAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerClientAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search || '';
                state.resultCount = action.payload.total_count;
                state.error = null;
            })
            .addCase(fetchProfilerClientAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler client autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearProfilerClientAutocomplete, resetProfilerClientAutocompleteError } = profilerClientAutocompleteSlice.actions;
export default profilerClientAutocompleteSlice.reducer;

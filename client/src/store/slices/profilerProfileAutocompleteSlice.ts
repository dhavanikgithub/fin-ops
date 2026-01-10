import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfilerProfileAutocompleteItem } from '../../services/profilerProfileService';
import profilerProfileService, { ProfilerProfileAutocompleteFilters } from '../../services/profilerProfileService';

export type { ProfilerProfileAutocompleteItem };

export interface ProfilerProfileAutocompleteState {
    items: ProfilerProfileAutocompleteItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    resultCount: number;
}

const initialState: ProfilerProfileAutocompleteState = {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
    resultCount: 0
};

export const fetchProfilerProfileAutocomplete = createAsyncThunk<
    { data: ProfilerProfileAutocompleteItem[]; total_count: number; search?: string },
    ProfilerProfileAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'profilerProfileAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await profilerProfileService.getProfileAutocomplete(filters);
            return {
                data: response.data.data,
                total_count: response.data.total_count,
                search: filters.search
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler profile autocomplete'
            );
        }
    }
);

const profilerProfileAutocompleteSlice = createSlice({
    name: 'profilerProfileAutocomplete',
    initialState,
    reducers: {
        clearProfilerProfileAutocomplete: (state) => {
            state.items = [];
            state.searchQuery = '';
            state.resultCount = 0;
            state.error = null;
        },
        resetProfilerProfileAutocompleteError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfilerProfileAutocomplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfilerProfileAutocomplete.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.searchQuery = action.payload.search || '';
                state.resultCount = action.payload.total_count;
                state.error = null;
            })
            .addCase(fetchProfilerProfileAutocomplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch profiler profile autocomplete data';
                state.items = [];
                state.resultCount = 0;
            });
    }
});

export const { clearProfilerProfileAutocomplete, resetProfilerProfileAutocompleteError } = profilerProfileAutocompleteSlice.actions;
export default profilerProfileAutocompleteSlice.reducer;

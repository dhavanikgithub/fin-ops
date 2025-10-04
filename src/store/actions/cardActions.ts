import { createAsyncThunk } from '@reduxjs/toolkit';
import cardService, { CardAutocompleteFilters, CardAutocompleteResponse } from '../../services/cardService';

// Fetch card autocomplete data
export const fetchCardAutocomplete = createAsyncThunk<
    CardAutocompleteResponse['data'],
    CardAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'cardAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await cardService.getCardAutocomplete(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch card autocomplete data'
            );
        }
    }
);
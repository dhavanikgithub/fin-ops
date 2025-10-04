import { createAsyncThunk } from '@reduxjs/toolkit';
import clientService, { ClientAutocompleteFilters, ClientAutocompleteResponse } from '../../services/clientService';

// Fetch client autocomplete data
export const fetchClientAutocomplete = createAsyncThunk<
    ClientAutocompleteResponse['data'],
    ClientAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'clientAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await clientService.getClientAutocomplete(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch client autocomplete data'
            );
        }
    }
);
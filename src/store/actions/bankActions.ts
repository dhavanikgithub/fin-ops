import { createAsyncThunk } from '@reduxjs/toolkit';
import bankService, { BankAutocompleteFilters, BankAutocompleteResponse } from '../../services/bankService';

// Fetch bank autocomplete data
export const fetchBankAutocomplete = createAsyncThunk<
    BankAutocompleteResponse['data'],
    BankAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'bankAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await bankService.getBankAutocomplete(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch bank autocomplete data'
            );
        }
    }
);
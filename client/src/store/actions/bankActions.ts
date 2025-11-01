import { createAsyncThunk } from '@reduxjs/toolkit';
import bankService, { 
    BankFilters, 
    CreateBankRequest, 
    UpdateBankRequest, 
    DeleteBankRequest,
    Bank,
    BankAutocompleteFilters,
    BankAutocompleteResponse
} from '../../services/bankService';
import { 
    addUpdatingBank, 
    removeUpdatingBank, 
    addDeletingBank, 
    removeDeletingBank,
    updateBankInList,
    removeBankFromList,
    addBankToList
} from '../slices/bankSlice';

// Fetch paginated banks
export const fetchPaginatedBanks = createAsyncThunk(
    'banks/fetchPaginated',
    async (filters: BankFilters = {}) => {
        const response = await bankService.getPaginatedBanks(filters);
        return response;
    }
);

// Create bank
export const createBank = createAsyncThunk(
    'banks/create',
    async (bankData: CreateBankRequest, { dispatch, rejectWithValue }) => {
        try {
            const response = await bankService.createBank(bankData);
            
            // Add the new bank to the list
            dispatch(addBankToList(response.data));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create bank');
        }
    }
);

// Update bank
export const updateBank = createAsyncThunk(
    'banks/update',
    async (bankData: UpdateBankRequest, { dispatch, rejectWithValue }) => {
        try {
            // Add to updating list
            dispatch(addUpdatingBank(bankData.id));
            
            const response = await bankService.updateBank(bankData);
            
            // Update the bank in the list
            dispatch(updateBankInList(response.data));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to update bank');
        } finally {
            // Remove from updating list
            dispatch(removeUpdatingBank(bankData.id));
        }
    }
);

// Delete bank
export const deleteBank = createAsyncThunk(
    'banks/delete',
    async (bankData: DeleteBankRequest, { dispatch, rejectWithValue }) => {
        try {
            // Add to deleting list
            dispatch(addDeletingBank(bankData.id));
            
            const response = await bankService.deleteBank(bankData);
            
            // Remove the bank from the list
            dispatch(removeBankFromList(bankData.id));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete bank');
        } finally {
            // Remove from deleting list
            dispatch(removeDeletingBank(bankData.id));
        }
    }
);

// Get bank by ID
export const fetchBankById = createAsyncThunk(
    'banks/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await bankService.getBankById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch bank');
        }
    }
);

// Get bank autocomplete
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
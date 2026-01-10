import { createAsyncThunk } from '@reduxjs/toolkit';
import profilerTransactionService, { 
    ProfilerTransactionFilters, 
    ProfilerTransactionPaginatedResponse,
    CreateDepositTransactionRequest,
    CreateWithdrawTransactionRequest,
    DeleteProfilerTransactionRequest,
    ProfilerTransactionResponse,
    ProfileTransactionSummaryResponse,
    DeleteProfilerTransactionResponse
} from '../../services/profilerTransactionService';
import { RootState } from '../index';

// Fetch profiler transactions with filters and sorting
export const fetchProfilerTransactions = createAsyncThunk<
    ProfilerTransactionPaginatedResponse,
    ProfilerTransactionFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'profilerTransactions/fetchTransactions',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.profilerTransactions;

            const requestFilters: ProfilerTransactionFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await profilerTransactionService.getPaginatedTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler transactions'
            );
        }
    }
);

// Load more profiler transactions for infinite scroll
export const loadMoreProfilerTransactions = createAsyncThunk<
    ProfilerTransactionPaginatedResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'profilerTransactions/loadMoreTransactions',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig, pagination } = state.profilerTransactions;

            if (!pagination?.has_next_page) {
                throw new Error('No more profiler transactions to load');
            }

            const requestFilters: ProfilerTransactionFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerTransactionService.getPaginatedTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more profiler transactions'
            );
        }
    }
);

// Search profiler transactions with current sort
export const searchProfilerTransactions = createAsyncThunk<
    ProfilerTransactionPaginatedResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'profilerTransactions/searchTransactions',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { sortConfig } = state.profilerTransactions;

            const requestFilters: ProfilerTransactionFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerTransactionService.getPaginatedTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search profiler transactions'
            );
        }
    }
);

// Sort profiler transactions
export const sortProfilerTransactions = createAsyncThunk<
    ProfilerTransactionPaginatedResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'profilerTransactions/sortTransactions',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery } = state.profilerTransactions;

            const requestFilters: ProfilerTransactionFilters = {
                page: 1,
                limit: 50,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await profilerTransactionService.getPaginatedTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort profiler transactions'
            );
        }
    }
);

// Get profiler transaction by ID
export const getProfilerTransactionById = createAsyncThunk<
    ProfilerTransactionResponse,
    number,
    { rejectValue: string }
>(
    'profilerTransactions/getTransactionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.getTransactionById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profiler transaction'
            );
        }
    }
);

// Get transactions by profile ID
export const getTransactionsByProfile = createAsyncThunk<
    ProfilerTransactionPaginatedResponse,
    number,
    { rejectValue: string }
>(
    'profilerTransactions/getByProfile',
    async (profileId, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.getTransactionsByProfile(profileId);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch transactions by profile'
            );
        }
    }
);

// Get profile transaction summary
export const getProfileTransactionSummary = createAsyncThunk<
    ProfileTransactionSummaryResponse,
    number,
    { rejectValue: string }
>(
    'profilerTransactions/getSummary',
    async (profileId, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.getProfileTransactionSummary(profileId);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch transaction summary'
            );
        }
    }
);

// Create deposit transaction
export const createDepositTransaction = createAsyncThunk<
    ProfilerTransactionResponse,
    CreateDepositTransactionRequest,
    { rejectValue: string }
>(
    'profilerTransactions/createDeposit',
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.createDepositTransaction(transactionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create deposit transaction'
            );
        }
    }
);

// Create withdraw transaction
export const createWithdrawTransaction = createAsyncThunk<
    ProfilerTransactionResponse,
    CreateWithdrawTransactionRequest,
    { rejectValue: string }
>(
    'profilerTransactions/createWithdraw',
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.createWithdrawTransaction(transactionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create withdraw transaction'
            );
        }
    }
);

// Delete profiler transaction
export const deleteProfilerTransaction = createAsyncThunk<
    DeleteProfilerTransactionResponse,
    DeleteProfilerTransactionRequest,
    { rejectValue: string }
>(
    'profilerTransactions/deleteTransaction',
    async (deleteData, { rejectWithValue }) => {
        try {
            const response = await profilerTransactionService.deleteTransaction(deleteData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete profiler transaction'
            );
        }
    }
);

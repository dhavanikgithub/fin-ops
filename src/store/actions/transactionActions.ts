import { createAsyncThunk } from '@reduxjs/toolkit';
import transactionService, { Transaction, TransactionFilters, TransactionResponse, CreateTransactionData, CreateTransactionResponse, EditTransactionResponse, DeleteTransactionResponse } from '../../services/transactionService';
import { RootState } from '../index';

// Fetch transactions with filters and sorting
export const fetchTransactions = createAsyncThunk<
    TransactionResponse,
    TransactionFilters | undefined,
    { rejectValue: string; state: RootState }
>(
    'transactions/fetchTransactions',
    async (customFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { filters, searchQuery, sortConfig } = state.transactions;

            const requestFilters: TransactionFilters = {
                page: 1,
                limit: 20,
                ...filters,
                ...sortConfig,
                search: searchQuery || undefined,
                ...customFilters
            };

            const response = await transactionService.getTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch transactions'
            );
        }
    }
);

// Load more transactions for infinite scroll
export const loadMoreTransactions = createAsyncThunk<
    TransactionResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'transactions/loadMoreTransactions',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { filters, searchQuery, sortConfig, pagination } = state.transactions;

            if (!pagination?.has_next_page) {
                throw new Error('No more transactions to load');
            }

            const requestFilters: TransactionFilters = {
                page: pagination.current_page + 1,
                limit: pagination.per_page,
                ...filters,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await transactionService.getTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to load more transactions'
            );
        }
    }
);

// Search transactions with current filters and sort
export const searchTransactions = createAsyncThunk<
    TransactionResponse,
    string,
    { rejectValue: string; state: RootState }
>(
    'transactions/searchTransactions',
    async (searchQuery, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { filters, sortConfig } = state.transactions;

            const requestFilters: TransactionFilters = {
                page: 1,
                limit: 20,
                ...filters,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await transactionService.getTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to search transactions'
            );
        }
    }
);

// Apply filters and fetch transactions
export const applyFilters = createAsyncThunk<
    TransactionResponse,
    TransactionFilters,
    { rejectValue: string; state: RootState }
>(
    'transactions/applyFilters',
    async (newFilters, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { searchQuery, sortConfig } = state.transactions;

            const requestFilters: TransactionFilters = {
                page: 1,
                limit: 20,
                ...newFilters,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await transactionService.getTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to apply filters'
            );
        }
    }
);

// Sort transactions
export const sortTransactions = createAsyncThunk<
    TransactionResponse,
    { sort_by: string; sort_order: 'asc' | 'desc' },
    { rejectValue: string; state: RootState }
>(
    'transactions/sortTransactions',
    async (sortConfig, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { filters, searchQuery } = state.transactions;

            const requestFilters: TransactionFilters = {
                page: 1,
                limit: 20,
                ...filters,
                ...sortConfig,
                search: searchQuery || undefined
            };

            const response = await transactionService.getTransactions(requestFilters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to sort transactions'
            );
        }
    }
);

// Create a new transaction
export const createTransaction = createAsyncThunk<
    CreateTransactionResponse,
    CreateTransactionData,
    { rejectValue: string }
>(
    'transactions/createTransaction',
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await transactionService.createTransaction(transactionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create transaction'
            );
        }
    }
);

// Edit a transaction
export const editTransaction = createAsyncThunk<
    EditTransactionResponse,
    Partial<Transaction> & { id: number },
    { rejectValue: string }
>(
    'transactions/editTransaction',
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await transactionService.editTransaction(transactionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to edit transaction'
            );
        }
    }
);

// Delete a transaction
export const deleteTransaction = createAsyncThunk<
    DeleteTransactionResponse,
    number,
    { rejectValue: string }
>(
    'transactions/deleteTransaction',
    async (id, { rejectWithValue }) => {
        try {
            const response = await transactionService.deleteTransaction(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete transaction'
            );
        }
    }
);
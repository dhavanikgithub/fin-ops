import api from './api';
import { PROFILER_TRANSACTION_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export type ProfilerTransactionType = 'deposit' | 'withdraw';

export interface ProfilerTransaction {
    id: number;
    profile_id: number;
    client_name: string;
    bank_name: string;
    credit_card_number: string;
    transaction_type: ProfilerTransactionType;
    amount: number;
    withdraw_charges_percentage: number | null;
    withdraw_charges_amount: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfilerTransactionPaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface ProfilerTransactionSortApplied {
    sort_by: 'created_at' | 'amount' | 'transaction_type';
    sort_order: 'asc' | 'desc';
}

export interface ProfilerTransactionSummary {
    total_deposits: number;
    total_withdrawals: number;
    total_charges: number;
    net_amount: number;
}

export interface ProfilerTransactionFilter {
    profile_id?: number | number[];
    client_id?: number | number[];
    bank_id?: number | number[];
    transaction_type?: ProfilerTransactionType | ProfilerTransactionType[];
    amount_greater_than?: number;
    amount_less_than?: number;
    date_from?: Date | string;
    date_to?: Date | string;
}

export interface ProfilerTransactionPaginatedResponse {
    success: boolean;
    data: {
        data: ProfilerTransaction[];
        pagination: ProfilerTransactionPaginationInfo;
        search_applied?: string;
        filters_applied?: ProfilerTransactionFilter;
        sort_applied: ProfilerTransactionSortApplied;
        summary: ProfilerTransactionSummary;
    };
    code: string;
    message: string;
}

export interface ProfilerTransactionFilters {
    page?: number;
    limit?: number;
    search?: string;
    profile_id?: number | number[];
    client_id?: number | number[];
    bank_id?: number | number[];
    transaction_type?: ProfilerTransactionType | ProfilerTransactionType[];
    amount_greater_than?: number;
    amount_less_than?: number;
    date_from?: Date | string;
    date_to?: Date | string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CreateDepositTransactionRequest {
    profile_id: number;
    amount: number;
    notes?: string | null;
}

export interface CreateWithdrawTransactionRequest {
    profile_id: number;
    amount: number;
    withdraw_charges_percentage?: number;
    notes?: string | null;
}

export interface DeleteProfilerTransactionRequest {
    id: number;
}

export interface ProfilerTransactionResponse {
    success: boolean;
    data: ProfilerTransaction;
    code: string;
    message: string;
}

export interface ProfileTransactionSummaryResponse {
    success: boolean;
    data: ProfilerTransactionSummary & { transaction_count: number };
    code: string;
    message: string;
}

export interface DeleteProfilerTransactionResponse {
    success: boolean;
    data: null;
    code: string;
    message: string;
}

export const profilerTransactionService = {
    // Get paginated profiler transactions with filters and sorting
    getPaginatedTransactions: async (filters: ProfilerTransactionFilters = {}): Promise<ProfilerTransactionPaginatedResponse> => {
        const url = buildEndpointUrl(PROFILER_TRANSACTION_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler transaction by ID
    getTransactionById: async (id: number): Promise<ProfilerTransactionResponse> => {
        const response = await api.get(PROFILER_TRANSACTION_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    },

    // Get transactions by profile ID
    getTransactionsByProfile: async (profileId: number): Promise<ProfilerTransactionPaginatedResponse> => {
        const response = await api.get(PROFILER_TRANSACTION_ENDPOINTS.GET_BY_PROFILE(profileId));
        return response.data;
    },

    // Get transaction summary for a profile
    getProfileTransactionSummary: async (profileId: number): Promise<ProfileTransactionSummaryResponse> => {
        const response = await api.get(PROFILER_TRANSACTION_ENDPOINTS.GET_SUMMARY(profileId));
        return response.data;
    },

    // Create a deposit transaction
    createDepositTransaction: async (transactionData: CreateDepositTransactionRequest): Promise<ProfilerTransactionResponse> => {
        const response = await api.post(PROFILER_TRANSACTION_ENDPOINTS.CREATE_DEPOSIT, transactionData);
        return response.data;
    },

    // Create a withdraw transaction
    createWithdrawTransaction: async (transactionData: CreateWithdrawTransactionRequest): Promise<ProfilerTransactionResponse> => {
        const response = await api.post(PROFILER_TRANSACTION_ENDPOINTS.CREATE_WITHDRAW, transactionData);
        return response.data;
    },

    // Delete a profiler transaction
    deleteTransaction: async (deleteData: DeleteProfilerTransactionRequest): Promise<DeleteProfilerTransactionResponse> => {
        const response = await api.delete(PROFILER_TRANSACTION_ENDPOINTS.DELETE, { data: deleteData });
        return response.data;
    },

    // Export profile transactions to PDF
    exportProfileTransactionsPDF: async (profileId: number): Promise<Blob> => {
        const response = await api.get(PROFILER_TRANSACTION_ENDPOINTS.EXPORT_PDF(profileId), {
            responseType: 'blob'
        });
        return response.data;
    },
};

export default profilerTransactionService;

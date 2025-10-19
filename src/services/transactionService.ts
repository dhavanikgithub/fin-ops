import api from './api';
import { TRANSACTION_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface Transaction {
    id: number;
    transaction_type: number;
    client_id: number;
    widthdraw_charges: number;
    transaction_amount: number;
    client_name: string;
    bank_name: string;
    card_name: string;
    bank_id: number;
    card_id: number;
    remark: string;
    create_date: string;
    create_time: string;
    modify_date: string | null;
    modify_time: string | null;
}

export interface PaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface FiltersApplied {
    transaction_type?: number;
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    bank_ids?: number[];
    card_ids?: number[];
    client_ids?: number[];
}

export interface SortApplied {
    sort_by: string;
    sort_order: 'asc' | 'desc';
}

export interface TransactionResponse {
    success: boolean;
    data: {
        data: Transaction[];
        pagination: PaginationInfo;
        filters_applied: FiltersApplied;
        search_applied?: string;
        sort_applied: SortApplied;
    };
    code: string;
    message: string;
}

export interface TransactionFilters {
    page?: number;
    limit?: number;
    transaction_type?: number;
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    bank_ids?: number[];
    card_ids?: number[];
    client_ids?: number[];
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export const transactionService = {
    // Get paginated transactions
    getTransactions: async (filters: TransactionFilters = {}): Promise<TransactionResponse> => {
        const url = buildEndpointUrl(TRANSACTION_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },
    // Edit a transaction
    editTransaction: async (transactionData: Partial<Transaction> & { id: number }): Promise<{ transaction: Transaction; message: string }> => {
        const url = `${TRANSACTION_ENDPOINTS.BASE}/transactions`;
        const response = await api.put(url, transactionData);
        return response.data;
    },

    // Delete a transaction
    deleteTransaction: async (id: number): Promise<{ id: number; message: string }> => {
        const url = `${TRANSACTION_ENDPOINTS.BASE}/transactions`;
        const response = await api.delete(url, { data: { id } });
        return response.data;
    },
};

export default transactionService;
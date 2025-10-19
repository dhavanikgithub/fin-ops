import api from './api';
import { TRANSACTION_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface Transaction {
    id: number;
    transaction_type: number;
    client_id: number;
    widthdraw_charges: number;
    transaction_amount: number;
    client_name: string;
    bank_name: string | null;
    card_name: string | null;
    bank_id: number | null;
    card_id: number | null;
    remark: string;
    create_date: string;
    create_time: string;
    modify_date: string | null;
    modify_time: string | null;
    is_deleted?: boolean;
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

export interface CreateTransactionData {
    client_id: number;
    transaction_type: number;
    widthdraw_charges: number;
    transaction_amount: number;
    bank_id?: number;
    card_id?: number;
    remark?: string;
}

export interface CreateTransactionResponse {
    success: boolean;
    data: Transaction;
    code: string;
    message: string;
}

export interface EditTransactionResponse {
    success: boolean;
    data: Transaction;
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface DeleteTransactionResponse {
    success: boolean;
    data: {
        id: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export const transactionService = {
    // Get paginated transactions
    getTransactions: async (filters: TransactionFilters = {}): Promise<TransactionResponse> => {
        const url = buildEndpointUrl(TRANSACTION_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Create a new transaction
    createTransaction: async (transactionData: CreateTransactionData): Promise<CreateTransactionResponse> => {
        const response = await api.post(TRANSACTION_ENDPOINTS.CREATE, transactionData);
        return response.data;
    },

    // Edit a transaction
    editTransaction: async (transactionData: Partial<Transaction> & { id: number }): Promise<EditTransactionResponse> => {
        const response = await api.put(TRANSACTION_ENDPOINTS.EDIT, transactionData);
        return response.data;
    },

    // Delete a transaction
    deleteTransaction: async (id: number): Promise<DeleteTransactionResponse> => {
        const response = await api.delete(TRANSACTION_ENDPOINTS.DELETE, { data: { id } });
        return response.data;
    },
};

export default transactionService;
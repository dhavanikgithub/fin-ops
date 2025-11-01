import api from './api';
import { BANK_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

// Bank data structure
export interface Bank {
    id: number;
    name: string;
    create_date: string;
    create_time: string;
    modify_date: string | null;
    modify_time: string | null;
    transaction_count: number;
}

// Autocomplete interfaces
export interface BankAutocompleteItem {
    id: number;
    name: string;
}

export interface BankAutocompleteResponse {
    success: boolean;
    data: {
        data: BankAutocompleteItem[];
        search_query: string;
        result_count: number;
        limit_applied: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface BankAutocompleteFilters {
    search?: string;
    limit?: number;
}

// Paginated banks interfaces
export interface BankFilters {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: 'name' | 'create_date' | 'transaction_count';
    sort_order?: 'asc' | 'desc';
}

export interface BankPaginatedResponse {
    success: boolean;
    data: {
        data: Bank[];
        pagination: {
            current_page: number;
            page_size: number;
            total_records: number;
            total_pages: number;
            has_next_page: boolean;
            has_previous_page: boolean;
        };
        search_query: string | null;
        sort_by: string;
        sort_order: string;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

// CRUD operation interfaces
export interface CreateBankRequest {
    name: string;
}

export interface UpdateBankRequest {
    id: number;
    name: string;
}

export interface DeleteBankRequest {
    id: number;
}

export interface BankResponse {
    success: boolean;
    data: Bank;
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface DeleteBankResponse {
    success: boolean;
    data: {
        id: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export const bankService = {
    // Get paginated banks with filters and sorting
    getPaginatedBanks: async (filters: BankFilters = {}): Promise<BankPaginatedResponse> => {
        const url = buildEndpointUrl(BANK_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get bank autocomplete suggestions
    getBankAutocomplete: async (filters: BankAutocompleteFilters = {}): Promise<BankAutocompleteResponse> => {
        const url = buildEndpointUrl(BANK_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get bank by ID
    getBankById: async (id: number): Promise<BankResponse> => {
        const response = await api.get(`${BANK_ENDPOINTS.GET_BY_ID}/${id}`);
        return response.data;
    },

    // Create a new bank
    createBank: async (bankData: CreateBankRequest): Promise<BankResponse> => {
        const response = await api.post(BANK_ENDPOINTS.CREATE, bankData);
        return response.data;
    },

    // Update an existing bank
    updateBank: async (bankData: UpdateBankRequest): Promise<BankResponse> => {
        const response = await api.put(BANK_ENDPOINTS.UPDATE, bankData);
        return response.data;
    },

    // Delete a bank
    deleteBank: async (bankData: DeleteBankRequest): Promise<DeleteBankResponse> => {
        const response = await api.delete(BANK_ENDPOINTS.DELETE, { data: bankData });
        return response.data;
    },
};

export default bankService;
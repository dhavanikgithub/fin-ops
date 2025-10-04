import api from './api';
import { BANK_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

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

export const bankService = {
    // Get bank autocomplete suggestions
    getBankAutocomplete: async (filters: BankAutocompleteFilters = {}): Promise<BankAutocompleteResponse> => {
        const url = buildEndpointUrl(BANK_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },
};

export default bankService;
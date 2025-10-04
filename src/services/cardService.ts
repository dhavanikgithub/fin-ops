import api from './api';
import { CARD_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface CardAutocompleteItem {
    id: number;
    name: string;
}

export interface CardAutocompleteResponse {
    success: boolean;
    data: {
        data: CardAutocompleteItem[];
        search_query: string;
        result_count: number;
        limit_applied: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface CardAutocompleteFilters {
    search?: string;
    limit?: number;
}

export const cardService = {
    // Get card autocomplete suggestions
    getCardAutocomplete: async (filters: CardAutocompleteFilters = {}): Promise<CardAutocompleteResponse> => {
        const url = buildEndpointUrl(CARD_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },
};

export default cardService;
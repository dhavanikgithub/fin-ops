import api from './api';
import { CLIENT_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface ClientAutocompleteItem {
    id: number;
    name: string;
}

export interface ClientAutocompleteResponse {
    success: boolean;
    data: {
        data: ClientAutocompleteItem[];
        search_query: string;
        result_count: number;
        limit_applied: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface ClientAutocompleteFilters {
    search?: string;
    limit?: number;
}

export const clientService = {
    // Get client autocomplete suggestions
    getClientAutocomplete: async (filters: ClientAutocompleteFilters = {}): Promise<ClientAutocompleteResponse> => {
        const url = buildEndpointUrl(CLIENT_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },
};

export default clientService;
import api from './api';
import { CLIENT_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface Client {
    id: number;
    name: string;
    email: string;
    contact: string;
    address: string;
    create_date: string;
    create_time: string;
    modify_date: string | null;
    modify_time: string | null;
    transaction_count: number;
    is_deleted?: boolean;
}

export interface ClientPaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface ClientSortApplied {
    sort_by: string;
    sort_order: 'asc' | 'desc';
}

export interface ClientPaginatedResponse {
    success: boolean;
    data: {
        data: Client[];
        pagination: ClientPaginationInfo;
        search_applied?: string;
        sort_applied: ClientSortApplied;
    };
    code: string;
    message: string;
}

export interface ClientFilters {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

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
    // Get paginated clients with filters and sorting
    getPaginatedClients: async (filters: ClientFilters = {}): Promise<ClientPaginatedResponse> => {
        const url = buildEndpointUrl(CLIENT_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get client autocomplete suggestions
    getClientAutocomplete: async (filters: ClientAutocompleteFilters = {}): Promise<ClientAutocompleteResponse> => {
        const url = buildEndpointUrl(CLIENT_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },
};

export default clientService;
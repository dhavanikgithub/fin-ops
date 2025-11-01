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

export interface CreateClientRequest {
    name: string;
    email?: string;
    contact?: string;
    address?: string;
}

export interface UpdateClientRequest {
    id: number;
    name: string;
    email?: string;
    contact?: string;
    address?: string;
}

export interface DeleteClientRequest {
    id: number;
}

export interface ClientResponse {
    success: boolean;
    data: Client;
    successCode: string;
    message: string;
    timestamp: string;
    statusCode: number;
}

export interface DeleteClientResponse {
    success: boolean;
    data: {
        id: number;
    };
    successCode: string;
    message: string;
    timestamp: string;
    statusCode: number;
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

    // Get client by ID
    getClientById: async (id: number): Promise<ClientResponse> => {
        const response = await api.get(`${CLIENT_ENDPOINTS.GET_BY_ID}/${id}`);
        return response.data;
    },

    // Get client by name
    getClientByName: async (name: string): Promise<ClientResponse> => {
        const response = await api.get(`${CLIENT_ENDPOINTS.GET_BY_NAME}/${encodeURIComponent(name)}`);
        return response.data;
    },

    // Create a new client
    createClient: async (clientData: CreateClientRequest): Promise<ClientResponse> => {
        const response = await api.post(CLIENT_ENDPOINTS.CREATE, clientData);
        return response.data;
    },

    // Update an existing client
    updateClient: async (clientData: UpdateClientRequest): Promise<ClientResponse> => {
        const response = await api.put(CLIENT_ENDPOINTS.UPDATE, clientData);
        return response.data;
    },

    // Delete a client
    deleteClient: async (clientData: DeleteClientRequest): Promise<DeleteClientResponse> => {
        const response = await api.delete(CLIENT_ENDPOINTS.DELETE, { data: clientData });
        return response.data;
    },
};

export default clientService;
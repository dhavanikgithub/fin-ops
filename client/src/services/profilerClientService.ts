import api from './api';
import { PROFILER_CLIENT_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface ProfilerClient {
    id: number;
    name: string;
    email: string | null;
    mobile_number: string | null;
    aadhaar_card_number: string | null;
    aadhaar_card_image: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    profile_count: number;
}

export interface ProfilerClientPaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface ProfilerClientSortApplied {
    sort_by: 'name' | 'email' | 'mobile_number' | 'created_at' | 'profile_count';
    sort_order: 'asc' | 'desc';
}

export interface ProfilerClientFilter {
    has_profiles?: boolean;
}

export interface ProfilerClientPaginatedResponse {
    success: boolean;
    data: {
        data: ProfilerClient[];
        pagination: ProfilerClientPaginationInfo;
        search_applied?: string;
        filters_applied?: ProfilerClientFilter;
        sort_applied: ProfilerClientSortApplied;
    };
    code: string;
    message: string;
}

export interface ProfilerClientFilters {
    page?: number;
    limit?: number;
    search?: string;
    has_profiles?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerClientAutocompleteItem {
    id: number;
    name: string;
    email: string | null;
    mobile_number: string | null;
}

export interface ProfilerClientAutocompleteResponse {
    success: boolean;
    data: {
        data: ProfilerClientAutocompleteItem[];
        total_count: number;
    };
    code: string;
    message: string;
}

export interface ProfilerClientAutocompleteFilters {
    search?: string;
    limit?: number;
}

export interface CreateProfilerClientRequest {
    name: string;
    email?: string | null;
    mobile_number?: string | null;
    aadhaar_card_number?: string | null;
    aadhaar_card_image?: string | null;
    notes?: string | null;
}

export interface UpdateProfilerClientRequest {
    id: number;
    name: string;
    email?: string | null;
    mobile_number?: string | null;
    aadhaar_card_number?: string | null;
    aadhaar_card_image?: string | null;
    notes?: string | null;
}

export interface DeleteProfilerClientRequest {
    id: number;
}

export interface ProfilerClientResponse {
    success: boolean;
    data: ProfilerClient;
    code: string;
    message: string;
}

export interface DeleteProfilerClientResponse {
    success: boolean;
    data: null;
    code: string;
    message: string;
}

export const profilerClientService = {
    // Get paginated profiler clients with filters and sorting
    getPaginatedClients: async (filters: ProfilerClientFilters = {}): Promise<ProfilerClientPaginatedResponse> => {
        const url = buildEndpointUrl(PROFILER_CLIENT_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler client autocomplete suggestions
    getClientAutocomplete: async (filters: ProfilerClientAutocompleteFilters = {}): Promise<ProfilerClientAutocompleteResponse> => {
        const url = buildEndpointUrl(PROFILER_CLIENT_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler client by ID
    getClientById: async (id: number): Promise<ProfilerClientResponse> => {
        const response = await api.get(PROFILER_CLIENT_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    },

    // Create a new profiler client
    createClient: async (clientData: CreateProfilerClientRequest): Promise<ProfilerClientResponse> => {
        const response = await api.post(PROFILER_CLIENT_ENDPOINTS.CREATE, clientData);
        return response.data;
    },

    // Update an existing profiler client
    updateClient: async (clientData: UpdateProfilerClientRequest): Promise<ProfilerClientResponse> => {
        const response = await api.put(PROFILER_CLIENT_ENDPOINTS.UPDATE, clientData);
        return response.data;
    },

    // Delete a profiler client
    deleteClient: async (deleteData: DeleteProfilerClientRequest): Promise<DeleteProfilerClientResponse> => {
        const response = await api.delete(PROFILER_CLIENT_ENDPOINTS.DELETE, { data: deleteData });
        return response.data;
    },
};

export default profilerClientService;

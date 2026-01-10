import api from './api';
import { PROFILER_BANK_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export interface ProfilerBank {
    id: number;
    bank_name: string;
    created_at: string;
    updated_at: string;
    profile_count: number;
}

export interface ProfilerBankPaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface ProfilerBankSortApplied {
    sort_by: 'bank_name' | 'created_at' | 'profile_count';
    sort_order: 'asc' | 'desc';
}

export interface ProfilerBankFilter {
    has_profiles?: boolean;
}

export interface ProfilerBankPaginatedResponse {
    success: boolean;
    data: {
        data: ProfilerBank[];
        pagination: ProfilerBankPaginationInfo;
        search_applied?: string;
        filters_applied?: ProfilerBankFilter;
        sort_applied: ProfilerBankSortApplied;
    };
    code: string;
    message: string;
}

export interface ProfilerBankFilters {
    page?: number;
    limit?: number;
    search?: string;
    has_profiles?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerBankAutocompleteItem {
    id: number;
    bank_name: string;
}

export interface ProfilerBankAutocompleteResponse {
    success: boolean;
    data: {
        data: ProfilerBankAutocompleteItem[];
        total_count: number;
    };
    code: string;
    message: string;
}

export interface ProfilerBankAutocompleteFilters {
    search?: string;
    limit?: number;
}

export interface CreateProfilerBankRequest {
    bank_name: string;
}

export interface UpdateProfilerBankRequest {
    id: number;
    bank_name: string;
}

export interface DeleteProfilerBankRequest {
    id: number;
}

export interface ProfilerBankResponse {
    success: boolean;
    data: ProfilerBank;
    code: string;
    message: string;
}

export interface DeleteProfilerBankResponse {
    success: boolean;
    data: null;
    code: string;
    message: string;
}

export const profilerBankService = {
    // Get paginated profiler banks with filters and sorting
    getPaginatedBanks: async (filters: ProfilerBankFilters = {}): Promise<ProfilerBankPaginatedResponse> => {
        const url = buildEndpointUrl(PROFILER_BANK_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler bank autocomplete suggestions
    getBankAutocomplete: async (filters: ProfilerBankAutocompleteFilters = {}): Promise<ProfilerBankAutocompleteResponse> => {
        const url = buildEndpointUrl(PROFILER_BANK_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler bank by ID
    getBankById: async (id: number): Promise<ProfilerBankResponse> => {
        const response = await api.get(PROFILER_BANK_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    },

    // Create a new profiler bank
    createBank: async (bankData: CreateProfilerBankRequest): Promise<ProfilerBankResponse> => {
        const response = await api.post(PROFILER_BANK_ENDPOINTS.CREATE, bankData);
        return response.data;
    },

    // Update an existing profiler bank
    updateBank: async (bankData: UpdateProfilerBankRequest): Promise<ProfilerBankResponse> => {
        const response = await api.put(PROFILER_BANK_ENDPOINTS.UPDATE, bankData);
        return response.data;
    },

    // Delete a profiler bank
    deleteBank: async (deleteData: DeleteProfilerBankRequest): Promise<DeleteProfilerBankResponse> => {
        const response = await api.delete(PROFILER_BANK_ENDPOINTS.DELETE, { data: deleteData });
        return response.data;
    },
};

export default profilerBankService;

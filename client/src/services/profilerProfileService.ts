import api from './api';
import { PROFILER_PROFILE_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

export type ProfilerProfileStatus = 'active' | 'done';

export interface ProfilerProfile {
    id: number;
    client_id: number;
    client_name: string;
    bank_id: number;
    bank_name: string;
    credit_card_number: string;
    pre_planned_deposit_amount: number;
    current_balance: number;
    total_withdrawn_amount: number;
    remaining_balance: number;
    carry_forward_enabled: boolean;
    status: ProfilerProfileStatus;
    notes: string | null;
    marked_done_at: string | null;
    created_at: string;
    updated_at: string;
    transaction_count?: number; // Joined data
}

export interface ProfilerProfilePaginationInfo {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
}

export interface ProfilerProfileSortApplied {
    sort_by: 'created_at' | 'client_name' | 'bank_name' | 'remaining_balance' | 'status';
    sort_order: 'asc' | 'desc';
}

export interface ProfilerProfileFilter {
    client_id?: number | number[];
    bank_id?: number | number[];
    status?: ProfilerProfileStatus | ProfilerProfileStatus[];
    carry_forward_enabled?: boolean;
    has_positive_balance?: boolean;
    has_negative_balance?: boolean;
    balance_greater_than?: number;
    balance_less_than?: number;
}

export interface ProfilerProfilePaginatedResponse {
    success: boolean;
    data: {
        data: ProfilerProfile[];
        pagination: ProfilerProfilePaginationInfo;
        search_applied?: string;
        filters_applied?: ProfilerProfileFilter;
        sort_applied: ProfilerProfileSortApplied;
    };
    code: string;
    message: string;
}

export interface ProfilerProfileFilters {
    page?: number;
    limit?: number;
    search?: string;
    client_id?: number | number[];
    bank_id?: number | number[];
    status?: ProfilerProfileStatus | ProfilerProfileStatus[];
    carry_forward_enabled?: boolean;
    has_positive_balance?: boolean;
    has_negative_balance?: boolean;
    balance_greater_than?: number;
    balance_less_than?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerProfileAutocompleteItem {
    id: number;
    client_name: string;
    bank_name: string;
    credit_card_number: string;
    remaining_balance: number;
}

export interface ProfilerProfileAutocompleteResponse {
    success: boolean;
    data: {
        data: ProfilerProfileAutocompleteItem[];
        total_count: number;
    };
    code: string;
    message: string;
}

export interface ProfilerProfileAutocompleteFilters {
    search?: string;
    client_id?: number;
    limit?: number;
}

export interface CreateProfilerProfileRequest {
    client_id: number;
    bank_id: number;
    credit_card_number: string;
    pre_planned_deposit_amount: number;
    carry_forward_enabled?: boolean;
    notes?: string | null;
}

export interface UpdateProfilerProfileRequest {
    id: number;
    bank_id?: number;
    credit_card_number?: string;
    pre_planned_deposit_amount?: number;
    carry_forward_enabled?: boolean;
    notes?: string | null;
}

export interface MarkProfileDoneRequest {
    id: number;
}

export interface DeleteProfilerProfileRequest {
    id: number;
}

export interface ProfilerProfileResponse {
    success: boolean;
    data: ProfilerProfile;
    code: string;
    message: string;
}

export interface DeleteProfilerProfileResponse {
    success: boolean;
    data: null;
    code: string;
    message: string;
}

export const profilerProfileService = {
    // Get paginated profiler profiles with filters and sorting
    getPaginatedProfiles: async (filters: ProfilerProfileFilters = {}): Promise<ProfilerProfilePaginatedResponse> => {
        const url = buildEndpointUrl(PROFILER_PROFILE_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get dashboard profiles (active with positive balance)
    getDashboardProfiles: async (filters: Omit<ProfilerProfileFilters, 'status' | 'has_positive_balance'> = {}): Promise<ProfilerProfilePaginatedResponse> => {
        const url = buildEndpointUrl(PROFILER_PROFILE_ENDPOINTS.DASHBOARD, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler profile autocomplete suggestions
    getProfileAutocomplete: async (filters: ProfilerProfileAutocompleteFilters = {}): Promise<ProfilerProfileAutocompleteResponse> => {
        const url = buildEndpointUrl(PROFILER_PROFILE_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get profiler profile by ID
    getProfileById: async (id: number): Promise<ProfilerProfileResponse> => {
        const response = await api.get(PROFILER_PROFILE_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    },

    // Get profiles by client ID
    getProfilesByClient: async (clientId: number): Promise<ProfilerProfilePaginatedResponse> => {
        const response = await api.get(PROFILER_PROFILE_ENDPOINTS.GET_BY_CLIENT(clientId));
        return response.data;
    },

    // Create a new profiler profile
    createProfile: async (profileData: CreateProfilerProfileRequest): Promise<ProfilerProfileResponse> => {
        const response = await api.post(PROFILER_PROFILE_ENDPOINTS.CREATE, profileData);
        return response.data;
    },

    // Update an existing profiler profile
    updateProfile: async (profileData: UpdateProfilerProfileRequest): Promise<ProfilerProfileResponse> => {
        const response = await api.put(PROFILER_PROFILE_ENDPOINTS.UPDATE, profileData);
        return response.data;
    },

    // Mark profile as done
    markProfileDone: async (markDoneData: MarkProfileDoneRequest): Promise<ProfilerProfileResponse> => {
        const response = await api.put(PROFILER_PROFILE_ENDPOINTS.MARK_DONE, markDoneData);
        return response.data;
    },

    // Delete a profiler profile
    deleteProfile: async (deleteData: DeleteProfilerProfileRequest): Promise<DeleteProfilerProfileResponse> => {
        const response = await api.delete(PROFILER_PROFILE_ENDPOINTS.DELETE, { data: deleteData });
        return response.data;
    },
};

export default profilerProfileService;

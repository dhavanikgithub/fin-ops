/**
 * Profiler Client Types
 * Based on profiler_clients table
 */

export interface ProfilerClient {
    id: number;
    name: string;
    email?: string | null;
    mobile_number?: string | null;
    aadhaar_card_number?: string | null;
    aadhaar_card_image?: string | null;
    notes?: string | null;
    created_at: Date;
    updated_at: Date;
    profile_count?: number; // Count of profiles for this client
}

export interface ProfilerClientInput {
    name: string;
    email?: string | null;
    mobile_number?: string | null;
    aadhaar_card_number?: string | null;
    aadhaar_card_image?: string | null;
    notes?: string | null;
}

export interface ProfilerClientUpdateInput extends ProfilerClientInput {
    id: number;
}

export interface DeleteProfilerClientInput {
    id: number;
}

export interface ProfilerClientSearch {
    search?: string; // Search in name, email, mobile_number, aadhaar_card_number, notes
}

export interface ProfilerClientFilter {
    has_profiles?: boolean; // Filter clients with/without profiles
}

export interface ProfilerClientSort {
    sort_by?: 'name' | 'email' | 'mobile_number' | 'created_at' | 'profile_count';
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerClientPagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetProfilerClientsInput 
    extends ProfilerClientSearch, 
            ProfilerClientFilter,
            ProfilerClientSort, 
            ProfilerClientPagination {}

export interface PaginatedProfilerClientResponse {
    data: ProfilerClient[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    search_applied?: string;
    filters_applied?: ProfilerClientFilter;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
}

export interface ProfilerClientAutocompleteInput {
    search?: string;
    limit?: number; // Default: 5, Max: 10
}

export interface ProfilerClientAutocompleteItem {
    id: number;
    name: string;
    email?: string | null;
    mobile_number?: string | null;
    profile_count?: number;
}

export interface ProfilerClientAutocompleteResponse {
    data: ProfilerClientAutocompleteItem[];
    total_count: number;
}

// Validation helpers
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
};

export const isValidMobileNumber = (mobile: string): boolean => {
    return mobile.length >= 10;
};

export const isValidAadhaarNumber = (aadhaar: string): boolean => {
    return aadhaar.length === 12 && /^\d+$/.test(aadhaar);
};

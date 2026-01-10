/**
 * Profiler Bank Types
 * Based on profiler_banks table
 */

export interface ProfilerBank {
    id: number;
    bank_name: string;
    created_at: Date;
    updated_at: Date;
    profile_count?: number; // Count of profiles using this bank
}

export interface ProfilerBankInput {
    bank_name: string;
}

export interface ProfilerBankUpdateInput extends ProfilerBankInput {
    id: number;
}

export interface DeleteProfilerBankInput {
    id: number;
}

export interface ProfilerBankSearch {
    search?: string; // Search in bank_name
}

export interface ProfilerBankFilter {
    has_profiles?: boolean; // Filter banks with/without profiles
}

export interface ProfilerBankSort {
    sort_by?: 'bank_name' | 'created_at' | 'profile_count';
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerBankPagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetProfilerBanksInput 
    extends ProfilerBankSearch, 
            ProfilerBankFilter,
            ProfilerBankSort, 
            ProfilerBankPagination {}

export interface PaginatedProfilerBankResponse {
    data: ProfilerBank[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    search_applied?: string;
    filters_applied?: ProfilerBankFilter;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
}

export interface ProfilerBankAutocompleteInput {
    search?: string;
    limit?: number; // Default: 5, Max: 10
}

export interface ProfilerBankAutocompleteItem {
    id: number;
    bank_name: string;
    profile_count?: number;
}

export interface ProfilerBankAutocompleteResponse {
    data: ProfilerBankAutocompleteItem[];
    total_count: number;
}

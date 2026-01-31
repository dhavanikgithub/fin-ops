/**
 * Profiler Profile Types
 * Based on profiler_profiles table
 */

export type ProfilerProfileStatus = 'active' | 'done';

export interface ProfilerProfile {
    id: number;
    client_id: number;
    bank_id: number;
    credit_card_number: string;
    pre_planned_deposit_amount: number;
    current_balance: number;
    total_withdrawn_amount: number;
    carry_forward_enabled: boolean;
    status: ProfilerProfileStatus;
    notes?: string | null;
    marked_done_at?: Date | null;
    created_at: Date;
    updated_at: Date;
    // Joined data
    client_name?: string;
    client_email?: string | null;
    client_mobile?: string | null;
    bank_name?: string;
    transaction_count?: number;
    remaining_balance?: number; // Calculated: current_balance - total_withdrawn_amount
}

export interface ProfilerProfileInput {
    client_id: number;
    bank_id: number;
    credit_card_number: string;
    pre_planned_deposit_amount: number;
    carry_forward_enabled?: boolean;
    notes?: string | null;
}

export interface ProfilerProfileUpdateInput {
    id: number;
    bank_id?: number;
    credit_card_number?: string;
    pre_planned_deposit_amount?: number;
    carry_forward_enabled?: boolean;
    notes?: string | null;
}

export interface MarkProfileAsDoneInput {
    id: number;
}

export interface DeleteProfilerProfileInput {
    id: number;
}

export interface ProfilerProfileSearch {
    search?: string; // Search in client_name, bank_name, credit_card_number, notes
}

export interface ProfilerProfileFilter {
    client_id?: number | number[]; // Filter by client(s)
    bank_id?: number | number[]; // Filter by bank(s)
    status?: ProfilerProfileStatus | ProfilerProfileStatus[]; // Filter by status
    carry_forward_enabled?: boolean; // Filter by carry forward
    has_positive_balance?: boolean; // Filter profiles with remaining_balance > 0
    has_negative_balance?: boolean; // Filter profiles with remaining_balance < 0
    balance_greater_than?: number; // Filter remaining_balance > value
    balance_less_than?: number; // Filter remaining_balance < value

    // Date range filters
    created_at_start?: string; // Filter profiles created on or after this date (YYYY-MM-DD)
    created_at_end?: string; // Filter profiles created on or before this date (YYYY-MM-DD)

    // Base amount filters
    pre_planned_deposit_amount?: number; // Filter by exact pre-planned deposit amount
    min_deposit_amount?: number; // Filter pre_planned_deposit_amount >= value
    max_deposit_amount?: number; // Filter pre_planned_deposit_amount <= value
}

export interface ProfilerProfileSort {
    sort_by?: 
        | 'client_name' 
        | 'bank_name' 
        | 'credit_card_number'
        | 'pre_planned_deposit_amount'
        | 'current_balance'
        | 'total_withdrawn_amount'
        | 'remaining_balance'
        | 'created_at'
        | 'transaction_count';
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerProfilePagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetProfilerProfilesInput 
    extends ProfilerProfileSearch, 
            ProfilerProfileFilter,
            ProfilerProfileSort, 
            ProfilerProfilePagination {}

export interface PaginatedProfilerProfileResponse {
    data: ProfilerProfile[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    search_applied?: string;
    filters_applied?: ProfilerProfileFilter;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
}

export interface ProfilerProfileAutocompleteInput {
    search?: string;
    client_id?: number; // Filter by client
    status?: ProfilerProfileStatus; // Filter by status
    limit?: number; // Default: 5, Max: 10
}

export interface ProfilerProfileAutocompleteItem {
    id: number;
    client_name: string;
    bank_name: string;
    credit_card_number: string;
    remaining_balance: number;
    status: ProfilerProfileStatus;
}

export interface ProfilerProfileAutocompleteResponse {
    data: ProfilerProfileAutocompleteItem[];
    total_count: number;
}

// Dashboard specific types
export interface DashboardProfileFilter {
    client_id?: number; // Optional filter by client
    bank_id?: number; // Optional filter by bank
}

export interface DashboardProfile extends ProfilerProfile {
    // Already includes all needed fields from ProfilerProfile
}

export interface GetDashboardProfilesInput extends DashboardProfileFilter, ProfilerProfilePagination {}

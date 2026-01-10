/**
 * Profiler Transaction Types
 * Based on profiler_transactions table
 */

export type ProfilerTransactionType = 'deposit' | 'withdraw';

export interface ProfilerTransaction {
    id: number;
    profile_id: number;
    transaction_type: ProfilerTransactionType;
    amount: number;
    withdraw_charges_percentage?: number | null;
    withdraw_charges_amount?: number | null;
    notes?: string | null;
    created_at: Date;
    updated_at: Date;
    // Joined data
    client_name?: string;
    bank_name?: string;
    credit_card_number?: string;
    profile_status?: string;
}

export interface ProfilerDepositTransactionInput {
    profile_id: number;
    amount: number;
    notes?: string | null;
}

export interface ProfilerWithdrawTransactionInput {
    profile_id: number;
    amount: number;
    withdraw_charges_percentage?: number;
    notes?: string | null;
}

export interface DeleteProfilerTransactionInput {
    id: number;
}

export interface ProfilerTransactionSearch {
    search?: string; // Search in client_name, bank_name, credit_card_number, notes
}

export interface ProfilerTransactionFilter {
    profile_id?: number | number[]; // Filter by profile(s)
    client_id?: number | number[]; // Filter by client(s)
    bank_id?: number | number[]; // Filter by bank(s)
    transaction_type?: ProfilerTransactionType | ProfilerTransactionType[]; // Filter by type
    amount_greater_than?: number; // Filter amount > value
    amount_less_than?: number; // Filter amount < value
    date_from?: Date | string; // Filter created_at >= date
    date_to?: Date | string; // Filter created_at <= date
}

export interface ProfilerTransactionSort {
    sort_by?: 
        | 'created_at'
        | 'amount'
        | 'transaction_type'
        | 'client_name'
        | 'bank_name';
    sort_order?: 'asc' | 'desc';
}

export interface ProfilerTransactionPagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetProfilerTransactionsInput 
    extends ProfilerTransactionSearch, 
            ProfilerTransactionFilter,
            ProfilerTransactionSort, 
            ProfilerTransactionPagination {}

export interface PaginatedProfilerTransactionResponse {
    data: ProfilerTransaction[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    search_applied?: string;
    filters_applied?: ProfilerTransactionFilter;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
    summary?: {
        total_deposits: number;
        total_withdrawals: number;
        total_charges: number;
        net_amount: number;
    };
}

// Validation helper
export const calculateWithdrawCharges = (amount: number, percentage: number): number => {
    return Math.round((amount * percentage / 100) * 100) / 100; // Round to 2 decimal places
};

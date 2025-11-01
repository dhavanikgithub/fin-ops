export interface Bank {
    id: number;
    name: string;
    create_date?: Date | null;
    create_time?: string | null;
    modify_date?: Date | null;
    modify_time?: string | null;
    transaction_count?: number;
}

export interface BankInput {
    name: string;
}

export interface BankUpdateInput extends BankInput {
    id: number;
}

export interface DeleteBankInput {
    id: number;
}

export interface BankSearch {
    search?: string; // Search in bank name
}

export interface BankSort {
    sort_by?: 'name' | 'create_date' | 'transaction_count';
    sort_order?: 'asc' | 'desc';
}

export interface BankPagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetBanksInput extends BankSearch, BankSort, BankPagination {}

export interface PaginatedBankResponse {
    data: Bank[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    search_applied?: string;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
}

export interface BankAutocompleteInput {
    search: string;
    limit?: number; // Default 5, max 10
}

export interface BankAutocompleteItem {
    id: number;
    name: string;
}

export interface BankAutocompleteResponse {
    data: BankAutocompleteItem[];
    search_query: string;
    result_count: number;
    limit_applied: number;
}
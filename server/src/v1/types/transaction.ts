// Transaction type constants
export const TRANSACTION_TYPES = {
    DEPOSIT: 'Deposit',
    WITHDRAW: 'Withdraw'
} as const;

export type TransactionType = typeof TRANSACTION_TYPES.DEPOSIT | typeof TRANSACTION_TYPES.WITHDRAW;

export interface Transaction {
    id?: number;
    transaction_type: number;
    client_id: number;
    widthdraw_charges: number;
    transaction_amount: number;
    client_name: string;
    bank_name?: string | null;
    card_name?: string | null;
    bank_id?: number | null;
    card_id?: number | null;
    remark: string;
    create_date?: Date | null;
    create_time?: string | null;
    modify_date?: Date | null;
    modify_time?: string | null;
}

export interface TransactionInput {
    client_id: number;
    transaction_type: number;
    widthdraw_charges: number;
    transaction_amount: number;
    bank_id?: number | null;
    card_id?: number | null;
    remark?: string;
}

export interface TransactionUpdateInput {
    id: number;
    client_id?: number;
    transaction_type?: number;
    widthdraw_charges?: number;
    transaction_amount?: number;
    bank_id?: number | null;
    card_id?: number | null;
    remark?: string;
}

export interface DeleteTransactionInput {
    id: number;
}

export interface TransactionFilters {
    transaction_type?: number; // 1 for Deposit, 0 for Withdraw
    min_amount?: number;
    max_amount?: number;
    start_date?: string; // YYYY-MM-DD format
    end_date?: string; // YYYY-MM-DD format
    bank_ids?: number[];
    card_ids?: number[];
    client_ids?: number[];
}

export interface TransactionSearch {
    search?: string; // Search in client_name, bank_name, card_name, remark
}

export interface TransactionSort {
    sort_by?: 'create_date' | 'transaction_amount' | 'client_name' | 'bank_name' | 'card_name';
    sort_order?: 'asc' | 'desc';
}

export interface TransactionPagination {
    page?: number; // Page number (starting from 1)
    limit?: number; // Number of records per page (default 50)
}

export interface GetTransactionsInput extends TransactionFilters, TransactionSearch, TransactionSort, TransactionPagination {}

export interface PaginatedTransactionResponse {
    data: Transaction[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    filters_applied: TransactionFilters;
    search_applied?: string;
    sort_applied: {
        sort_by: string;
        sort_order: string;
    };
}

// Report request types
export interface ReportRequestBody {
    clientId?: string | null;
    startDate?: string;
    endDate?: string;
}

// Report response types
export interface TransactionReportData {
    transaction_type: string;
    transaction_amount: string;
    widthdraw_charges: string;
    widthdraw_charges_pr: string;
    date: string;
    time: string;
    is_widthdraw_transaction: boolean;
    bank_name: string;
    card_name: string;
}

export interface ClientTotal {
    final_amount: string;
    transaction_amount: string;
    widthdraw_charges: string;
}

export interface GroupedData {
    total: ClientTotal;
    data: TransactionReportData[];
    clientInfo?: {
        name: string;
        email?: string | null;
        contact?: string | null;
        address?: string | null;
    };
}

export interface ReportData {
    isClientSpecific: boolean;
    startDate: string;
    endDate: string;
    groupedData: { [clientName: string]: GroupedData };
    columns: string[];
}

export interface TransactionRecord {
    id: number;
    transaction_type: number;
    client_id: number;
    widthdraw_charges: number;
    transaction_amount: number;
    client_name: string;
    client_email?: string | null;
    client_contact?: string | null;
    client_address?: string | null;
    bank_name?: string | null;
    card_name?: string | null;
    bank_id?: number | null;
    card_id?: number | null;
    remark: string;
    create_date?: string | null;
    create_time?: string | null;
    modify_date?: string | null;
    modify_time?: string | null;
}


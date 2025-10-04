// Report request types
export interface ReportRequestBody {
    clientId?: string | null;
    startDate?: string;
    endDate?: string;
    format?: 'PDF' | 'Excel' | 'JSON' | 'CSV';
    fields?: string[]; // For custom field selection
    filters?: {
        transaction_type?: number;
        min_amount?: number;
        max_amount?: number;
        bank_ids?: number[];
        card_ids?: number[];
        client_ids?: number[];
        search?: string;
    };
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
}

export interface ReportData {
    isClientSpecific: boolean;
    startDate: string;
    endDate: string;
    groupedData: { [clientName: string]: GroupedData };
    columns: string[];
}

export interface ReportResponse {
    content: string; // Base64 for PDF/Excel, plain text for CSV/JSON
    filename: string;
    mimeType: string;
    format: string;
    metadata: {
        total_rows: number;
        file_size_bytes: number;
        generated_at: string;
        filters_applied?: any;
    };
}

// Raw transaction data for export
export interface TransactionExportRecord {
    id: number;
    transaction_type: string;
    client_name: string;
    bank_name: string | null;
    card_name: string | null;
    transaction_amount: number;
    widthdraw_charges: number;
    remark: string;
    create_date: string | null;
    create_time: string | null;
}

export interface TransactionRecord {
    id: number;
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
    create_date?: string | null;
    create_time?: string | null;
    modify_date?: string | null;
    modify_time?: string | null;
}
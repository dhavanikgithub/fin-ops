// Transaction report SQL queries

export const TRANSACTION_REPORT_QUERIES = {
    // Get transactions with client, bank and card details for report
    GET_TRANSACTIONS_FOR_REPORT: `
        SELECT 
            tr.id,
            tr.transaction_type,
            tr.client_id,
            tr.widthdraw_charges,
            tr.transaction_amount,
            tr.bank_id,
            tr.card_id,
            tr.remark,
            tr.create_date,
            tr.create_time,
            tr.modify_date,
            tr.modify_time,
            c.name AS client_name,
            bk.name AS bank_name,
            ct.name AS card_name
        FROM transaction_records tr 
        JOIN client c ON tr.client_id = c.id 
        LEFT JOIN bank bk ON tr.bank_id = bk.id
        LEFT JOIN card ct ON tr.card_id = ct.id
        WHERE tr.create_date BETWEEN $1 AND $2
    `,

    // Get transactions for specific client
    GET_TRANSACTIONS_FOR_REPORT_BY_CLIENT: `
        SELECT 
            tr.id,
            tr.transaction_type,
            tr.client_id,
            tr.widthdraw_charges,
            tr.transaction_amount,
            tr.bank_id,
            tr.card_id,
            tr.remark,
            tr.create_date,
            tr.create_time,
            tr.modify_date,
            tr.modify_time,
            c.name AS client_name,
            bk.name AS bank_name,
            ct.name AS card_name
        FROM transaction_records tr 
        JOIN client c ON tr.client_id = c.id 
        LEFT JOIN bank bk ON tr.bank_id = bk.id
        LEFT JOIN card ct ON tr.card_id = ct.id
        WHERE tr.create_date BETWEEN $1 AND $2
        AND tr.client_id = $3
    `,

    // Get transactions for export with full filtering support
    GET_TRANSACTIONS_FOR_EXPORT: `
        SELECT 
            tr.id,
            tr.transaction_type,
            tr.client_id,
            tr.widthdraw_charges,
            tr.transaction_amount,
            tr.bank_id,
            tr.card_id,
            tr.remark,
            tr.create_date,
            tr.create_time,
            c.name AS client_name,
            bk.name AS bank_name,
            ct.name AS card_name
        FROM transaction_records tr 
        JOIN client c ON tr.client_id = c.id 
        LEFT JOIN bank bk ON tr.bank_id = bk.id
        LEFT JOIN card ct ON tr.card_id = ct.id
    `
} as const;
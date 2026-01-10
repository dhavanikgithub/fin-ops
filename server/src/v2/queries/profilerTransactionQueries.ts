/**
 * SQL queries for profiler transaction operations
 */

export const PROFILER_TRANSACTION_QUERIES = {
    // GET all transactions with joined data
    GET_ALL_TRANSACTIONS: `
        SELECT 
            t.*,
            c.name AS client_name,
            b.bank_name,
            p.credit_card_number,
            p.status AS profile_status
        FROM profiler_transactions t
        INNER JOIN profiler_profiles p ON t.profile_id = p.id
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `,

    // Count query for pagination
    COUNT_TRANSACTIONS: `
        SELECT COUNT(*) as total_count
        FROM profiler_transactions t
        INNER JOIN profiler_profiles p ON t.profile_id = p.id
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `,

    // GET transaction by ID
    GET_TRANSACTION_BY_ID: `
        SELECT 
            t.*,
            c.name AS client_name,
            b.bank_name,
            p.credit_card_number,
            p.status AS profile_status
        FROM profiler_transactions t
        INNER JOIN profiler_profiles p ON t.profile_id = p.id
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        WHERE t.id = $1
    `,

    // GET transactions by profile ID
    GET_TRANSACTIONS_BY_PROFILE: `
        SELECT 
            t.*,
            c.name AS client_name,
            b.bank_name,
            p.credit_card_number,
            p.status AS profile_status
        FROM profiler_transactions t
        INNER JOIN profiler_profiles p ON t.profile_id = p.id
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        WHERE t.profile_id = $1
        ORDER BY t.created_at DESC
    `,

    // POST create deposit transaction
    CREATE_DEPOSIT_TRANSACTION: `
        INSERT INTO profiler_transactions (
            profile_id,
            transaction_type,
            amount,
            notes
        )
        VALUES ($1, 'deposit', $2, $3)
        RETURNING *
    `,

    // POST create withdraw transaction
    CREATE_WITHDRAW_TRANSACTION: `
        INSERT INTO profiler_transactions (
            profile_id,
            transaction_type,
            amount,
            withdraw_charges_percentage,
            withdraw_charges_amount,
            notes
        )
        VALUES ($1, 'withdraw', $2, $3, $4, $5)
        RETURNING *
    `,

    // DELETE transaction
    DELETE_TRANSACTION: `
        DELETE FROM profiler_transactions
        WHERE id = $1
        RETURNING *
    `,

    // Check if transaction exists
    CHECK_TRANSACTION_EXISTS: `
        SELECT id FROM profiler_transactions WHERE id = $1
    `,

    // GET transaction summary for a profile
    GET_PROFILE_TRANSACTION_SUMMARY: `
        SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END), 0) AS total_deposits,
            COALESCE(SUM(CASE WHEN transaction_type = 'withdraw' THEN amount ELSE 0 END), 0) AS total_withdrawals,
            COALESCE(SUM(CASE WHEN transaction_type = 'withdraw' THEN COALESCE(withdraw_charges_amount, 0) ELSE 0 END), 0) AS total_charges,
            COUNT(*) AS transaction_count
        FROM profiler_transactions
        WHERE profile_id = $1
    `,

    // GET transaction summary for filtered results
    GET_TRANSACTION_SUMMARY: `
        SELECT 
            COALESCE(SUM(CASE WHEN t.transaction_type = 'deposit' THEN t.amount ELSE 0 END), 0) AS total_deposits,
            COALESCE(SUM(CASE WHEN t.transaction_type = 'withdraw' THEN t.amount ELSE 0 END), 0) AS total_withdrawals,
            COALESCE(SUM(CASE WHEN t.transaction_type = 'withdraw' THEN COALESCE(t.withdraw_charges_amount, 0) ELSE 0 END), 0) AS total_charges
        FROM profiler_transactions t
        INNER JOIN profiler_profiles p ON t.profile_id = p.id
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `
};

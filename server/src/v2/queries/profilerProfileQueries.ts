/**
 * SQL queries for profiler profile operations
 */

export const PROFILER_PROFILE_QUERIES = {
    // GET all profiles with joined data
    GET_ALL_PROFILES: `
        SELECT 
            p.*,
            c.name AS client_name,
            c.email AS client_email,
            c.mobile_number AS client_mobile,
            b.bank_name,
            (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
            COALESCE(t.transaction_count, 0) AS transaction_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        LEFT JOIN (
            SELECT 
                profile_id, 
                COUNT(*) AS transaction_count
            FROM profiler_transactions
            GROUP BY profile_id
        ) t ON t.profile_id = p.id
    `,

    // Count query for pagination
    COUNT_PROFILES: `
        SELECT COUNT(*) as total_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `,

    // GET profile by ID with joined data
    GET_PROFILE_BY_ID: `
        SELECT 
            p.*,
            c.name AS client_name,
            c.email AS client_email,
            c.mobile_number AS client_mobile,
            b.bank_name,
            (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
            COALESCE(t.transaction_count, 0) AS transaction_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        LEFT JOIN (
            SELECT 
                profile_id, 
                COUNT(*) AS transaction_count
            FROM profiler_transactions
            GROUP BY profile_id
        ) t ON t.profile_id = p.id
        WHERE p.id = $1
    `,

    // GET profiles by client ID
    GET_PROFILES_BY_CLIENT: `
        SELECT 
            p.*,
            c.name AS client_name,
            c.email AS client_email,
            c.mobile_number AS client_mobile,
            b.bank_name,
            (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
            COALESCE(t.transaction_count, 0) AS transaction_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        LEFT JOIN (
            SELECT 
                profile_id, 
                COUNT(*) AS transaction_count
            FROM profiler_transactions
            GROUP BY profile_id
        ) t ON t.profile_id = p.id
        WHERE p.client_id = $1
        ORDER BY p.created_at DESC
    `,

    // GET dashboard profiles (active, positive balance, not done)
    GET_DASHBOARD_PROFILES: `
        SELECT 
            p.*,
            c.name AS client_name,
            c.email AS client_email,
            c.mobile_number AS client_mobile,
            b.bank_name,
            (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
            COALESCE(t.transaction_count, 0) AS transaction_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
        LEFT JOIN (
            SELECT 
                profile_id, 
                COUNT(*) AS transaction_count
            FROM profiler_transactions
            GROUP BY profile_id
        ) t ON t.profile_id = p.id
        WHERE p.status = 'active'
        AND (p.current_balance - p.total_withdrawn_amount) > 0
    `,

    // Count dashboard profiles
    COUNT_DASHBOARD_PROFILES: `
        SELECT COUNT(*) as total_count
        FROM profiler_profiles p
        WHERE p.status = 'active'
        AND (p.current_balance - p.total_withdrawn_amount) > 0
    `,

    // POST create new profile
    CREATE_PROFILE: `
        INSERT INTO profiler_profiles (
            client_id,
            bank_id,
            credit_card_number,
            pre_planned_deposit_amount,
            carry_forward_enabled,
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `,

    // PUT update profile
    UPDATE_PROFILE: `
        UPDATE profiler_profiles 
        SET 
            bank_id = COALESCE($2, bank_id),
            credit_card_number = COALESCE($3, credit_card_number),
            pre_planned_deposit_amount = COALESCE($4, pre_planned_deposit_amount),
            carry_forward_enabled = COALESCE($5, carry_forward_enabled),
            notes = COALESCE($6, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `,

    // PUT mark profile as done
    MARK_PROFILE_AS_DONE: `
        UPDATE profiler_profiles 
        SET 
            status = 'done',
            marked_done_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'active'
        RETURNING *
    `,

    // DELETE profile (only if no transactions exist)
    DELETE_PROFILE: `
        DELETE FROM profiler_profiles
        WHERE id = $1 
        AND NOT EXISTS (
            SELECT 1 FROM profiler_transactions WHERE profile_id = $1
        )
        RETURNING *
    `,

    // Check if profile exists
    CHECK_PROFILE_EXISTS: `
        SELECT id FROM profiler_profiles WHERE id = $1
    `,

    // GET autocomplete profiles
    GET_AUTOCOMPLETE_PROFILES: `
        SELECT 
            p.id,
            c.name AS client_name,
            b.bank_name,
            p.credit_card_number,
            (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
            p.status
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `,

    // Count autocomplete results
    COUNT_AUTOCOMPLETE_PROFILES: `
        SELECT COUNT(*) as total_count
        FROM profiler_profiles p
        INNER JOIN profiler_clients c ON p.client_id = c.id
        INNER JOIN profiler_banks b ON p.bank_id = b.id
    `
};

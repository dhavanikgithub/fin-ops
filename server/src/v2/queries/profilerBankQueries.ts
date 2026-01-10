/**
 * SQL queries for profiler bank operations
 */

export const PROFILER_BANK_QUERIES = {
    // GET all banks with profile count
    GET_ALL_BANKS: `
        SELECT 
            b.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_banks b
        LEFT JOIN (
            SELECT 
                bank_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY bank_id
        ) p ON p.bank_id = b.id
        ORDER BY b.bank_name ASC
    `,

    // Count query for pagination
    COUNT_BANKS: `
        SELECT COUNT(*) as total_count
        FROM profiler_banks b
    `,

    // GET bank by ID with profile count
    GET_BANK_BY_ID: `
        SELECT 
            b.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_banks b
        LEFT JOIN (
            SELECT 
                bank_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY bank_id
        ) p ON p.bank_id = b.id
        WHERE b.id = $1
    `,

    // POST create new bank
    CREATE_BANK: `
        INSERT INTO profiler_banks (bank_name)
        VALUES ($1)
        RETURNING *, 0 AS profile_count
    `,

    // PUT update bank
    UPDATE_BANK: `
        WITH updated_bank AS (
            UPDATE profiler_banks 
            SET 
                bank_name = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        )
        SELECT 
            ub.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM updated_bank ub
        LEFT JOIN (
            SELECT 
                bank_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY bank_id
        ) p ON p.bank_id = ub.id
    `,

    // DELETE bank (only if no profiles exist)
    DELETE_BANK: `
        DELETE FROM profiler_banks
        WHERE id = $1 
        AND NOT EXISTS (
            SELECT 1 FROM profiler_profiles WHERE bank_id = $1
        )
        RETURNING *
    `,

    // Check if bank exists
    CHECK_BANK_EXISTS: `
        SELECT id FROM profiler_banks WHERE id = $1
    `,

    // Check if bank name exists (for uniqueness validation)
    CHECK_BANK_NAME_EXISTS: `
        SELECT id FROM profiler_banks WHERE LOWER(bank_name) = LOWER($1) AND id != COALESCE($2, 0)
    `,

    // GET autocomplete banks
    GET_AUTOCOMPLETE_BANKS: `
        SELECT 
            b.id,
            b.bank_name,
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_banks b
        LEFT JOIN (
            SELECT 
                bank_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY bank_id
        ) p ON p.bank_id = b.id
    `,

    // Count autocomplete results
    COUNT_AUTOCOMPLETE_BANKS: `
        SELECT COUNT(*) as total_count
        FROM profiler_banks b
    `
};

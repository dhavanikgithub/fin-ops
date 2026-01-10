/**
 * SQL queries for profiler client operations
 */

export const PROFILER_CLIENT_QUERIES = {
    // GET all clients with profile count
    GET_ALL_CLIENTS: `
        SELECT 
            c.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_clients c
        LEFT JOIN (
            SELECT 
                client_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY client_id
        ) p ON p.client_id = c.id
        ORDER BY c.name ASC
    `,

    // Count query for pagination
    COUNT_CLIENTS: `
        SELECT COUNT(*) as total_count
        FROM profiler_clients c
    `,

    // GET client by ID with profile count
    GET_CLIENT_BY_ID: `
        SELECT 
            c.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_clients c
        LEFT JOIN (
            SELECT 
                client_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY client_id
        ) p ON p.client_id = c.id
        WHERE c.id = $1
    `,

    // POST create new client
    CREATE_CLIENT: `
        INSERT INTO profiler_clients (
            name, 
            email, 
            mobile_number, 
            aadhaar_card_number, 
            aadhaar_card_image, 
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *, 0 AS profile_count
    `,

    // PUT update client
    UPDATE_CLIENT: `
        WITH updated_client AS (
            UPDATE profiler_clients 
            SET 
                name = $2,
                email = $3,
                mobile_number = $4,
                aadhaar_card_number = $5,
                aadhaar_card_image = $6,
                notes = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        )
        SELECT 
            uc.*, 
            COALESCE(p.profile_count, 0) AS profile_count
        FROM updated_client uc
        LEFT JOIN (
            SELECT 
                client_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY client_id
        ) p ON p.client_id = uc.id
    `,

    // DELETE client (only if no profiles exist)
    DELETE_CLIENT: `
        DELETE FROM profiler_clients
        WHERE id = $1 
        AND NOT EXISTS (
            SELECT 1 FROM profiler_profiles WHERE client_id = $1
        )
        RETURNING *
    `,

    // Check if client exists
    CHECK_CLIENT_EXISTS: `
        SELECT id FROM profiler_clients WHERE id = $1
    `,

    // GET autocomplete clients
    GET_AUTOCOMPLETE_CLIENTS: `
        SELECT 
            c.id,
            c.name,
            c.email,
            c.mobile_number,
            COALESCE(p.profile_count, 0) AS profile_count
        FROM profiler_clients c
        LEFT JOIN (
            SELECT 
                client_id, 
                COUNT(*) AS profile_count
            FROM profiler_profiles
            GROUP BY client_id
        ) p ON p.client_id = c.id
    `,

    // Count autocomplete results
    COUNT_AUTOCOMPLETE_CLIENTS: `
        SELECT COUNT(*) as total_count
        FROM profiler_clients c
    `
};

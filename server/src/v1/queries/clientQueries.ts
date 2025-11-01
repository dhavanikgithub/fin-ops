/**
 * SQL queries for client operations
 */

export const CLIENT_QUERIES = {
    // GET all clients with transaction count
    GET_ALL_CLIENTS: `
    SELECT 
      c.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM client c
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = c.id
    ORDER BY c.name ASC;
  `,

    // GET paginated clients with search and sort
    GET_PAGINATED_CLIENTS: `
    SELECT 
      c.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM client c
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = c.id
  `,

    // Count query for pagination
    COUNT_CLIENTS: `
    SELECT COUNT(*) as total_count
    FROM client c
  `,

    // POST create new client
    CREATE_CLIENT: `
    WITH inserted_client AS (
      INSERT INTO client (name, email, contact, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT 
      *, 
      0 AS transaction_count
    FROM inserted_client
    ORDER BY name ASC;
  `,

    // PUT update client
    UPDATE_CLIENT: `
    WITH updated_client AS (
      UPDATE client 
      SET name = $1, email = $2, contact = $3, address = $4
      WHERE id = $5
      RETURNING *
    )
    SELECT 
      uc.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM updated_client uc
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = uc.id
    ORDER BY uc.name ASC;
  `,

    // PUT update client with selective fields
    UPDATE_CLIENT_SELECTIVE: `
    WITH updated_client AS (
      UPDATE client 
      SET 
        name = COALESCE($1, name),
        email = CASE WHEN $2::text = 'SKIP_FIELD' THEN email ELSE $2 END,
        contact = CASE WHEN $3::text = 'SKIP_FIELD' THEN contact ELSE $3 END,
        address = CASE WHEN $4::text = 'SKIP_FIELD' THEN address ELSE $4 END
      WHERE id = $5
      RETURNING *
    )
    SELECT 
      uc.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM updated_client uc
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = uc.id
    ORDER BY uc.name ASC;
  `,

    // DELETE client
    DELETE_CLIENT: `
    DELETE FROM client WHERE id = $1 RETURNING *;
  `,

    // GET client by ID
    GET_CLIENT_BY_ID: `
    SELECT 
      c.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM client c
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = c.id
    WHERE c.id = $1;
  `,

    // GET client by name
    GET_CLIENT_BY_NAME: `
    SELECT 
      c.*, 
      COALESCE(tr.transaction_count, 0) AS transaction_count
    FROM client c
    LEFT JOIN (
      SELECT 
        client_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY client_id
    ) tr ON tr.client_id = c.id
    WHERE c.name = $1;
  `,

    // GET clients for autocomplete (id and name only)
    GET_CLIENTS_AUTOCOMPLETE: `
    SELECT id, name
    FROM client
  `
};
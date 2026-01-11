/**
 * SQL queries for transaction operations
 */

export const TRANSACTION_QUERIES = {
    // GET all transactions with client name, bank name, and card name
    GET_ALL_TRANSACTIONS: `
    SELECT tr.*, c.name AS client_name, bk.name AS bank_name, ct.name AS card_name
    FROM transaction_records tr 
    JOIN client c ON tr.client_id = c.id 
    LEFT JOIN bank bk ON tr.bank_id = bk.id
    LEFT JOIN card ct ON tr.card_id = ct.id
    ORDER BY tr.create_date DESC, tr.create_time DESC;
  `,

    // GET paginated transactions with filters, search, and sort
    GET_PAGINATED_TRANSACTIONS: `
    SELECT tr.*, c.name AS client_name, bk.name AS bank_name, ct.name AS card_name
    FROM transaction_records tr 
    JOIN client c ON tr.client_id = c.id 
    LEFT JOIN bank bk ON tr.bank_id = bk.id
    LEFT JOIN card ct ON tr.card_id = ct.id
  `,

    // Count query for pagination
    COUNT_TRANSACTIONS: `
    SELECT COUNT(*) as total_count
    FROM transaction_records tr 
    JOIN client c ON tr.client_id = c.id 
    LEFT JOIN bank bk ON tr.bank_id = bk.id
    LEFT JOIN card ct ON tr.card_id = ct.id
  `,

    // POST create new transaction
    CREATE_TRANSACTION: `
    INSERT INTO transaction_records(client_id, transaction_type, widthdraw_charges, transaction_amount, remark, bank_id, card_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;
  `,

    // GET transaction with client, bank, and card details by ID
    GET_TRANSACTION_WITH_DETAILS: `
    SELECT tr.*, c.name AS client_name, bk.name AS bank_name, ct.name AS card_name
    FROM transaction_records tr 
    JOIN client c ON tr.client_id = c.id 
    LEFT JOIN bank bk ON tr.bank_id = bk.id
    LEFT JOIN card ct ON tr.card_id = ct.id
    WHERE tr.id = $1;
  `,

    // DELETE transaction
    DELETE_TRANSACTION: `
    DELETE FROM transaction_records WHERE id = $1 RETURNING *;
  `,

    // GET transaction by ID (simple)
    GET_TRANSACTION_BY_ID: `
    SELECT * FROM transaction_records WHERE id = $1;
  `,

    // COUNT transactions for report preview (with filters and search)
    COUNT_TRANSACTIONS_FOR_REPORT: `
    SELECT COUNT(*) as total_count
    FROM transaction_records tr
    LEFT JOIN client c ON tr.client_id = c.id
    LEFT JOIN bank b ON tr.bank_id = b.id
    LEFT JOIN card ca ON tr.card_id = ca.id
  `,

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
            c.email AS client_email,
            c.contact AS client_contact,
            c.address AS client_address,
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
            c.email AS client_email,
            c.contact AS client_contact,
            c.address AS client_address,
            bk.name AS bank_name,
            ct.name AS card_name
        FROM transaction_records tr 
        JOIN client c ON tr.client_id = c.id 
        LEFT JOIN bank bk ON tr.bank_id = bk.id
        LEFT JOIN card ct ON tr.card_id = ct.id
        WHERE tr.create_date BETWEEN $1 AND $2
        AND tr.client_id = $3
    `
};
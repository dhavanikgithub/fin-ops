/**
 * SQL queries for bank operations
 */

export const BANK_QUERIES = {
    // GET all banks with transaction count
    GET_ALL_BANKS: `
    WITH bank_with_transactions AS (
      SELECT 
        b.id AS bank_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      LEFT JOIN bank b ON b.id = transaction_records.bank_id
      GROUP BY b.id
    )
    SELECT 
      bank.id, 
      bank.name, 
      bank.create_date, 
      bank.create_time, 
      bank.modify_date, 
      bank.modify_time, 
      COALESCE(bank_with_transactions.transaction_count, 0) AS transaction_count
    FROM bank
    LEFT JOIN bank_with_transactions 
      ON bank_with_transactions.bank_id = bank.id
    ORDER BY bank.name ASC;
  `,

    // GET paginated banks with search and sort
    GET_PAGINATED_BANKS: `
    WITH bank_with_transactions AS (
      SELECT 
        b.id AS bank_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      LEFT JOIN bank b ON b.id = transaction_records.bank_id
      GROUP BY b.id
    )
    SELECT 
      bank.id, 
      bank.name, 
      bank.create_date, 
      bank.create_time, 
      bank.modify_date, 
      bank.modify_time, 
      COALESCE(bank_with_transactions.transaction_count, 0) AS transaction_count
    FROM bank
    LEFT JOIN bank_with_transactions 
      ON bank_with_transactions.bank_id = bank.id
  `,

    // Count query for pagination
    COUNT_BANKS: `
    SELECT COUNT(*) as total_count
    FROM bank
  `,

    // POST create new bank
    CREATE_BANK: `
    WITH inserted_bank AS (
      INSERT INTO bank (name)
      VALUES ($1)
      RETURNING *
    )
    SELECT *, 0 AS transaction_count
    FROM inserted_bank
    ORDER BY name ASC;
  `,

    // PUT update bank
    UPDATE_BANK: `
    WITH updated_bank AS (
      UPDATE bank 
      SET name = $1
      WHERE id = $2
      RETURNING *
    )
    SELECT 
      ub.*, 
      COALESCE(bt.transaction_count, 0) AS transaction_count
    FROM updated_bank ub
    LEFT JOIN (
      SELECT bank_id, COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY bank_id
    ) bt ON bt.bank_id = ub.id
    ORDER BY ub.name ASC;
  `,

    // DELETE bank
    DELETE_BANK: `
    DELETE FROM bank WHERE id = $1 RETURNING *;
  `,

    // GET banks for autocomplete (id and name only)
    GET_BANKS_AUTOCOMPLETE: `
    SELECT id, name
    FROM bank
  `
};
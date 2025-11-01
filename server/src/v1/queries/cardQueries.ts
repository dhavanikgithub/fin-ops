/**
 * SQL queries for card operations
 */

export const CARD_QUERIES = {
    // GET all cards with transaction count
    GET_ALL_CARDS: `
    SELECT 
      c.*, 
      COALESCE(tc.transaction_count, 0) AS transaction_count
    FROM card c
    LEFT JOIN (
      SELECT 
        card_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY card_id
    ) tc ON tc.card_id = c.id
    ORDER BY c.name;
  `,

    // GET paginated cards with search and sort
    GET_PAGINATED_CARDS: `
    SELECT 
      c.*, 
      COALESCE(tc.transaction_count, 0) AS transaction_count
    FROM card c
    LEFT JOIN (
      SELECT 
        card_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY card_id
    ) tc ON tc.card_id = c.id
  `,

    // Count query for pagination
    COUNT_CARDS: `
    SELECT COUNT(*) as total_count
    FROM card c
  `,

    // POST create new card
    CREATE_CARD: `
    WITH inserted_card AS (
      INSERT INTO card (name)
      VALUES ($1)
      RETURNING *
    )
    SELECT 
      *, 
      0 AS transaction_count
    FROM inserted_card
    ORDER BY name;
  `,

    // PUT update card
    UPDATE_CARD: `
    WITH updated_card AS (
      UPDATE card 
      SET name = $1
      WHERE id = $2
      RETURNING *
    )
    SELECT 
      uc.*, 
      COALESCE(tc.transaction_count, 0) AS transaction_count
    FROM updated_card uc
    LEFT JOIN (
      SELECT 
        card_id, 
        COUNT(*) AS transaction_count
      FROM transaction_records
      GROUP BY card_id
    ) tc ON tc.card_id = uc.id
    ORDER BY uc.name;
  `,

    // DELETE card
    DELETE_CARD: `
    DELETE FROM card WHERE id = $1 RETURNING *;
  `,

    // GET cards for autocomplete (id and name only)
    GET_CARDS_AUTOCOMPLETE: `
    SELECT id, name
    FROM card
  `
};
/**
 * SQL queries for finkeda settings operations
 */

export const FINKEDA_SETTINGS_QUERIES = {
    // GET latest settings
    GET_LATEST_SETTINGS: `
        SELECT * FROM finkeda_calculator_settings
        ORDER BY id DESC
        LIMIT 1;
    `,

    // GET all settings history
    GET_SETTINGS_HISTORY: `
        SELECT * FROM finkeda_calculator_settings_history
        ORDER BY id DESC;
    `,

    // INSERT new settings
    INSERT_SETTINGS: `
        INSERT INTO finkeda_calculator_settings (rupay_card_charge_amount, master_card_charge_amount)
        VALUES ($1, $2)
        RETURNING *;
    `,

    // UPDATE existing settings
    UPDATE_SETTINGS: `
        UPDATE finkeda_calculator_settings 
        SET rupay_card_charge_amount = $1, 
            master_card_charge_amount = $2,
            modify_date = CURRENT_DATE,
            modify_time = CURRENT_TIME
        WHERE id = $3
        RETURNING *;
    `,

    // INSERT settings history
    INSERT_SETTINGS_HISTORY: `
        INSERT INTO finkeda_calculator_settings_history (
            calculator_settings_id, 
            previous_rupay_amount, 
            previous_master_amount, 
            new_rupay_amount, 
            new_master_amount
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `
};
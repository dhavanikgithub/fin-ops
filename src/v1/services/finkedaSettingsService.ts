import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { FINKEDA_SETTINGS_QUERIES } from '../queries/finkedaSettingsQueries.js';
import { FinkedaSettings, FinkedaSettingsInput, FinkedaSettingsHistory, FinkedaSettingsHistoryInput } from '../types/finkedaSettings.js';
import { DatabaseError, NotFoundError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Database service for finkeda settings operations
 */
export class FinkedaSettingsService {
    /**
     * Get latest settings
     */
    static async getLatestSettings(): Promise<FinkedaSettings | null> {
        try {
            const result: QueryResult<FinkedaSettings> = await query(FINKEDA_SETTINGS_QUERIES.GET_LATEST_SETTINGS);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error fetching latest settings:', error);
            throw new DatabaseError('Failed to fetch latest settings', error);
        }
    }

    /**
     * Get settings history
     */
    static async getSettingsHistory(): Promise<FinkedaSettingsHistory[]> {
        try {
            const result: QueryResult<FinkedaSettingsHistory> = await query(FINKEDA_SETTINGS_QUERIES.GET_SETTINGS_HISTORY);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching settings history:', error);
            throw new DatabaseError('Failed to fetch settings history', error);
        }
    }

    /**
     * Insert new settings
     */
    static async insertSettings(settingsData: FinkedaSettingsInput): Promise<FinkedaSettings> {
        try {
            const result: QueryResult<FinkedaSettings> = await query(
                FINKEDA_SETTINGS_QUERIES.INSERT_SETTINGS,
                [settingsData.rupay_card_charge_amount, settingsData.master_card_charge_amount]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create settings - no rows returned');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating settings:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create settings', error);
        }
    }

    /**
     * Update existing settings
     */
    static async updateSettings(id: number, settingsData: FinkedaSettingsInput): Promise<FinkedaSettings> {
        try {
            const result: QueryResult<FinkedaSettings> = await query(
                FINKEDA_SETTINGS_QUERIES.UPDATE_SETTINGS,
                [settingsData.rupay_card_charge_amount, settingsData.master_card_charge_amount, id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError('Settings not found');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error updating settings:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to update settings', error);
        }
    }

    /**
     * Insert settings history
     */
    static async insertSettingsHistory(historyData: FinkedaSettingsHistoryInput): Promise<FinkedaSettingsHistory> {
        try {
            const result: QueryResult<FinkedaSettingsHistory> = await query(
                FINKEDA_SETTINGS_QUERIES.INSERT_SETTINGS_HISTORY,
                [
                    historyData.calculator_settings_id,
                    historyData.previous_rupay_amount,
                    historyData.previous_master_amount,
                    historyData.new_rupay_amount,
                    historyData.new_master_amount
                ]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create settings history - no rows returned');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating settings history:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create settings history', error);
        }
    }
}
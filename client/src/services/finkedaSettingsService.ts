import api from './api';
import { FINKEDA_SETTINGS_ENDPOINTS } from '../constants/apiEndpoints';
import logger from '@/utils/logger';

export interface FinkedaSettings {
    id: number;
    rupay_card_charge_amount: number;
    master_card_charge_amount: number;
    create_date: string;
    create_time: string;
    modify_date?: string;
    modify_time?: string;
}

export interface UpdateFinkedaSettingsRequest {
    rupay_card_charge_amount: number;
    master_card_charge_amount: number;
}

export interface FinkedaSettingsResponse {
    success: boolean;
    data: FinkedaSettings | null;
    successCode: string;
    message: string;
    timestamp: string;
    statusCode: number;
}

export interface FinkedaSettingsHistoryResponse {
    success: boolean;
    data: Array<{
        id: number;
        calculator_settings_id: number;
        previous_rupay_amount: number;
        previous_master_amount: number;
        new_rupay_amount: number;
        new_master_amount: number;
        create_date: string;
        create_time: string;
    }>;
    successCode: string;
    message: string;
    timestamp: string;
    statusCode: number;
}

const finkedaSettingsService = {
    // Get latest settings
    getLatestSettings: async (): Promise<FinkedaSettings | null> => {
        try {
            const response = await api.get<FinkedaSettingsResponse>(FINKEDA_SETTINGS_ENDPOINTS.GET_LATEST);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            logger.error('Error fetching latest finkeda settings:', error);
            throw error;
        }
    },

    // Get settings history
    getSettingsHistory: async () => {
        try {
            const response = await api.get<FinkedaSettingsHistoryResponse>(FINKEDA_SETTINGS_ENDPOINTS.HISTORY);
            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            logger.error('Error fetching finkeda settings history:', error);
            throw error;
        }
    },

    // Update or create settings
    updateSettings: async (settings: UpdateFinkedaSettingsRequest): Promise<FinkedaSettings> => {
        try {
            const response = await api.put<FinkedaSettingsResponse>(FINKEDA_SETTINGS_ENDPOINTS.UPDATE, settings);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update settings');
        } catch (error) {
            logger.error('Error updating finkeda settings:', error);
            throw error;
        }
    }
};

export default finkedaSettingsService;
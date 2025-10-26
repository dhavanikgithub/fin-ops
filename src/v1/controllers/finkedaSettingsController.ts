import { Request, Response } from 'express';
import { FinkedaSettingsService } from '../services/finkedaSettingsService';
import { FinkedaSettingsInput } from '../types/finkedaSettings';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat';
import { ValidationError, asyncHandler } from '../../common/errors/index';

/**
 * Controller for finkeda settings operations
 */
export class FinkedaSettingsController {
    /**
     * GET latest settings
     */
    static getLatestSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const settings = await FinkedaSettingsService.getLatestSettings();

        if (!settings) {
            const response = createSuccessResponse(
                null,
                404,
                'NOT_FOUND',
                'No settings found'
            );
            res.status(404).json(response);
            return;
        }

        const response = createSuccessResponse(
            settings,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Latest settings retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET settings history
     */
    static getSettingsHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const history = await FinkedaSettingsService.getSettingsHistory();
        const response = createSuccessResponse(
            history,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Settings history retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * PUT update or create settings
     */
    static updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: FinkedaSettingsInput = req.body;

        // Validation
        if (typeof data.rupay_card_charge_amount !== 'number') {
            throw new ValidationError('Rupay card charge amount is required and must be a number', {
                field: 'rupay_card_charge_amount',
                value: data.rupay_card_charge_amount,
                expected: 'number'
            });
        }

        if (typeof data.master_card_charge_amount !== 'number') {
            throw new ValidationError('Master card charge amount is required and must be a number', {
                field: 'master_card_charge_amount',
                value: data.master_card_charge_amount,
                expected: 'number'
            });
        }

        // Get existing settings
        const existing = await FinkedaSettingsService.getLatestSettings();

        let updatedSetting;

        if (existing) {
            // Insert into history before update
            await FinkedaSettingsService.insertSettingsHistory({
                calculator_settings_id: existing.id!,
                previous_rupay_amount: existing.rupay_card_charge_amount,
                previous_master_amount: existing.master_card_charge_amount,
                new_rupay_amount: data.rupay_card_charge_amount,
                new_master_amount: data.master_card_charge_amount,
            });

            // Update main table
            updatedSetting = await FinkedaSettingsService.updateSettings(existing.id!, {
                rupay_card_charge_amount: data.rupay_card_charge_amount,
                master_card_charge_amount: data.master_card_charge_amount,
            });
        } else {
            // Create new settings
            updatedSetting = await FinkedaSettingsService.insertSettings({
                rupay_card_charge_amount: data.rupay_card_charge_amount,
                master_card_charge_amount: data.master_card_charge_amount,
            });
        }

        const response = createSuccessResponse(
            updatedSetting,
            200,
            SUCCESS_CODES.RESOURCE_UPDATED,
            'Settings updated successfully'
        );
        res.status(200).json(response);
    });
}
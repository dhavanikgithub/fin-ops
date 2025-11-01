import express from 'express';
import { FinkedaSettingsController } from '../controllers/finkedaSettingsController.js';

const router = express.Router();

/**
 * @route GET /api/v1/finkeda-settings
 * @description Get latest finkeda calculator settings
 * @access Public
 */
router.get('/', FinkedaSettingsController.getLatestSettings);

/**
 * @route GET /api/v1/finkeda-settings/history
 * @description Get finkeda calculator settings history
 * @access Public
 */
router.get('/history', FinkedaSettingsController.getSettingsHistory);

/**
 * @route PUT /api/v1/finkeda-settings
 * @description Update or create finkeda calculator settings
 * @access Public
 * @body { rupay_card_charge_amount: number, master_card_charge_amount: number }
 */
router.put('/', FinkedaSettingsController.updateSettings);

export default router;
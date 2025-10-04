import express from 'express';
import { BankController } from '../controllers/bankController';

const router = express.Router();

/**
 * @route GET /api/v1/banks
 * @description Get all banks with transaction count (Legacy - without pagination)
 * @access Public
 */
router.get('/', BankController.getAllBanks);

/**
 * @route GET /api/v1/banks/paginated
 * @description Get paginated banks with search and sort
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', BankController.getPaginatedBanks);

/**
 * @route GET /api/v1/banks/autocomplete
 * @description Get banks for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', BankController.getBanksAutocomplete);

/**
 * @route POST /api/v1/banks
 * @description Create a new bank
 * @access Public
 * @body { name: string }
 */
router.post('/', BankController.createBank);

/**
 * @route PUT /api/v1/banks
 * @description Update an existing bank
 * @access Public
 * @body { id: number, name: string }
 */
router.put('/', BankController.updateBank);

/**
 * @route DELETE /api/v1/banks
 * @description Delete a bank
 * @access Public
 * @body { id: number }
 */
router.delete('/', BankController.deleteBank);

export default router;
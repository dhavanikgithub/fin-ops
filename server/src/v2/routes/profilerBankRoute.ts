import express from 'express';
import { ProfilerBankController } from '../controllers/profilerBankController.js';

const router = express.Router();

/**
 * @route GET /api/v2/profiler/banks
 * @description Get all profiler banks (Legacy - without pagination)
 * @access Public
 */
router.get('/', ProfilerBankController.getAllBanks);

/**
 * @route GET /api/v2/profiler/banks/paginated
 * @description Get paginated profiler banks with search and filters
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   has_profiles?: boolean,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', ProfilerBankController.getPaginatedBanks);

/**
 * @route GET /api/v2/profiler/banks/autocomplete
 * @description Get profiler banks for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', ProfilerBankController.getBanksAutocomplete);

/**
 * @route GET /api/v2/profiler/banks/:id
 * @description Get profiler bank by ID
 * @access Public
 */
router.get('/:id', ProfilerBankController.getBankById);

/**
 * @route POST /api/v2/profiler/banks
 * @description Create a new profiler bank
 * @access Public
 * @body { bank_name: string }
 */
router.post('/', ProfilerBankController.createBank);

/**
 * @route PUT /api/v2/profiler/banks
 * @description Update an existing profiler bank
 * @access Public
 * @body { id: number, bank_name: string }
 */
router.put('/', ProfilerBankController.updateBank);

/**
 * @route DELETE /api/v2/profiler/banks
 * @description Delete a profiler bank (only if no profiles exist)
 * @access Public
 * @body { id: number }
 */
router.delete('/', ProfilerBankController.deleteBank);

export default router;

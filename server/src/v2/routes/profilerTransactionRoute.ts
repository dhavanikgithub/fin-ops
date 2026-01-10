import express from 'express';
import { ProfilerTransactionController } from '../controllers/profilerTransactionController.js';

const router = express.Router();

/**
 * @route GET /api/v2/profiler/transactions
 * @description Get all profiler transactions (Legacy - without pagination)
 * @access Public
 */
router.get('/', ProfilerTransactionController.getAllTransactions);

/**
 * @route GET /api/v2/profiler/transactions/paginated
 * @description Get paginated profiler transactions with search and filters
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   profile_id?: number | number[],
 *   client_id?: number | number[],
 *   bank_id?: number | number[],
 *   transaction_type?: 'deposit' | 'withdraw' | array,
 *   amount_greater_than?: number,
 *   amount_less_than?: number,
 *   date_from?: Date,
 *   date_to?: Date,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', ProfilerTransactionController.getPaginatedTransactions);

/**
 * @route GET /api/v2/profiler/transactions/profile/:profileId
 * @description Get all transactions for a specific profile
 * @access Public
 */
router.get('/profile/:profileId', ProfilerTransactionController.getTransactionsByProfile);

/**
 * @route GET /api/v2/profiler/transactions/profile/:profileId/summary
 * @description Get transaction summary for a profile
 * @access Public
 */
router.get('/profile/:profileId/summary', ProfilerTransactionController.getProfileTransactionSummary);

/**
 * @route GET /api/v2/profiler/transactions/:id
 * @description Get profiler transaction by ID
 * @access Public
 */
router.get('/:id', ProfilerTransactionController.getTransactionById);

/**
 * @route POST /api/v2/profiler/transactions/deposit
 * @description Create a new deposit transaction
 * @access Public
 * @body {
 *   profile_id: number,
 *   amount: number,
 *   notes?: string
 * }
 */
router.post('/deposit', ProfilerTransactionController.createDepositTransaction);

/**
 * @route POST /api/v2/profiler/transactions/withdraw
 * @description Create a new withdraw transaction
 * @access Public
 * @body {
 *   profile_id: number,
 *   amount: number,
 *   withdraw_charges_percentage?: number,
 *   notes?: string
 * }
 */
router.post('/withdraw', ProfilerTransactionController.createWithdrawTransaction);

/**
 * @route DELETE /api/v2/profiler/transactions
 * @description Delete a profiler transaction
 * @access Public
 * @body { id: number }
 */
router.delete('/', ProfilerTransactionController.deleteTransaction);

export default router;

import express from 'express';
import { TransactionController } from '../controllers/transactionController.js';

const router = express.Router();

/**
 * @route GET /api/v1/transactions
 * @description Get all transactions with client, bank, and card details (Legacy - without pagination)
 * @access Public
 */
router.get('/', TransactionController.getAllTransactions);

/**
 * @route GET /api/v1/transactions/paginated
 * @description Get paginated transactions with filters, search, and sort
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   transaction_type?: number,
 *   min_amount?: number,
 *   max_amount?: number,
 *   start_date?: string (YYYY-MM-DD),
 *   end_date?: string (YYYY-MM-DD),
 *   bank_ids?: number[],
 *   card_ids?: number[],
 *   client_ids?: number[],
 *   search?: string,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', TransactionController.getPaginatedTransactions);



/**
 * @route GET /api/v1/transactions/:id
 * @description Get transaction by ID with details
 * @access Public
 */
router.get('/:id', TransactionController.getTransactionById);


/**
 * @route POST /api/v1/transactions
 * @description Create a new transaction
 * @access Public
 * @body { client_id: number, transaction_type: number, widthdraw_charges: number, transaction_amount: number, bank_id?: number, card_id?: number, remark?: string }
 */
router.post('/', TransactionController.createTransaction);

/**
 * @route POST /api/v1/transactions/report
 * @description Generate transaction report (PDF)
 * @access Public
 * @body {
 *   startDate: string (YYYY-MM-DD),
 *   endDate: string (YYYY-MM-DD),
 *   clientId?: string | null
 * }
 */
router.post('/report', TransactionController.generateReport);

/**
 * @route PUT /api/v1/transactions
 * @description Update an existing transaction
 * @access Public
 * @body { id: number, client_id?: number, transaction_type?: number, widthdraw_charges?: number, transaction_amount?: number, bank_id?: number, card_id?: number, remark?: string }
 */
router.put('/', TransactionController.updateTransaction);

/**
 * @route DELETE /api/v1/transactions
 * @description Delete a transaction
 * @access Public
 * @body { id: number }
 */
router.delete('/', TransactionController.deleteTransaction);

export default router;
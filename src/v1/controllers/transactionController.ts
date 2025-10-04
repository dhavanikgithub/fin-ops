import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { TransactionInput, TransactionUpdateInput, DeleteTransactionInput, GetTransactionsInput, ReportPreviewInput } from '../types/transaction';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat';
import { ValidationError, asyncHandler } from '../../common/errors/index';

/**
 * Controller for transaction operations
 */
export class TransactionController {
    /**
     * GET all transactions with client, bank, and card details (Legacy - without pagination)
     */
    static getAllTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const transactions = await TransactionService.getAllTransactions();
        const response = createSuccessResponse(
            transactions,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            RESPONSE_MESSAGES.TRANSACTION_RETRIEVED
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated transactions with filters, search, and sort
     */
    static getPaginatedTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            transaction_type,
            min_amount,
            max_amount,
            start_date,
            end_date,
            bank_ids,
            card_ids,
            client_ids,
            search,
            sort_by,
            sort_order
        } = req.query;

        // Parse and validate query parameters
        const params: GetTransactionsInput = {};

        // Pagination parameters
        if (page !== undefined) {
            const parsedPage = parseInt(page as string);
            if (isNaN(parsedPage) || parsedPage < 1) {
                throw new ValidationError('Page must be a positive integer', {
                    field: 'page',
                    value: page,
                    expected: 'positive integer'
                });
            }
            params.page = parsedPage;
        }

        if (limit !== undefined) {
            const parsedLimit = parseInt(limit as string);
            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
                throw new ValidationError('Limit must be between 1 and 100', {
                    field: 'limit',
                    value: limit,
                    expected: 'integer between 1 and 100'
                });
            }
            params.limit = parsedLimit;
        }

        // Filter parameters
        if (transaction_type !== undefined) {
            const parsedType = parseInt(transaction_type as string);
            if (isNaN(parsedType) || (parsedType !== 1 && parsedType !== 0)) {
                throw new ValidationError('Transaction type must be 1 (Deposit) or 0 (Withdraw)', {
                    field: 'transaction_type',
                    value: transaction_type,
                    expected: '1 or 0'
                });
            }
            params.transaction_type = parsedType;
        }

        if (min_amount !== undefined) {
            const parsedAmount = parseFloat(min_amount as string);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                throw new ValidationError('Minimum amount must be a non-negative number', {
                    field: 'min_amount',
                    value: min_amount,
                    expected: 'non-negative number'
                });
            }
            params.min_amount = parsedAmount;
        }

        if (max_amount !== undefined) {
            const parsedAmount = parseFloat(max_amount as string);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                throw new ValidationError('Maximum amount must be a non-negative number', {
                    field: 'max_amount',
                    value: max_amount,
                    expected: 'non-negative number'
                });
            }
            params.max_amount = parsedAmount;
        }

        // Validate amount range
        if (params.min_amount !== undefined && params.max_amount !== undefined && params.min_amount > params.max_amount) {
            throw new ValidationError('Minimum amount cannot be greater than maximum amount', {
                field: 'amount_range',
                value: `min: ${params.min_amount}, max: ${params.max_amount}`
            });
        }

        // Date filters
        if (start_date !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_date as string)) {
                throw new ValidationError('Start date must be in YYYY-MM-DD format', {
                    field: 'start_date',
                    value: start_date,
                    expected: 'YYYY-MM-DD format'
                });
            }
            params.start_date = start_date as string;
        }

        if (end_date !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(end_date as string)) {
                throw new ValidationError('End date must be in YYYY-MM-DD format', {
                    field: 'end_date',
                    value: end_date,
                    expected: 'YYYY-MM-DD format'
                });
            }
            params.end_date = end_date as string;
        }

        // ID array filters
        if (bank_ids !== undefined) {
            try {
                const ids = Array.isArray(bank_ids) ? bank_ids : [bank_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid bank ID');
                    return parsed;
                });
                params.bank_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Bank IDs must be valid integers', {
                    field: 'bank_ids',
                    value: bank_ids,
                    expected: 'array of integers'
                });
            }
        }

        if (card_ids !== undefined) {
            try {
                const ids = Array.isArray(card_ids) ? card_ids : [card_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid card ID');
                    return parsed;
                });
                params.card_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Card IDs must be valid integers', {
                    field: 'card_ids',
                    value: card_ids,
                    expected: 'array of integers'
                });
            }
        }

        if (client_ids !== undefined) {
            try {
                const ids = Array.isArray(client_ids) ? client_ids : [client_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid client ID');
                    return parsed;
                });
                params.client_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Client IDs must be valid integers', {
                    field: 'client_ids',
                    value: client_ids,
                    expected: 'array of integers'
                });
            }
        }

        // Search parameter
        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        // Sort parameters
        if (sort_by !== undefined) {
            const validSortFields = ['create_date', 'transaction_amount', 'client_name', 'bank_name', 'card_name'];
            if (!validSortFields.includes(sort_by as string)) {
                throw new ValidationError(`Sort by must be one of: ${validSortFields.join(', ')}`, {
                    field: 'sort_by',
                    value: sort_by,
                    expected: validSortFields.join(', ')
                });
            }
            params.sort_by = sort_by as any;
        }

        if (sort_order !== undefined) {
            const validSortOrders = ['asc', 'desc'];
            if (!validSortOrders.includes(sort_order as string)) {
                throw new ValidationError('Sort order must be asc or desc', {
                    field: 'sort_order',
                    value: sort_order,
                    expected: 'asc or desc'
                });
            }
            params.sort_order = sort_order as any;
        }

        const result = await TransactionService.getPaginatedTransactions(params);
        const response = createSuccessResponse(
            result,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            'Paginated transactions retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET transaction by ID
     */
    static getTransactionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id || '');

        if (isNaN(id)) {
            throw new ValidationError('Invalid transaction ID', {
                field: 'id',
                value: req.params.id,
                expected: 'number'
            });
        }

        const transaction = await TransactionService.getTransactionById(id);

        if (!transaction) {
            throw new ValidationError('Transaction not found', {
                field: 'id',
                value: id
            });
        }

        const response = createSuccessResponse(
            transaction,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            'Transaction retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create a new transaction
     */
    static createTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: TransactionInput = req.body;

        // Validate required fields
        if (!data.client_id || typeof data.client_id !== 'number') {
            throw new ValidationError('Client ID is required and must be a number', {
                field: 'client_id',
                value: data.client_id,
                expected: 'number'
            });
        }

        if (data.transaction_amount === undefined || typeof data.transaction_amount !== 'number') {
            throw new ValidationError('Transaction amount is required and must be a number', {
                field: 'transaction_amount',
                value: data.transaction_amount,
                expected: 'number'
            });
        }

        if (data.transaction_type === undefined || typeof data.transaction_type !== 'number') {
            throw new ValidationError('Transaction type is required and must be a number', {
                field: 'transaction_type',
                value: data.transaction_type,
                expected: 'number'
            });
        }

        if (data.widthdraw_charges === undefined || typeof data.widthdraw_charges !== 'number') {
            throw new ValidationError('Withdraw charges is required and must be a number', {
                field: 'widthdraw_charges',
                value: data.widthdraw_charges,
                expected: 'number'
            });
        }

        // Validate business rules
        if (data.widthdraw_charges < 0 || data.widthdraw_charges > 100) {
            throw new ValidationError('Withdraw charges must be between 0 and 100', {
                field: 'widthdraw_charges',
                value: data.widthdraw_charges,
                expected: 'number between 0 and 100'
            });
        }

        if (data.transaction_amount <= 0) {
            throw new ValidationError('Transaction amount must be greater than 0', {
                field: 'transaction_amount',
                value: data.transaction_amount,
                expected: 'positive number'
            });
        }

        // Validate optional fields
        if (data.bank_id !== undefined && (typeof data.bank_id !== 'number' || isNaN(data.bank_id))) {
            throw new ValidationError('Bank ID must be a valid number', {
                field: 'bank_id',
                value: data.bank_id,
                expected: 'number'
            });
        }

        if (data.card_id !== undefined && (typeof data.card_id !== 'number' || isNaN(data.card_id))) {
            throw new ValidationError('Card ID must be a valid number', {
                field: 'card_id',
                value: data.card_id,
                expected: 'number'
            });
        }

        const transaction = await TransactionService.createTransaction({
            client_id: data.client_id,
            transaction_type: data.transaction_type,
            widthdraw_charges: data.widthdraw_charges,
            transaction_amount: data.transaction_amount,
            bank_id: data.bank_id || null,
            card_id: data.card_id || null,
            remark: data.remark || ''
        });

        const response = createSuccessResponse(
            transaction,
            201,
            SUCCESS_CODES.TRANSACTION_CREATED,
            RESPONSE_MESSAGES.TRANSACTION_CREATED
        );
        res.status(201).json(response);
    });

    /**
     * PUT update an existing transaction
     */
    static updateTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: TransactionUpdateInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        // Validate optional fields when provided
        if (data.client_id !== undefined && (typeof data.client_id !== 'number' || isNaN(data.client_id))) {
            throw new ValidationError('Client ID must be a valid number', {
                field: 'client_id',
                value: data.client_id,
                expected: 'number'
            });
        }

        if (data.transaction_type !== undefined && (typeof data.transaction_type !== 'number' || isNaN(data.transaction_type))) {
            throw new ValidationError('Transaction type must be a valid number', {
                field: 'transaction_type',
                value: data.transaction_type,
                expected: 'number'
            });
        }

        if (data.widthdraw_charges !== undefined) {
            if (typeof data.widthdraw_charges !== 'number' || isNaN(data.widthdraw_charges)) {
                throw new ValidationError('Withdraw charges must be a valid number', {
                    field: 'widthdraw_charges',
                    value: data.widthdraw_charges,
                    expected: 'number'
                });
            }
            if (data.widthdraw_charges < 0 || data.widthdraw_charges > 100) {
                throw new ValidationError('Withdraw charges must be between 0 and 100', {
                    field: 'widthdraw_charges',
                    value: data.widthdraw_charges,
                    expected: 'number between 0 and 100'
                });
            }
        }

        if (data.transaction_amount !== undefined) {
            if (typeof data.transaction_amount !== 'number' || isNaN(data.transaction_amount)) {
                throw new ValidationError('Transaction amount must be a valid number', {
                    field: 'transaction_amount',
                    value: data.transaction_amount,
                    expected: 'number'
                });
            }
            if (data.transaction_amount <= 0) {
                throw new ValidationError('Transaction amount must be greater than 0', {
                    field: 'transaction_amount',
                    value: data.transaction_amount,
                    expected: 'positive number'
                });
            }
        }

        if (data.bank_id !== undefined && data.bank_id !== null && (typeof data.bank_id !== 'number' || isNaN(data.bank_id))) {
            throw new ValidationError('Bank ID must be a valid number', {
                field: 'bank_id',
                value: data.bank_id,
                expected: 'number'
            });
        }

        if (data.card_id !== undefined && data.card_id !== null && (typeof data.card_id !== 'number' || isNaN(data.card_id))) {
            throw new ValidationError('Card ID must be a valid number', {
                field: 'card_id',
                value: data.card_id,
                expected: 'number'
            });
        }

        // Check if at least one field to update is provided
        const hasUpdates = [
            'client_id', 'transaction_type', 'widthdraw_charges',
            'transaction_amount', 'bank_id', 'card_id', 'remark'
        ].some(field => data[field as keyof TransactionUpdateInput] !== undefined);

        if (!hasUpdates) {
            throw new ValidationError('No fields to update', {
                message: 'At least one field must be provided for update'
            });
        }

        const transaction = await TransactionService.updateTransaction(data);

        const response = createSuccessResponse(
            transaction,
            200,
            SUCCESS_CODES.TRANSACTION_UPDATED,
            RESPONSE_MESSAGES.TRANSACTION_UPDATED
        );
        res.status(200).json(response);
    });

    /**
     * DELETE a transaction
     */
    static deleteTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: DeleteTransactionInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        await TransactionService.deleteTransaction(data.id);

        const response = createSuccessResponse(
            { id: data.id },
            200,
            SUCCESS_CODES.TRANSACTION_DELETED,
            RESPONSE_MESSAGES.TRANSACTION_DELETED
        );
        res.status(200).json(response);
    });

    /**
     * Get report preview with estimated rows and file size
     */
    static getReportPreview = asyncHandler(async (req: Request, res: Response) => {
        const {
            transaction_type,
            min_amount,
            max_amount,
            start_date,
            end_date,
            bank_ids,
            card_ids,
            client_ids,
            search,
            format,
            fields
        } = req.query;

        // Parse and validate query parameters
        const input: ReportPreviewInput = {};

        // Parse transaction_type
        if (transaction_type !== undefined) {
            const parsedType = parseInt(transaction_type as string);
            if (isNaN(parsedType) || (parsedType !== 1 && parsedType !== 2)) {
                throw new ValidationError('Transaction type must be 1 (Deposit) or 2 (Withdraw)');
            }
            input.transaction_type = parsedType;
        }

        // Parse amounts
        if (min_amount !== undefined) {
            const parsedMin = parseFloat(min_amount as string);
            if (isNaN(parsedMin) || parsedMin < 0) {
                throw new ValidationError('Minimum amount must be a non-negative number');
            }
            input.min_amount = parsedMin;
        }

        if (max_amount !== undefined) {
            const parsedMax = parseFloat(max_amount as string);
            if (isNaN(parsedMax) || parsedMax < 0) {
                throw new ValidationError('Maximum amount must be a non-negative number');
            }
            input.max_amount = parsedMax;
        }

        // Validate amount range
        if (input.min_amount !== undefined && input.max_amount !== undefined && input.min_amount > input.max_amount) {
            throw new ValidationError('Minimum amount cannot be greater than maximum amount');
        }

        // Parse dates
        if (start_date) {
            if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(start_date as string)) {
                throw new ValidationError('Start date must be in YYYY-MM-DD format');
            }
            input.start_date = start_date as string;
        }

        if (end_date) {
            if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(end_date as string)) {
                throw new ValidationError('End date must be in YYYY-MM-DD format');
            }
            input.end_date = end_date as string;
        }

        // Parse ID arrays
        if (bank_ids) {
            try {
                const parsedBankIds = Array.isArray(bank_ids) 
                    ? bank_ids.map(id => parseInt(id as string))
                    : [parseInt(bank_ids as string)];
                
                if (parsedBankIds.some(id => isNaN(id) || id <= 0)) {
                    throw new ValidationError('Bank IDs must be positive integers');
                }
                input.bank_ids = parsedBankIds;
            } catch {
                throw new ValidationError('Invalid bank IDs format');
            }
        }

        if (card_ids) {
            try {
                const parsedCardIds = Array.isArray(card_ids)
                    ? card_ids.map(id => parseInt(id as string))
                    : [parseInt(card_ids as string)];
                
                if (parsedCardIds.some(id => isNaN(id) || id <= 0)) {
                    throw new ValidationError('Card IDs must be positive integers');
                }
                input.card_ids = parsedCardIds;
            } catch {
                throw new ValidationError('Invalid card IDs format');
            }
        }

        if (client_ids) {
            try {
                const parsedClientIds = Array.isArray(client_ids)
                    ? client_ids.map(id => parseInt(id as string))
                    : [parseInt(client_ids as string)];
                
                if (parsedClientIds.some(id => isNaN(id) || id <= 0)) {
                    throw new ValidationError('Client IDs must be positive integers');
                }
                input.client_ids = parsedClientIds;
            } catch {
                throw new ValidationError('Invalid client IDs format');
            }
        }

        // Parse search
        if (search && typeof search === 'string') {
            input.search = search.trim();
        }

        // Parse format
        if (format) {
            const validFormats = ['CSV', 'Excel', 'JSON', 'PDF'];
            if (!validFormats.includes(format as string)) {
                throw new ValidationError(`Format must be one of: ${validFormats.join(', ')}`);
            }
            input.format = format as 'CSV' | 'Excel' | 'JSON' | 'PDF';
        }

        // Parse fields
        if (fields) {
            try {
                const parsedFields = Array.isArray(fields) ? fields as string[] : [fields as string];
                const validFields = [
                    'client_name', 'bank_name', 'card_name', 'transaction_amount', 
                    'transaction_type', 'create_date', 'create_time', 'remark', 'widthdraw_charges'
                ];
                
                const invalidFields = parsedFields.filter(field => !validFields.includes(field));
                if (invalidFields.length > 0) {
                    throw new ValidationError(`Invalid fields: ${invalidFields.join(', ')}. Valid fields are: ${validFields.join(', ')}`);
                }
                input.fields = parsedFields;
            } catch {
                throw new ValidationError('Invalid fields format');
            }
        }

        const data = await TransactionService.getReportPreview(input);
        
        const response = createSuccessResponse(
            data,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Report preview generated successfully'
        );
        res.status(200).json(response);
    });
}
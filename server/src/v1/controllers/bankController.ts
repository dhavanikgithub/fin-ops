import { Request, Response, NextFunction } from 'express';
import { BankService } from '../services/bankService.js';
import { BankInput, BankUpdateInput, DeleteBankInput, GetBanksInput } from '../types/bank.js';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';

/**
 * Controller for bank operations
 */
export class BankController {
    /**
     * GET all banks with transaction count (Legacy - without pagination)
     */
    static getAllBanks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const banks = await BankService.getAllBanks();
        const response = createSuccessResponse(
            banks, 
            200, 
            SUCCESS_CODES.BANKS_RETRIEVED, 
            RESPONSE_MESSAGES.BANK_RETRIEVED
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated banks with search and sort
     */
    static getPaginatedBanks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            sort_by,
            sort_order
        } = req.query;

        // Parse and validate query parameters
        const params: GetBanksInput = {};

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

        // Search parameter
        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        // Sort parameters
        if (sort_by !== undefined) {
            const validSortFields = ['name', 'create_date', 'transaction_count'];
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

        const result = await BankService.getPaginatedBanks(params);
        const response = createSuccessResponse(
            result,
            200,
            SUCCESS_CODES.BANKS_RETRIEVED,
            'Paginated banks retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create a new bank
     */
    static createBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: BankInput = req.body;

        // Validation
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: data.name,
                expected: 'non-empty string'
            });
        }

        const bank = await BankService.createBank({ name: data.name.trim() });
        const response = createSuccessResponse(
            bank, 
            201, 
            SUCCESS_CODES.BANK_CREATED, 
            RESPONSE_MESSAGES.BANK_CREATED
        );
        res.status(201).json(response);
    });

    /**
     * PUT update an existing bank
     */
    static updateBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: BankUpdateInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: data.name,
                expected: 'non-empty string'
            });
        }

        const bank = await BankService.updateBank({
            id: data.id,
            name: data.name.trim()
        });

        const response = createSuccessResponse(
            bank, 
            200, 
            SUCCESS_CODES.BANK_UPDATED, 
            RESPONSE_MESSAGES.BANK_UPDATED
        );
        res.status(200).json(response);
    });

    /**
     * DELETE a bank
     */
    static deleteBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: DeleteBankInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        await BankService.deleteBank(data.id);

        const response = createSuccessResponse(
            { id: data.id },
            200,
            SUCCESS_CODES.BANK_DELETED,
            RESPONSE_MESSAGES.BANK_DELETED
        );
        res.status(200).json(response);
    });

    /**
     * Get banks for autocomplete
     */
    static getBanksAutocomplete = asyncHandler(async (req: Request, res: Response) => {
        const { search, limit } = req.query;

        // Validate limit if provided
        let parsedLimit = 5; // default
        if (limit) {
            parsedLimit = parseInt(limit as string);
            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 10) {
                throw new ValidationError('Limit must be a number between 1 and 10');
            }
        }

        const input = {
            search: search as string || '',
            limit: parsedLimit
        };

        const data = await BankService.getBanksAutocomplete(input);
        
        const response = createSuccessResponse(
            data,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Banks autocomplete data retrieved successfully'
        );
        res.status(200).json(response);
    });
}
import { Request, Response } from 'express';
import { ProfilerTransactionService } from '../services/profilerTransactionService.js';
import * as path from 'path';
import * as fs from 'fs';
import {
    ProfilerDepositTransactionInput,
    ProfilerWithdrawTransactionInput,
    DeleteProfilerTransactionInput,
    GetProfilerTransactionsInput
} from '../types/profilerTransaction.js';
import { createSuccessResponse } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Controller for profiler transaction operations
 */
export class ProfilerTransactionController {
    /**
     * GET all profiler transactions
     */
    static getAllTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const transactions = await ProfilerTransactionService.getAllTransactions();
        const response = createSuccessResponse(
            transactions,
            200,
            'PROFILER_TRANSACTIONS_RETRIEVED',
            'Profiler transactions retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated profiler transactions
     */
    static getPaginatedTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            profile_id,
            client_id,
            bank_id,
            transaction_type,
            amount_greater_than,
            amount_less_than,
            date_from,
            date_to,
            sort_by,
            sort_order
        } = req.query;

        const params: GetProfilerTransactionsInput = {};

        if (page !== undefined) {
            const parsedPage = parseInt(page as string);
            if (isNaN(parsedPage) || parsedPage < 1) {
                throw new ValidationError('Page must be a positive integer', {
                    field: 'page',
                    value: page
                });
            }
            params.page = parsedPage;
        }

        if (limit !== undefined) {
            const parsedLimit = parseInt(limit as string);
            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
                throw new ValidationError('Limit must be between 1 and 100', {
                    field: 'limit',
                    value: limit
                });
            }
            params.limit = parsedLimit;
        }

        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        if (profile_id !== undefined) {
            const profileIdStr = profile_id as string;
            if (profileIdStr.includes(',')) {
                params.profile_id = profileIdStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
                const parsedId = parseInt(profileIdStr);
                if (!isNaN(parsedId)) {
                    params.profile_id = parsedId;
                }
            }
        }

        if (client_id !== undefined) {
            const clientIdStr = client_id as string;
            if (clientIdStr.includes(',')) {
                params.client_id = clientIdStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
                const parsedId = parseInt(clientIdStr);
                if (!isNaN(parsedId)) {
                    params.client_id = parsedId;
                }
            }
        }

        if (bank_id !== undefined) {
            const bankIdStr = bank_id as string;
            if (bankIdStr.includes(',')) {
                params.bank_id = bankIdStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
                const parsedId = parseInt(bankIdStr);
                if (!isNaN(parsedId)) {
                    params.bank_id = parsedId;
                }
            }
        }

        if (transaction_type !== undefined) {
            const typeStr = transaction_type as string;
            if (typeStr.includes(',')) {
                params.transaction_type = typeStr.split(',').map(t => t.trim()) as any;
            } else {
                params.transaction_type = typeStr as any;
            }
        }

        if (amount_greater_than !== undefined) {
            const parsed = parseFloat(amount_greater_than as string);
            if (!isNaN(parsed)) {
                params.amount_greater_than = parsed;
            }
        }

        if (amount_less_than !== undefined) {
            const parsed = parseFloat(amount_less_than as string);
            if (!isNaN(parsed)) {
                params.amount_less_than = parsed;
            }
        }

        if (date_from !== undefined) {
            params.date_from = new Date(date_from as string);
        }

        if (date_to !== undefined) {
            params.date_to = new Date(date_to as string);
        }

        if (sort_by !== undefined) {
            params.sort_by = sort_by as any;
        }

        if (sort_order !== undefined) {
            if (!['asc', 'desc'].includes(sort_order as string)) {
                throw new ValidationError('Sort order must be asc or desc', {
                    field: 'sort_order',
                    value: sort_order
                });
            }
            params.sort_order = sort_order as any;
        }

        const result = await ProfilerTransactionService.getPaginatedTransactions(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_TRANSACTIONS_RETRIEVED',
            'Paginated profiler transactions retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler transaction by ID
     */
    static getTransactionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id!);
        if (isNaN(id)) {
            throw new ValidationError('Invalid transaction ID', { field: 'id', value: req.params.id });
        }

        const transaction = await ProfilerTransactionService.getTransactionById(id);
        const response = createSuccessResponse(
            transaction,
            200,
            'PROFILER_TRANSACTION_RETRIEVED',
            'Profiler transaction retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET transactions by profile ID
     */
    static getTransactionsByProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const profileId = parseInt(req.params.profileId!);
        if (isNaN(profileId)) {
            throw new ValidationError('Invalid profile ID', { field: 'profileId', value: req.params.profileId });
        }

        const transactions = await ProfilerTransactionService.getTransactionsByProfile(profileId);
        const response = createSuccessResponse(
            transactions,
            200,
            'PROFILER_TRANSACTIONS_BY_PROFILE_RETRIEVED',
            'Profiler transactions by profile retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET transaction summary for a profile
     */
    static getProfileTransactionSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const profileId = parseInt(req.params.profileId!);
        if (isNaN(profileId)) {
            throw new ValidationError('Invalid profile ID', { field: 'profileId', value: req.params.profileId });
        }

        const summary = await ProfilerTransactionService.getProfileTransactionSummary(profileId);
        const response = createSuccessResponse(
            summary,
            200,
            'PROFILE_TRANSACTION_SUMMARY_RETRIEVED',
            'Profile transaction summary retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create deposit transaction
     */
    static createDepositTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { profile_id, amount, notes } = req.body;

        // Validation
        if (!profile_id || isNaN(parseInt(profile_id))) {
            throw new ValidationError('Valid profile ID is required', {
                field: 'profile_id',
                value: profile_id
            });
        }

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            throw new ValidationError('Amount must be a positive number', {
                field: 'amount',
                value: amount
            });
        }

        const transactionData: ProfilerDepositTransactionInput = {
            profile_id: parseInt(profile_id),
            amount: parseFloat(amount),
            notes: notes || null
        };

        const transaction = await ProfilerTransactionService.createDepositTransaction(transactionData);
        const response = createSuccessResponse(
            transaction,
            201,
            'DEPOSIT_TRANSACTION_CREATED',
            'Deposit transaction created successfully'
        );
        res.status(201).json(response);
    });

    /**
     * POST create withdraw transaction
     */
    static createWithdrawTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { profile_id, amount, withdraw_charges_percentage, notes } = req.body;

        // Validation
        if (!profile_id || isNaN(parseInt(profile_id))) {
            throw new ValidationError('Valid profile ID is required', {
                field: 'profile_id',
                value: profile_id
            });
        }

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            throw new ValidationError('Amount must be a positive number', {
                field: 'amount',
                value: amount
            });
        }

        if (withdraw_charges_percentage !== undefined && withdraw_charges_percentage !== null) {
            const charges = parseFloat(withdraw_charges_percentage);
            if (isNaN(charges) || charges < 0) {
                throw new ValidationError('Withdraw charges percentage must be a non-negative number', {
                    field: 'withdraw_charges_percentage',
                    value: withdraw_charges_percentage
                });
            }
        }

        const transactionData: ProfilerWithdrawTransactionInput = {
            profile_id: parseInt(profile_id),
            amount: parseFloat(amount),
            ...(withdraw_charges_percentage !== undefined && withdraw_charges_percentage !== null && { withdraw_charges_percentage: parseFloat(withdraw_charges_percentage) }),
            notes: notes || null
        };

        const transaction = await ProfilerTransactionService.createWithdrawTransaction(transactionData);
        const response = createSuccessResponse(
            transaction,
            201,
            'WITHDRAW_TRANSACTION_CREATED',
            'Withdraw transaction created successfully'
        );
        res.status(201).json(response);
    });

    /**
     * DELETE profiler transaction
     */
    static deleteTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid transaction ID is required', {
                field: 'id',
                value: id
            });
        }

        await ProfilerTransactionService.deleteTransaction(parseInt(id));
        const response = createSuccessResponse(
            null,
            200,
            'PROFILER_TRANSACTION_DELETED',
            'Profiler transaction deleted successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET export profile transactions as PDF
     */
    static exportProfileTransactionsPDF = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const profileId = parseInt(req.params.profileId!);
        if (isNaN(profileId)) {
            throw new ValidationError('Invalid profile ID', { field: 'profileId', value: req.params.profileId });
        }

        const pdfPath = await ProfilerTransactionService.exportProfileTransactionsPDF(profileId);
        
        // Send file for download
        res.download(pdfPath, path.basename(pdfPath), (err) => {
            if (err) {
                logger.error('Error sending PDF file:', err);
            }
            // Clean up the file after sending
            try {
                fs.unlinkSync(pdfPath);
            } catch (cleanupError) {
                logger.error('Error cleaning up PDF file:', cleanupError);
            }
        });
    });
}

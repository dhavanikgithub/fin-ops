import { Request, Response } from 'express';
import { ProfilerBankService } from '../services/profilerBankService.js';
import {
    ProfilerBankInput,
    ProfilerBankUpdateInput,
    DeleteProfilerBankInput,
    GetProfilerBanksInput
} from '../types/profilerBank.js';
import { createSuccessResponse } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';

/**
 * Controller for profiler bank operations
 */
export class ProfilerBankController {
    /**
     * GET all profiler banks
     */
    static getAllBanks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const banks = await ProfilerBankService.getAllBanks();
        const response = createSuccessResponse(
            banks,
            200,
            'PROFILER_BANKS_RETRIEVED',
            'Profiler banks retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated profiler banks
     */
    static getPaginatedBanks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            has_profiles,
            sort_by,
            sort_order
        } = req.query;

        const params: GetProfilerBanksInput = {};

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

        if (has_profiles !== undefined) {
            params.has_profiles = has_profiles === 'true';
        }

        if (sort_by !== undefined) {
            const validSortFields = ['bank_name', 'created_at', 'profile_count'];
            if (!validSortFields.includes(sort_by as string)) {
                throw new ValidationError(`Sort by must be one of: ${validSortFields.join(', ')}`, {
                    field: 'sort_by',
                    value: sort_by
                });
            }
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

        const result = await ProfilerBankService.getPaginatedBanks(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_BANKS_RETRIEVED',
            'Paginated profiler banks retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler bank by ID
     */
    static getBankById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id!);
        if (isNaN(id)) {
            throw new ValidationError('Invalid bank ID', { field: 'id', value: req.params.id });
        }

        const bank = await ProfilerBankService.getBankById(id);
        const response = createSuccessResponse(
            bank,
            200,
            'PROFILER_BANK_RETRIEVED',
            'Profiler bank retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler banks autocomplete
     */
    static getBanksAutocomplete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { search, limit } = req.query;

        const params: any = {};

        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        if (limit !== undefined) {
            const parsedLimit = parseInt(limit as string);
            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 10) {
                throw new ValidationError('Limit must be between 1 and 10', {
                    field: 'limit',
                    value: limit
                });
            }
            params.limit = parsedLimit;
        }

        const result = await ProfilerBankService.getBanksAutocomplete(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_BANKS_AUTOCOMPLETE_RETRIEVED',
            'Profiler banks autocomplete retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create profiler bank
     */
    static createBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { bank_name } = req.body;

        // Validation
        if (!bank_name || typeof bank_name !== 'string' || bank_name.trim().length === 0) {
            throw new ValidationError('Bank name is required and must be a non-empty string', {
                field: 'bank_name',
                value: bank_name
            });
        }

        const bankData: ProfilerBankInput = {
            bank_name: bank_name.trim()
        };

        const bank = await ProfilerBankService.createBank(bankData);
        const response = createSuccessResponse(
            bank,
            201,
            'PROFILER_BANK_CREATED',
            'Profiler bank created successfully'
        );
        res.status(201).json(response);
    });

    /**
     * PUT update profiler bank
     */
    static updateBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id, bank_name } = req.body;

        // Validation
        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid bank ID is required', {
                field: 'id',
                value: id
            });
        }

        if (!bank_name || typeof bank_name !== 'string' || bank_name.trim().length === 0) {
            throw new ValidationError('Bank name is required and must be a non-empty string', {
                field: 'bank_name',
                value: bank_name
            });
        }

        const bankData: ProfilerBankUpdateInput = {
            id: parseInt(id),
            bank_name: bank_name.trim()
        };

        const bank = await ProfilerBankService.updateBank(bankData);
        const response = createSuccessResponse(
            bank,
            200,
            'PROFILER_BANK_UPDATED',
            'Profiler bank updated successfully'
        );
        res.status(200).json(response);
    });

    /**
     * DELETE profiler bank
     */
    static deleteBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid bank ID is required', {
                field: 'id',
                value: id
            });
        }

        await ProfilerBankService.deleteBank(parseInt(id));
        const response = createSuccessResponse(
            null,
            200,
            'PROFILER_BANK_DELETED',
            'Profiler bank deleted successfully'
        );
        res.status(200).json(response);
    });
}

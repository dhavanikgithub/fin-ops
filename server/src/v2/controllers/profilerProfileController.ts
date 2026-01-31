import { Request, Response } from 'express';
import { ProfilerProfileService } from '../services/profilerProfileService.js';
import {
    ProfilerProfileInput,
    ProfilerProfileUpdateInput,
    MarkProfileAsDoneInput,
    DeleteProfilerProfileInput,
    GetProfilerProfilesInput,
    GetDashboardProfilesInput
} from '../types/profilerProfile.js';
import { createSuccessResponse } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';

/**
 * Controller for profiler profile operations
 */
export class ProfilerProfileController {
    /**
     * GET all profiler profiles
     */
    static getAllProfiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const profiles = await ProfilerProfileService.getAllProfiles();
        const response = createSuccessResponse(
            profiles,
            200,
            'PROFILER_PROFILES_RETRIEVED',
            'Profiler profiles retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated profiler profiles
     */
    static getPaginatedProfiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            client_id,
            bank_id,
            status,
            carry_forward_enabled,
            has_positive_balance,
            has_negative_balance,
            balance_greater_than,
            balance_less_than,
            created_at_start,
            created_at_end,
            pre_planned_deposit_amount,
            min_deposit_amount,
            max_deposit_amount,
            sort_by,
            sort_order
        } = req.query;

        const params: GetProfilerProfilesInput = {};

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

        if (status !== undefined) {
            const statusStr = status as string;
            if (statusStr.includes(',')) {
                params.status = statusStr.split(',').map(s => s.trim()) as any;
            } else {
                params.status = statusStr as any;
            }
        }

        if (carry_forward_enabled !== undefined) {
            params.carry_forward_enabled = carry_forward_enabled === 'true';
        }

        if (has_positive_balance !== undefined) {
            params.has_positive_balance = has_positive_balance === 'true';
        }

        if (has_negative_balance !== undefined) {
            params.has_negative_balance = has_negative_balance === 'true';
        }

        if (balance_greater_than !== undefined) {
            const parsed = parseFloat(balance_greater_than as string);
            if (!isNaN(parsed)) {
                params.balance_greater_than = parsed;
            }
        }

        if (balance_less_than !== undefined) {
            const parsed = parseFloat(balance_less_than as string);
            if (!isNaN(parsed)) {
                params.balance_less_than = parsed;
            }
        }

        if (created_at_start !== undefined) {
            params.created_at_start = (created_at_start as string).trim();
        }

        if (created_at_end !== undefined) {
            params.created_at_end = (created_at_end as string).trim();
        }

        if (pre_planned_deposit_amount !== undefined) {
            const parsed = parseFloat(pre_planned_deposit_amount as string);
            if (!isNaN(parsed)) {
                params.pre_planned_deposit_amount = parsed;
            }
        }

        if (min_deposit_amount !== undefined) {
            const parsed = parseFloat(min_deposit_amount as string);
            if (!isNaN(parsed)) {
                params.min_deposit_amount = parsed;
            }
        }

        if (max_deposit_amount !== undefined) {
            const parsed = parseFloat(max_deposit_amount as string);
            if (!isNaN(parsed)) {
                params.max_deposit_amount = parsed;
            }
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

        const result = await ProfilerProfileService.getPaginatedProfiles(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_PROFILES_RETRIEVED',
            'Paginated profiler profiles retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET dashboard profiles (active with positive balance)
     */
    static getDashboardProfiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { page, limit, client_id, bank_id } = req.query;

        const params: GetDashboardProfilesInput = {};

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

        if (client_id !== undefined) {
            const parsedId = parseInt(client_id as string);
            if (!isNaN(parsedId)) {
                params.client_id = parsedId;
            }
        }

        if (bank_id !== undefined) {
            const parsedId = parseInt(bank_id as string);
            if (!isNaN(parsedId)) {
                params.bank_id = parsedId;
            }
        }

        const result = await ProfilerProfileService.getDashboardProfiles(params);
        const response = createSuccessResponse(
            result,
            200,
            'DASHBOARD_PROFILES_RETRIEVED',
            'Dashboard profiles retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler profile by ID
     */
    static getProfileById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id!);
        if (isNaN(id)) {
            throw new ValidationError('Invalid profile ID', { field: 'id', value: req.params.id });
        }

        const profile = await ProfilerProfileService.getProfileById(id);
        const response = createSuccessResponse(
            profile,
            200,
            'PROFILER_PROFILE_RETRIEVED',
            'Profiler profile retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiles by client ID
     */
    static getProfilesByClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const clientId = parseInt(req.params.clientId!);
        if (isNaN(clientId)) {
            throw new ValidationError('Invalid client ID', { field: 'clientId', value: req.params.clientId });
        }

        const profiles = await ProfilerProfileService.getProfilesByClient(clientId);
        const response = createSuccessResponse(
            profiles,
            200,
            'PROFILER_PROFILES_BY_CLIENT_RETRIEVED',
            'Profiler profiles by client retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler profiles autocomplete
     */
    static getProfilesAutocomplete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { search, client_id, status, limit } = req.query;

        const params: any = {};

        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        if (client_id !== undefined) {
            const parsedId = parseInt(client_id as string);
            if (!isNaN(parsedId)) {
                params.client_id = parsedId;
            }
        }

        if (status !== undefined) {
            params.status = status as any;
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

        const result = await ProfilerProfileService.getProfilesAutocomplete(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_PROFILES_AUTOCOMPLETE_RETRIEVED',
            'Profiler profiles autocomplete retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create profiler profile
     */
    static createProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            client_id,
            bank_id,
            credit_card_number,
            pre_planned_deposit_amount,
            carry_forward_enabled,
            notes
        } = req.body;

        // Validation
        if (!client_id || isNaN(parseInt(client_id))) {
            throw new ValidationError('Valid client ID is required', {
                field: 'client_id',
                value: client_id
            });
        }

        if (!bank_id || isNaN(parseInt(bank_id))) {
            throw new ValidationError('Valid bank ID is required', {
                field: 'bank_id',
                value: bank_id
            });
        }

        if (!credit_card_number || typeof credit_card_number !== 'string' || credit_card_number.trim().length === 0) {
            throw new ValidationError('Credit card number is required', {
                field: 'credit_card_number',
                value: credit_card_number
            });
        }

        if (!pre_planned_deposit_amount || isNaN(parseFloat(pre_planned_deposit_amount)) || parseFloat(pre_planned_deposit_amount) <= 0) {
            throw new ValidationError('Pre-planned deposit amount must be a positive number', {
                field: 'pre_planned_deposit_amount',
                value: pre_planned_deposit_amount
            });
        }

        const profileData: ProfilerProfileInput = {
            client_id: parseInt(client_id),
            bank_id: parseInt(bank_id),
            credit_card_number: credit_card_number.trim(),
            pre_planned_deposit_amount: parseFloat(pre_planned_deposit_amount),
            carry_forward_enabled: carry_forward_enabled === true,
            notes: notes || null
        };

        const profile = await ProfilerProfileService.createProfile(profileData);
        const response = createSuccessResponse(
            profile,
            201,
            'PROFILER_PROFILE_CREATED',
            'Profiler profile created successfully'
        );
        res.status(201).json(response);
    });

    /**
     * PUT update profiler profile
     */
    static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            id,
            bank_id,
            credit_card_number,
            pre_planned_deposit_amount,
            carry_forward_enabled,
            notes
        } = req.body;

        // Validation
        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid profile ID is required', {
                field: 'id',
                value: id
            });
        }

        const profileData: ProfilerProfileUpdateInput = {
            id: parseInt(id)
        };

        if (bank_id !== undefined) {
            if (isNaN(parseInt(bank_id))) {
                throw new ValidationError('Bank ID must be a valid number', {
                    field: 'bank_id',
                    value: bank_id
                });
            }
            profileData.bank_id = parseInt(bank_id);
        }

        if (credit_card_number !== undefined) {
            if (typeof credit_card_number !== 'string' || credit_card_number.trim().length === 0) {
                throw new ValidationError('Credit card number must be a non-empty string', {
                    field: 'credit_card_number',
                    value: credit_card_number
                });
            }
            profileData.credit_card_number = credit_card_number.trim();
        }

        if (pre_planned_deposit_amount !== undefined) {
            if (isNaN(parseFloat(pre_planned_deposit_amount)) || parseFloat(pre_planned_deposit_amount) <= 0) {
                throw new ValidationError('Pre-planned deposit amount must be a positive number', {
                    field: 'pre_planned_deposit_amount',
                    value: pre_planned_deposit_amount
                });
            }
            profileData.pre_planned_deposit_amount = parseFloat(pre_planned_deposit_amount);
        }

        if (carry_forward_enabled !== undefined) {
            profileData.carry_forward_enabled = carry_forward_enabled === true;
        }

        if (notes !== undefined) {
            profileData.notes = notes || null;
        }

        const profile = await ProfilerProfileService.updateProfile(profileData);
        const response = createSuccessResponse(
            profile,
            200,
            'PROFILER_PROFILE_UPDATED',
            'Profiler profile updated successfully'
        );
        res.status(200).json(response);
    });

    /**
     * PUT mark profile as done
     */
    static markProfileAsDone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid profile ID is required', {
                field: 'id',
                value: id
            });
        }

        const profile = await ProfilerProfileService.markProfileAsDone(parseInt(id));
        const response = createSuccessResponse(
            profile,
            200,
            'PROFILER_PROFILE_MARKED_DONE',
            'Profiler profile marked as done successfully'
        );
        res.status(200).json(response);
    });

    /**
     * DELETE profiler profile
     */
    static deleteProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid profile ID is required', {
                field: 'id',
                value: id
            });
        }

        await ProfilerProfileService.deleteProfile(parseInt(id));
        const response = createSuccessResponse(
            null,
            200,
            'PROFILER_PROFILE_DELETED',
            'Profiler profile deleted successfully'
        );
        res.status(200).json(response);
    });
}

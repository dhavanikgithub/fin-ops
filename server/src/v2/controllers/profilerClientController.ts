import { Request, Response } from 'express';
import { ProfilerClientService } from '../services/profilerClientService.js';
import {
    ProfilerClientInput,
    ProfilerClientUpdateInput,
    DeleteProfilerClientInput,
    GetProfilerClientsInput,
    isValidEmail,
    isValidMobileNumber,
    isValidAadhaarNumber
} from '../types/profilerClient.js';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';

/**
 * Controller for profiler client operations
 */
export class ProfilerClientController {
    /**
     * GET all profiler clients
     */
    static getAllClients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const clients = await ProfilerClientService.getAllClients();
        const response = createSuccessResponse(
            clients,
            200,
            'PROFILER_CLIENTS_RETRIEVED',
            'Profiler clients retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated profiler clients
     */
    static getPaginatedClients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            has_profiles,
            sort_by,
            sort_order
        } = req.query;

        const params: GetProfilerClientsInput = {};

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
            const validSortFields = ['name', 'email', 'mobile_number', 'created_at', 'profile_count'];
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

        const result = await ProfilerClientService.getPaginatedClients(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_CLIENTS_RETRIEVED',
            'Paginated profiler clients retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler client by ID
     */
    static getClientById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id!);
        if (isNaN(id)) {
            throw new ValidationError('Invalid client ID', { field: 'id', value: req.params.id });
        }

        const client = await ProfilerClientService.getClientById(id);
        const response = createSuccessResponse(
            client,
            200,
            'PROFILER_CLIENT_RETRIEVED',
            'Profiler client retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET profiler clients autocomplete
     */
    static getClientsAutocomplete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

        const result = await ProfilerClientService.getClientsAutocomplete(params);
        const response = createSuccessResponse(
            result,
            200,
            'PROFILER_CLIENTS_AUTOCOMPLETE_RETRIEVED',
            'Profiler clients autocomplete retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create profiler client
     */
    static createClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            name,
            email,
            mobile_number,
            aadhaar_card_number,
            aadhaar_card_image,
            notes
        } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: name
            });
        }

        if (email && !isValidEmail(email)) {
            throw new ValidationError('Invalid email format', {
                field: 'email',
                value: email
            });
        }

        if (mobile_number && !isValidMobileNumber(mobile_number)) {
            throw new ValidationError('Mobile number must be at least 10 digits', {
                field: 'mobile_number',
                value: mobile_number
            });
        }

        if (aadhaar_card_number && !isValidAadhaarNumber(aadhaar_card_number)) {
            throw new ValidationError('Aadhaar number must be exactly 12 digits', {
                field: 'aadhaar_card_number',
                value: aadhaar_card_number
            });
        }

        const clientData: ProfilerClientInput = {
            name: name.trim(),
            email: email || null,
            mobile_number: mobile_number || null,
            aadhaar_card_number: aadhaar_card_number || null,
            aadhaar_card_image: aadhaar_card_image || null,
            notes: notes || null
        };

        const client = await ProfilerClientService.createClient(clientData);
        const response = createSuccessResponse(
            client,
            201,
            'PROFILER_CLIENT_CREATED',
            'Profiler client created successfully'
        );
        res.status(201).json(response);
    });

    /**
     * PUT update profiler client
     */
    static updateClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            id,
            name,
            email,
            mobile_number,
            aadhaar_card_number,
            aadhaar_card_image,
            notes
        } = req.body;

        // Validation
        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid client ID is required', {
                field: 'id',
                value: id
            });
        }

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: name
            });
        }

        if (email && !isValidEmail(email)) {
            throw new ValidationError('Invalid email format', {
                field: 'email',
                value: email
            });
        }

        if (mobile_number && !isValidMobileNumber(mobile_number)) {
            throw new ValidationError('Mobile number must be at least 10 digits', {
                field: 'mobile_number',
                value: mobile_number
            });
        }

        if (aadhaar_card_number && !isValidAadhaarNumber(aadhaar_card_number)) {
            throw new ValidationError('Aadhaar number must be exactly 12 digits', {
                field: 'aadhaar_card_number',
                value: aadhaar_card_number
            });
        }

        const clientData: ProfilerClientUpdateInput = {
            id: parseInt(id),
            name: name.trim(),
            email: email || null,
            mobile_number: mobile_number || null,
            aadhaar_card_number: aadhaar_card_number || null,
            aadhaar_card_image: aadhaar_card_image || null,
            notes: notes || null
        };

        const client = await ProfilerClientService.updateClient(clientData);
        const response = createSuccessResponse(
            client,
            200,
            'PROFILER_CLIENT_UPDATED',
            'Profiler client updated successfully'
        );
        res.status(200).json(response);
    });

    /**
     * DELETE profiler client
     */
    static deleteClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.body;

        if (!id || isNaN(parseInt(id))) {
            throw new ValidationError('Valid client ID is required', {
                field: 'id',
                value: id
            });
        }

        await ProfilerClientService.deleteClient(parseInt(id));
        const response = createSuccessResponse(
            null,
            200,
            'PROFILER_CLIENT_DELETED',
            'Profiler client deleted successfully'
        );
        res.status(200).json(response);
    });
}

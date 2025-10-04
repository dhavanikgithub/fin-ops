import { Request, Response } from 'express';
import { ClientService } from '../services/clientService';
import { ClientInput, ClientUpdateInput, DeleteClientInput, GetClientsInput, isValidEmail, isValidContact } from '../types/client';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat';
import { ValidationError, asyncHandler } from '../../common/errors/index';

/**
 * Controller for client operations
 */
export class ClientController {
    /**
     * GET all clients with transaction count (Legacy - without pagination)
     */
    static getAllClients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const clients = await ClientService.getAllClients();
        const response = createSuccessResponse(
            clients,
            200,
            SUCCESS_CODES.CLIENTS_RETRIEVED,
            RESPONSE_MESSAGES.CLIENT_RETRIEVED
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated clients with search and sort
     */
    static getPaginatedClients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            sort_by,
            sort_order
        } = req.query;

        // Parse and validate query parameters
        const params: GetClientsInput = {};

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
            const validSortFields = ['name', 'email', 'contact', 'create_date', 'transaction_count'];
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

        const result = await ClientService.getPaginatedClients(params);
        const response = createSuccessResponse(
            result,
            200,
            SUCCESS_CODES.CLIENTS_RETRIEVED,
            'Paginated clients retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET client by ID
     */
    static getClientById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id || '');

        if (isNaN(id)) {
            throw new ValidationError('Invalid client ID', {
                field: 'id',
                value: req.params.id,
                expected: 'number'
            });
        }

        const client = await ClientService.getClientById(id);

        if (!client) {
            throw new ValidationError('Client not found', {
                field: 'id',
                value: id
            });
        }

        const response = createSuccessResponse(
            client,
            200,
            SUCCESS_CODES.CLIENTS_RETRIEVED,
            'Client retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create a new client
     */
    static createClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: ClientInput = req.body;

        // Validate required fields
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: data.name,
                expected: 'non-empty string'
            });
        }

        // Validate optional fields
        const errors: string[] = [];

        if (data.email && data.email !== '' && !isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.contact && data.contact !== '' && !isValidContact(data.contact)) {
            errors.push('Invalid contact number - must be a 10-digit Indian mobile number starting with 6-9');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '), {
                fields: {
                    email: data.email,
                    contact: data.contact
                },
                errors
            });
        }

        const client = await ClientService.createClient({
            name: data.name.trim(),
            email: data.email ?? null,
            contact: data.contact ?? null,
            address: data.address ?? null
        });

        const response = createSuccessResponse(
            client,
            201,
            SUCCESS_CODES.CLIENT_CREATED,
            RESPONSE_MESSAGES.CLIENT_CREATED
        );
        res.status(201).json(response);
    });

    /**
     * PUT update an existing client
     */
    static updateClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: ClientUpdateInput = req.body;

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

        // Validate optional fields
        const errors: string[] = [];

        if (data.email && data.email !== '' && !isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.contact && data.contact !== '' && !isValidContact(data.contact)) {
            errors.push('Invalid contact number - must be a 10-digit Indian mobile number starting with 6-9');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '), {
                fields: {
                    email: data.email,
                    contact: data.contact
                },
                errors
            });
        }

        const client = await ClientService.updateClient({
            id: data.id,
            name: data.name.trim(),
            email: data.email ?? null,
            contact: data.contact ?? null,
            address: data.address ?? null
        });

        const response = createSuccessResponse(
            client,
            200,
            SUCCESS_CODES.CLIENT_UPDATED,
            RESPONSE_MESSAGES.CLIENT_UPDATED
        );
        res.status(200).json(response);
    });

    /**
     * GET client by name (URL parameter)
     */
    static getClientByName = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const name = decodeURIComponent(req.params.name || '');
        
        if (!name || name.trim() === '') {
            throw new ValidationError('Client name is required', {
                field: 'name',
                value: name,
                expected: 'non-empty string'
            });
        }

        const client = await ClientService.getClientByName(name.trim());
        
        if (!client) {
            throw new ValidationError('Client not found', {
                field: 'name',
                value: name
            });
        }

        const response = createSuccessResponse(
            [client], // Return as array to match the Next.js API format
            200, 
            SUCCESS_CODES.CLIENTS_RETRIEVED, 
            'Client retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * DELETE a client
     */
    static deleteClient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: DeleteClientInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        await ClientService.deleteClient(data.id);

        const response = createSuccessResponse(
            { id: data.id },
            200,
            SUCCESS_CODES.CLIENT_DELETED,
            RESPONSE_MESSAGES.CLIENT_DELETED
        );
        res.status(200).json(response);
    });

    /**
     * Get clients for autocomplete
     */
    static getClientsAutocomplete = asyncHandler(async (req: Request, res: Response) => {
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

        const data = await ClientService.getClientsAutocomplete(input);
        
        const response = createSuccessResponse(
            data,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Clients autocomplete data retrieved successfully'
        );
        res.status(200).json(response);
    });
}
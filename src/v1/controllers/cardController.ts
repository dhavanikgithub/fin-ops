import { Request, Response } from 'express';
import { CardService } from '../services/cardService.js';
import { CardInput, CardUpdateInput, DeleteCardInput, GetCardsInput } from '../types/card.js';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat.js';
import { ValidationError, asyncHandler } from '../../common/errors/index.js';

/**
 * Controller for card operations
 */
export class CardController {
    /**
     * GET all cards with transaction count (Legacy - without pagination)
     */
    static getAllCards = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const cards = await CardService.getAllCards();
        const response = createSuccessResponse(
            cards, 
            200, 
            SUCCESS_CODES.CARDS_RETRIEVED, 
            RESPONSE_MESSAGES.CARD_RETRIEVED
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated cards with search and sort
     */
    static getPaginatedCards = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            search,
            sort_by,
            sort_order
        } = req.query;

        // Parse and validate query parameters
        const params: GetCardsInput = {};

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

        const result = await CardService.getPaginatedCards(params);
        const response = createSuccessResponse(
            result,
            200,
            SUCCESS_CODES.CARDS_RETRIEVED,
            'Paginated cards retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create a new card
     */
    static createCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: CardInput = req.body;

        // Validation
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string', {
                field: 'name',
                value: data.name,
                expected: 'non-empty string'
            });
        }

        const card = await CardService.createCard({ name: data.name.trim() });
        const response = createSuccessResponse(
            card, 
            201, 
            SUCCESS_CODES.CARD_CREATED, 
            RESPONSE_MESSAGES.CARD_CREATED
        );
        res.status(201).json(response);
    });

    /**
     * PUT update an existing card
     */
    static updateCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: CardUpdateInput = req.body;

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

        const card = await CardService.updateCard({
            id: data.id,
            name: data.name.trim()
        });

        const response = createSuccessResponse(
            card, 
            200, 
            SUCCESS_CODES.CARD_UPDATED, 
            RESPONSE_MESSAGES.CARD_UPDATED
        );
        res.status(200).json(response);
    });

    /**
     * DELETE a card
     */
    static deleteCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: DeleteCardInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        await CardService.deleteCard(data.id);

        const response = createSuccessResponse(
            { id: data.id },
            200,
            SUCCESS_CODES.CARD_DELETED,
            RESPONSE_MESSAGES.CARD_DELETED
        );
        res.status(200).json(response);
    });

    /**
     * Get cards for autocomplete
     */
    static getCardsAutocomplete = asyncHandler(async (req: Request, res: Response) => {
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

        const data = await CardService.getCardsAutocomplete(input);
        
        const response = createSuccessResponse(
            data,
            200,
            SUCCESS_CODES.DATA_RETRIEVED,
            'Cards autocomplete data retrieved successfully'
        );
        res.status(200).json(response);
    });
}
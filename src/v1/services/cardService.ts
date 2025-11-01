import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { CARD_QUERIES } from '../queries/cardQueries.js';
import { Card, CardInput, CardUpdateInput, GetCardsInput, PaginatedCardResponse, CardAutocompleteInput, CardAutocompleteResponse, CardAutocompleteItem } from '../types/card.js';
import { DatabaseError, NotFoundError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js'

/**
 * Database service for card operations
 */
export class CardService {
    /**
     * Get all cards with transaction count
     */
    static async getAllCards(): Promise<Card[]> {
        try {
            const result: QueryResult<Card> = await query(CARD_QUERIES.GET_ALL_CARDS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching cards:', error);
            throw new DatabaseError('Failed to fetch cards', error);
        }
    }

    /**
     * Get paginated cards with search and sort
     */
    static async getPaginatedCards(params: GetCardsInput): Promise<PaginatedCardResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                sort_by = 'name',
                sort_order = 'asc'
            } = params;

            // Validate page and limit
            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 records per page
            const offset = (validatedPage - 1) * validatedLimit;

            // Build WHERE conditions
            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            // Search functionality (case insensitive with priority for exact matches)
            if (search && search.trim()) {
                const searchTermExact = search.trim();
                const searchTermWildcard = `%${search.trim()}%`;
                
                // Priority search: exact match first, then wildcard match
                whereConditions.push(`(
                    c.name ILIKE $${paramIndex} OR 
                    c.name ILIKE $${paramIndex + 1}
                )`);
                queryParams.push(searchTermExact, searchTermWildcard);
                paramIndex += 2;
            }

            // Build WHERE clause
            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Build ORDER BY clause
            let orderByClause = '';
            
            // If search is applied, prioritize exact matches first
            if (search && search.trim()) {
                const searchTermExact = search.trim();
                const exactMatchPriority = `(
                    CASE WHEN c.name ILIKE '${searchTermExact}' THEN 0 ELSE 1 END
                )`;
                
                switch (sort_by) {
                    case 'name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(c.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY ${exactMatchPriority}, c.create_date ${sort_order.toUpperCase()}, c.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY ${exactMatchPriority}, COALESCE(tc.transaction_count, 0) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(c.name) ${sort_order.toUpperCase()}`;
                }
            } else {
                // Normal sorting without search priority
                switch (sort_by) {
                    case 'name':
                        orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY c.create_date ${sort_order.toUpperCase()}, c.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY COALESCE(tc.transaction_count, 0) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                }
            }

            // Count query
            const countQuery = `${CARD_QUERIES.COUNT_CARDS} ${whereClause}`;
            const countResult = await query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');

            // Data query with pagination
            const dataQuery = `
                ${CARD_QUERIES.GET_PAGINATED_CARDS}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            
            const dataParams = [...queryParams, validatedLimit, offset];
            const dataResult: QueryResult<Card> = await query(dataQuery, dataParams);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / validatedLimit);
            const hasNextPage = validatedPage < totalPages;
            const hasPreviousPage = validatedPage > 1;

            const response: PaginatedCardResponse = {
                data: dataResult.rows,
                pagination: {
                    current_page: validatedPage,
                    per_page: validatedLimit,
                    total_count: totalCount,
                    total_pages: totalPages,
                    has_next_page: hasNextPage,
                    has_previous_page: hasPreviousPage
                },
                sort_applied: {
                    sort_by,
                    sort_order
                }
            };

            if (search !== undefined) {
                response.search_applied = search;
            }

            return response;
        } catch (error) {
            logger.error('Error fetching paginated cards:', error);
            throw new DatabaseError('Failed to fetch paginated cards', error);
        }
    }

    /**
     * Create a new card
     */
    static async createCard(cardData: CardInput): Promise<Card> {
        try {
            const result: QueryResult<Card> = await query(
                CARD_QUERIES.CREATE_CARD,
                [cardData.name]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create card - no rows returned');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating card:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create card', error);
        }
    }

    /**
     * Update an existing card
     */
    static async updateCard(cardData: CardUpdateInput): Promise<Card> {
        try {
            const result: QueryResult<Card> = await query(
                CARD_QUERIES.UPDATE_CARD,
                [cardData.name, cardData.id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError('Card not found');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error updating card:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to update card', error);
        }
    }

    /**
     * Delete a card
     */
    static async deleteCard(id: number): Promise<boolean> {
        try {
            const result: QueryResult = await query(
                CARD_QUERIES.DELETE_CARD,
                [id]
            );

            const deleted = result.rowCount !== null && result.rowCount > 0;
            if (!deleted) {
                throw new NotFoundError('Card not found');
            }

            return deleted;
        } catch (error) {
            logger.error('Error deleting card:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to delete card', error);
        }
    }

    /**
     * Get cards for autocomplete
     */
    static async getCardsAutocomplete(input: CardAutocompleteInput): Promise<CardAutocompleteResponse> {
        try {
            logger.info('getCardsAutocomplete service started', { input });

            const { search, limit = 5 } = input;
            let queryStr = CARD_QUERIES.GET_CARDS_AUTOCOMPLETE;
            let queryParams: any[] = [];
            let paramIndex = 1;

            if (search && search.trim()) {
                const trimmedSearch = search.trim();
                
                queryStr += ` WHERE (
                    name ILIKE $${paramIndex} -- Exact match (case-insensitive)
                    OR name ILIKE $${paramIndex + 1} -- Starts with
                    OR name ILIKE $${paramIndex + 2} -- Contains
                )
                ORDER BY 
                    CASE 
                        WHEN LOWER(name) = LOWER($${paramIndex}) THEN 1 -- Exact match priority
                        WHEN LOWER(name) LIKE LOWER($${paramIndex + 1}) THEN 2 -- Starts with priority
                        ELSE 3 -- Contains priority
                    END,
                    name ASC`;
                
                queryParams.push(
                    trimmedSearch,
                    `${trimmedSearch}%`,
                    `%${trimmedSearch}%`
                );
                paramIndex += 3;
            } else {
                queryStr += ` ORDER BY name ASC`;
            }

            queryStr += ` LIMIT $${paramIndex}`;
            queryParams.push(limit);

            logger.debug('Executing autocomplete query', { 
                query: queryStr.replace(/\s+/g, ' ').trim(),
                params: queryParams
            });

            const result: QueryResult<CardAutocompleteItem> = await query(queryStr, queryParams);
            const cards = result.rows;

            const response: CardAutocompleteResponse = {
                data: cards,
                search_query: search || '',
                result_count: cards.length,
                limit_applied: limit
            };

            logger.debug('getCardsAutocomplete service completed', {
                returnedCount: cards.length,
                search,
                limit
            });

            return response;
        } catch (error) {
            logger.error('Error in getCardsAutocomplete service', { error });
            throw new DatabaseError('Failed to fetch cards for autocomplete', error);
        }
    }
}
import { QueryResult } from 'pg';
import { query } from '../../utils/db';
import { CLIENT_QUERIES } from '../queries/clientQueries';
import { Client, ClientInput, ClientUpdateInput, GetClientsInput, PaginatedClientResponse, ClientAutocompleteInput, ClientAutocompleteResponse, ClientAutocompleteItem } from '../types/client';
import { DatabaseError, NotFoundError } from '../../common/errors/index';
import { logger } from '../../utils/logger'

/**
 * Database service for client operations
 */
export class ClientService {
    /**
     * Get all clients with transaction count
     */
    static async getAllClients(): Promise<Client[]> {
        try {
            const result: QueryResult<Client> = await query(CLIENT_QUERIES.GET_ALL_CLIENTS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching clients:', error);
            throw new DatabaseError('Failed to fetch clients', error);
        }
    }

    /**
     * Get paginated clients with search and sort
     */
    static async getPaginatedClients(params: GetClientsInput): Promise<PaginatedClientResponse> {
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
                    (c.name ILIKE $${paramIndex} OR 
                     COALESCE(c.email, '') ILIKE $${paramIndex} OR 
                     COALESCE(c.contact, '') ILIKE $${paramIndex} OR 
                     COALESCE(c.address, '') ILIKE $${paramIndex}) OR
                    (c.name ILIKE $${paramIndex + 1} OR 
                     COALESCE(c.email, '') ILIKE $${paramIndex + 1} OR 
                     COALESCE(c.contact, '') ILIKE $${paramIndex + 1} OR 
                     COALESCE(c.address, '') ILIKE $${paramIndex + 1})
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
                    CASE WHEN (c.name ILIKE '${searchTermExact}' OR 
                              COALESCE(c.email, '') ILIKE '${searchTermExact}' OR 
                              COALESCE(c.contact, '') ILIKE '${searchTermExact}' OR 
                              COALESCE(c.address, '') ILIKE '${searchTermExact}') 
                         THEN 0 ELSE 1 END
                )`;
                
                switch (sort_by) {
                    case 'name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(c.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'email':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(COALESCE(c.email, '')) ${sort_order.toUpperCase()}`;
                        break;
                    case 'contact':
                        orderByClause = `ORDER BY ${exactMatchPriority}, COALESCE(c.contact, '') ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY ${exactMatchPriority}, c.create_date ${sort_order.toUpperCase()}, c.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY ${exactMatchPriority}, COALESCE(tr.transaction_count, 0) ${sort_order.toUpperCase()}`;
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
                    case 'email':
                        orderByClause = `ORDER BY LOWER(COALESCE(c.email, '')) ${sort_order.toUpperCase()}`;
                        break;
                    case 'contact':
                        orderByClause = `ORDER BY COALESCE(c.contact, '') ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY c.create_date ${sort_order.toUpperCase()}, c.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY COALESCE(tr.transaction_count, 0) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                }
            }

            // Count query
            const countQuery = `${CLIENT_QUERIES.COUNT_CLIENTS} ${whereClause}`;
            const countResult = await query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');

            // Data query with pagination
            const dataQuery = `
                ${CLIENT_QUERIES.GET_PAGINATED_CLIENTS}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            
            const dataParams = [...queryParams, validatedLimit, offset];
            const dataResult: QueryResult<Client> = await query(dataQuery, dataParams);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / validatedLimit);
            const hasNextPage = validatedPage < totalPages;
            const hasPreviousPage = validatedPage > 1;

            const response: PaginatedClientResponse = {
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
            logger.error('Error fetching paginated clients:', error);
            throw new DatabaseError('Failed to fetch paginated clients', error);
        }
    }

    /**
     * Get client by ID
     */
    static async getClientById(id: number): Promise<Client | null> {
        try {
            const result: QueryResult<Client> = await query(
                CLIENT_QUERIES.GET_CLIENT_BY_ID,
                [id]
            );
            return result.rows.length > 0 ? result.rows[0]! : null;
        } catch (error) {
            logger.error('Error fetching client by ID:', error);
            throw new DatabaseError('Failed to fetch client', error);
        }
    }

    /**
     * Get client by name
     */
    static async getClientByName(name: string): Promise<Client | null> {
        try {
            const result: QueryResult<Client> = await query(
                CLIENT_QUERIES.GET_CLIENT_BY_NAME,
                [name]
            );
            return result.rows.length > 0 ? result.rows[0]! : null;
        } catch (error) {
            logger.error('Error fetching client by name:', error);
            throw new DatabaseError('Failed to fetch client', error);
        }
    }

    /**
     * Create a new client
     */
    static async createClient(clientData: ClientInput): Promise<Client> {
        try {
            // Handle empty strings as null
            const email = clientData.email === '' ? null : clientData.email;
            const contact = clientData.contact === '' ? null : clientData.contact;
            const address = clientData.address === '' ? null : clientData.address;

            const result: QueryResult<Client> = await query(
                CLIENT_QUERIES.CREATE_CLIENT,
                [clientData.name, email, contact, address]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create client - no rows returned');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating client:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create client', error);
        }
    }

    /**
     * Update an existing client with selective field updates
     */
    static async updateClient(clientData: ClientUpdateInput): Promise<Client> {
        try {
            // Prepare parameters for selective update
            const params: any[] = [];

            // Name is required
            params.push(clientData.name);

            // Handle optional fields - use 'SKIP_FIELD' as a marker to skip updating the field
            params.push(clientData.email !== undefined ? (clientData.email === '' ? null : clientData.email) : 'SKIP_FIELD');
            params.push(clientData.contact !== undefined ? (clientData.contact === '' ? null : clientData.contact) : 'SKIP_FIELD');
            params.push(clientData.address !== undefined ? (clientData.address === '' ? null : clientData.address) : 'SKIP_FIELD');
            params.push(clientData.id);

            const result: QueryResult<Client> = await query(
                CLIENT_QUERIES.UPDATE_CLIENT_SELECTIVE,
                params
            );

            if (result.rows.length === 0) {
                throw new NotFoundError('Client not found');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error updating client:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to update client', error);
        }
    }

    /**
     * Delete a client
     */
    static async deleteClient(id: number): Promise<boolean> {
        try {
            const result: QueryResult = await query(
                CLIENT_QUERIES.DELETE_CLIENT,
                [id]
            );

            const deleted = result.rowCount !== null && result.rowCount > 0;
            if (!deleted) {
                throw new NotFoundError('Client not found');
            }

            return deleted;
        } catch (error) {
            logger.error('Error deleting client:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to delete client', error);
        }
    }

    /**
     * Get clients for autocomplete
     */
    static async getClientsAutocomplete(input: ClientAutocompleteInput): Promise<ClientAutocompleteResponse> {
        try {
            logger.info('getClientsAutocomplete service started', { input });

            const { search, limit = 5 } = input;
            let queryStr = CLIENT_QUERIES.GET_CLIENTS_AUTOCOMPLETE;
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

            const result: QueryResult<ClientAutocompleteItem> = await query(queryStr, queryParams);
            const clients = result.rows;

            const response: ClientAutocompleteResponse = {
                data: clients,
                search_query: search || '',
                result_count: clients.length,
                limit_applied: limit
            };

            logger.debug('getClientsAutocomplete service completed', {
                returnedCount: clients.length,
                search,
                limit
            });

            return response;
        } catch (error) {
            logger.error('Error in getClientsAutocomplete service', { error });
            throw new DatabaseError('Failed to fetch clients for autocomplete', error);
        }
    }
}
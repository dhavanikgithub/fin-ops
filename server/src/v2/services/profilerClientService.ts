import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { PROFILER_CLIENT_QUERIES } from '../queries/profilerClientQueries.js';
import {
    ProfilerClient,
    ProfilerClientInput,
    ProfilerClientUpdateInput,
    GetProfilerClientsInput,
    PaginatedProfilerClientResponse,
    ProfilerClientAutocompleteInput,
    ProfilerClientAutocompleteResponse,
    ProfilerClientAutocompleteItem
} from '../types/profilerClient.js';
import { DatabaseError, NotFoundError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Database service for profiler client operations
 */
export class ProfilerClientService {
    /**
     * Get all profiler clients with profile count
     */
    static async getAllClients(): Promise<ProfilerClient[]> {
        try {
            const result: QueryResult<ProfilerClient> = await query(PROFILER_CLIENT_QUERIES.GET_ALL_CLIENTS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching profiler clients:', error);
            throw new DatabaseError('Failed to fetch profiler clients', error);
        }
    }

    /**
     * Get paginated profiler clients with search and filters
     */
    static async getPaginatedClients(params: GetProfilerClientsInput): Promise<PaginatedProfilerClientResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                has_profiles,
                sort_by = 'name',
                sort_order = 'asc'
            } = params;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100);
            const offset = (validatedPage - 1) * validatedLimit;

            // Build WHERE conditions
            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            // Search functionality
            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                whereConditions.push(`(
                    c.name ILIKE $${paramIndex} OR 
                    COALESCE(c.email, '') ILIKE $${paramIndex} OR 
                    COALESCE(c.mobile_number, '') ILIKE $${paramIndex} OR 
                    COALESCE(c.aadhaar_card_number, '') ILIKE $${paramIndex} OR 
                    COALESCE(c.notes, '') ILIKE $${paramIndex}
                )`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            // Filter by has_profiles
            if (has_profiles !== undefined) {
                if (has_profiles) {
                    whereConditions.push(`COALESCE(p.profile_count, 0) > 0`);
                } else {
                    whereConditions.push(`COALESCE(p.profile_count, 0) = 0`);
                }
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Build ORDER BY clause
            let orderByClause = '';
            switch (sort_by) {
                case 'name':
                    orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                    break;
                case 'email':
                    orderByClause = `ORDER BY LOWER(COALESCE(c.email, '')) ${sort_order.toUpperCase()}`;
                    break;
                case 'mobile_number':
                    orderByClause = `ORDER BY COALESCE(c.mobile_number, '') ${sort_order.toUpperCase()}`;
                    break;
                case 'created_at':
                    orderByClause = `ORDER BY c.created_at ${sort_order.toUpperCase()}`;
                    break;
                case 'profile_count':
                    orderByClause = `ORDER BY COALESCE(p.profile_count, 0) ${sort_order.toUpperCase()}`;
                    break;
                default:
                    orderByClause = `ORDER BY LOWER(c.name) ASC`;
            }

            // Build complete query
            const dataQuery = `
                ${PROFILER_CLIENT_QUERIES.GET_ALL_CLIENTS.replace('ORDER BY c.name ASC', '')}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            queryParams.push(validatedLimit, offset);

            // Count query
            const countQuery = `
                ${PROFILER_CLIENT_QUERIES.COUNT_CLIENTS}
                LEFT JOIN (
                    SELECT 
                        client_id, 
                        COUNT(*) AS profile_count
                    FROM profiler_profiles
                    GROUP BY client_id
                ) p ON p.client_id = c.id
                ${whereClause}
            `;

            // Execute queries
            const [dataResult, countResult] = await Promise.all([
                query(dataQuery, queryParams),
                query(countQuery, queryParams.slice(0, -2))
            ]);

            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');
            const totalPages = Math.ceil(totalCount / validatedLimit);

            return {
                data: dataResult.rows,
                pagination: {
                    current_page: validatedPage,
                    per_page: validatedLimit,
                    total_count: totalCount,
                    total_pages: totalPages,
                    has_next_page: validatedPage < totalPages,
                    has_previous_page: validatedPage > 1
                },
                ...(search && { search_applied: search }),
                ...(has_profiles !== undefined && { filters_applied: { has_profiles } }),
                sort_applied: {
                    sort_by,
                    sort_order
                }
            };
        } catch (error) {
            logger.error('Error fetching paginated profiler clients:', error);
            throw new DatabaseError('Failed to fetch paginated profiler clients', error);
        }
    }

    /**
     * Get profiler client by ID
     */
    static async getClientById(id: number): Promise<ProfilerClient> {
        try {
            const result: QueryResult<ProfilerClient> = await query(
                PROFILER_CLIENT_QUERIES.GET_CLIENT_BY_ID,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler client with ID ${id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error fetching profiler client by ID:', error);
            throw new DatabaseError('Failed to fetch profiler client', error);
        }
    }

    /**
     * Create new profiler client
     */
    static async createClient(clientData: ProfilerClientInput): Promise<ProfilerClient> {
        try {
            const result: QueryResult<ProfilerClient> = await query(
                PROFILER_CLIENT_QUERIES.CREATE_CLIENT,
                [
                    clientData.name,
                    clientData.email || null,
                    clientData.mobile_number || null,
                    clientData.aadhaar_card_number || null,
                    clientData.aadhaar_card_image || null,
                    clientData.notes || null
                ]
            );

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating profiler client:', error);
            throw new DatabaseError('Failed to create profiler client', error);
        }
    }

    /**
     * Update profiler client
     */
    static async updateClient(clientData: ProfilerClientUpdateInput): Promise<ProfilerClient> {
        try {
            const result: QueryResult<ProfilerClient> = await query(
                PROFILER_CLIENT_QUERIES.UPDATE_CLIENT,
                [
                    clientData.id,
                    clientData.name,
                    clientData.email || null,
                    clientData.mobile_number || null,
                    clientData.aadhaar_card_number || null,
                    clientData.aadhaar_card_image || null,
                    clientData.notes || null
                ]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler client with ID ${clientData.id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error updating profiler client:', error);
            throw new DatabaseError('Failed to update profiler client', error);
        }
    }

    /**
     * Delete profiler client (only if no profiles exist)
     */
    static async deleteClient(id: number): Promise<void> {
        try {
            const result = await query(PROFILER_CLIENT_QUERIES.DELETE_CLIENT, [id]);

            if (result.rowCount === 0) {
                // Check if client exists
                const checkResult = await query(PROFILER_CLIENT_QUERIES.CHECK_CLIENT_EXISTS, [id]);
                if (checkResult.rows.length === 0) {
                    throw new NotFoundError(`Profiler client with ID ${id} not found`);
                } else {
                    throw new DatabaseError(
                        'Cannot delete profiler client with existing profiles',
                        { clientId: id }
                    );
                }
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
            logger.error('Error deleting profiler client:', error);
            throw new DatabaseError('Failed to delete profiler client', error);
        }
    }

    /**
     * Get profiler clients for autocomplete
     */
    static async getClientsAutocomplete(
        params: ProfilerClientAutocompleteInput
    ): Promise<ProfilerClientAutocompleteResponse> {
        try {
            const { search, limit = 5 } = params;
            const validatedLimit = Math.min(Math.max(1, limit), 10);

            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                whereConditions.push(`(
                    c.name ILIKE $${paramIndex} OR 
                    COALESCE(c.email, '') ILIKE $${paramIndex} OR 
                    COALESCE(c.mobile_number, '') ILIKE $${paramIndex}
                )`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const dataQuery = `
                ${PROFILER_CLIENT_QUERIES.GET_AUTOCOMPLETE_CLIENTS}
                ${whereClause}
                ORDER BY c.name ASC
                LIMIT $${paramIndex}
            `;
            queryParams.push(validatedLimit);

            const countQuery = `
                ${PROFILER_CLIENT_QUERIES.COUNT_AUTOCOMPLETE_CLIENTS}
                ${whereClause}
            `;

            const [dataResult, countResult] = await Promise.all([
                query(dataQuery, queryParams),
                query(countQuery, queryParams.slice(0, -1))
            ]);

            return {
                data: dataResult.rows,
                total_count: parseInt(countResult.rows[0]?.total_count || '0')
            };
        } catch (error) {
            logger.error('Error fetching profiler clients autocomplete:', error);
            throw new DatabaseError('Failed to fetch profiler clients for autocomplete', error);
        }
    }
}

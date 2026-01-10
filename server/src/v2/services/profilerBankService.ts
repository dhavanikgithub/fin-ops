import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { PROFILER_BANK_QUERIES } from '../queries/profilerBankQueries.js';
import {
    ProfilerBank,
    ProfilerBankInput,
    ProfilerBankUpdateInput,
    GetProfilerBanksInput,
    PaginatedProfilerBankResponse,
    ProfilerBankAutocompleteInput,
    ProfilerBankAutocompleteResponse
} from '../types/profilerBank.js';
import { DatabaseError, NotFoundError, ValidationError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Database service for profiler bank operations
 */
export class ProfilerBankService {
    /**
     * Get all profiler banks with profile count
     */
    static async getAllBanks(): Promise<ProfilerBank[]> {
        try {
            const result: QueryResult<ProfilerBank> = await query(PROFILER_BANK_QUERIES.GET_ALL_BANKS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching profiler banks:', error);
            throw new DatabaseError('Failed to fetch profiler banks', error);
        }
    }

    /**
     * Get paginated profiler banks with search and filters
     */
    static async getPaginatedBanks(params: GetProfilerBanksInput): Promise<PaginatedProfilerBankResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                has_profiles,
                sort_by = 'bank_name',
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
                whereConditions.push(`b.bank_name ILIKE $${paramIndex}`);
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
                case 'bank_name':
                    orderByClause = `ORDER BY LOWER(b.bank_name) ${sort_order.toUpperCase()}`;
                    break;
                case 'created_at':
                    orderByClause = `ORDER BY b.created_at ${sort_order.toUpperCase()}`;
                    break;
                case 'profile_count':
                    orderByClause = `ORDER BY COALESCE(p.profile_count, 0) ${sort_order.toUpperCase()}`;
                    break;
                default:
                    orderByClause = `ORDER BY LOWER(b.bank_name) ASC`;
            }

            // Build complete query
            const dataQuery = `
                ${PROFILER_BANK_QUERIES.GET_ALL_BANKS.replace('ORDER BY b.bank_name ASC', '')}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            queryParams.push(validatedLimit, offset);

            // Count query
            const countQuery = `
                ${PROFILER_BANK_QUERIES.COUNT_BANKS}
                LEFT JOIN (
                    SELECT 
                        bank_id, 
                        COUNT(*) AS profile_count
                    FROM profiler_profiles
                    GROUP BY bank_id
                ) p ON p.bank_id = b.id
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
            logger.error('Error fetching paginated profiler banks:', error);
            throw new DatabaseError('Failed to fetch paginated profiler banks', error);
        }
    }

    /**
     * Get profiler bank by ID
     */
    static async getBankById(id: number): Promise<ProfilerBank> {
        try {
            const result: QueryResult<ProfilerBank> = await query(
                PROFILER_BANK_QUERIES.GET_BANK_BY_ID,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler bank with ID ${id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error fetching profiler bank by ID:', error);
            throw new DatabaseError('Failed to fetch profiler bank', error);
        }
    }

    /**
     * Create new profiler bank
     */
    static async createBank(bankData: ProfilerBankInput): Promise<ProfilerBank> {
        try {
            // Check if bank name already exists
            const existsResult = await query(
                PROFILER_BANK_QUERIES.CHECK_BANK_NAME_EXISTS,
                [bankData.bank_name, 0]
            );

            if (existsResult.rows.length > 0) {
                throw new ValidationError('Bank name already exists', {
                    field: 'bank_name',
                    value: bankData.bank_name
                });
            }

            const result: QueryResult<ProfilerBank> = await query(
                PROFILER_BANK_QUERIES.CREATE_BANK,
                [bankData.bank_name]
            );

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof ValidationError) throw error;
            logger.error('Error creating profiler bank:', error);
            throw new DatabaseError('Failed to create profiler bank', error);
        }
    }

    /**
     * Update profiler bank
     */
    static async updateBank(bankData: ProfilerBankUpdateInput): Promise<ProfilerBank> {
        try {
            // Check if bank name already exists (excluding current bank)
            const existsResult = await query(
                PROFILER_BANK_QUERIES.CHECK_BANK_NAME_EXISTS,
                [bankData.bank_name, bankData.id]
            );

            if (existsResult.rows.length > 0) {
                throw new ValidationError('Bank name already exists', {
                    field: 'bank_name',
                    value: bankData.bank_name
                });
            }

            const result: QueryResult<ProfilerBank> = await query(
                PROFILER_BANK_QUERIES.UPDATE_BANK,
                [bankData.id, bankData.bank_name]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler bank with ID ${bankData.id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            logger.error('Error updating profiler bank:', error);
            throw new DatabaseError('Failed to update profiler bank', error);
        }
    }

    /**
     * Delete profiler bank (only if no profiles exist)
     */
    static async deleteBank(id: number): Promise<void> {
        try {
            const result = await query(PROFILER_BANK_QUERIES.DELETE_BANK, [id]);

            if (result.rowCount === 0) {
                // Check if bank exists
                const checkResult = await query(PROFILER_BANK_QUERIES.CHECK_BANK_EXISTS, [id]);
                if (checkResult.rows.length === 0) {
                    throw new NotFoundError(`Profiler bank with ID ${id} not found`);
                } else {
                    throw new DatabaseError(
                        'Cannot delete profiler bank with existing profiles',
                        { bankId: id }
                    );
                }
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
            logger.error('Error deleting profiler bank:', error);
            throw new DatabaseError('Failed to delete profiler bank', error);
        }
    }

    /**
     * Get profiler banks for autocomplete
     */
    static async getBanksAutocomplete(
        params: ProfilerBankAutocompleteInput
    ): Promise<ProfilerBankAutocompleteResponse> {
        try {
            const { search, limit = 5 } = params;
            const validatedLimit = Math.min(Math.max(1, limit), 10);

            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                whereConditions.push(`b.bank_name ILIKE $${paramIndex}`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const dataQuery = `
                ${PROFILER_BANK_QUERIES.GET_AUTOCOMPLETE_BANKS}
                ${whereClause}
                ORDER BY b.bank_name ASC
                LIMIT $${paramIndex}
            `;
            queryParams.push(validatedLimit);

            const countQuery = `
                ${PROFILER_BANK_QUERIES.COUNT_AUTOCOMPLETE_BANKS}
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
            logger.error('Error fetching profiler banks autocomplete:', error);
            throw new DatabaseError('Failed to fetch profiler banks for autocomplete', error);
        }
    }
}

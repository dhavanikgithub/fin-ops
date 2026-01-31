import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { PROFILER_PROFILE_QUERIES } from '../queries/profilerProfileQueries.js';
import {
    ProfilerProfile,
    ProfilerProfileInput,
    ProfilerProfileUpdateInput,
    GetProfilerProfilesInput,
    PaginatedProfilerProfileResponse,
    ProfilerProfileAutocompleteInput,
    ProfilerProfileAutocompleteResponse,
    GetDashboardProfilesInput,
    ProfilerProfileStatus
} from '../types/profilerProfile.js';
import { DatabaseError, NotFoundError, ValidationError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Database service for profiler profile operations
 */
export class ProfilerProfileService {
    /**
     * Get all profiler profiles
     */
    static async getAllProfiles(): Promise<ProfilerProfile[]> {
        try {
            const result: QueryResult<ProfilerProfile> = await query(
                `${PROFILER_PROFILE_QUERIES.GET_ALL_PROFILES} ORDER BY p.created_at DESC`
            );
            return result.rows;
        } catch (error) {
            logger.error('Error fetching profiler profiles:', error);
            throw new DatabaseError('Failed to fetch profiler profiles', error);
        }
    }

    /**
     * Get paginated profiler profiles with search and filters
     */
    static async getPaginatedProfiles(params: GetProfilerProfilesInput): Promise<PaginatedProfilerProfileResponse> {
        try {
            const {
                page = 1,
                limit = 50,
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
                sort_by = 'created_at',
                sort_order = 'desc'
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
                    b.bank_name ILIKE $${paramIndex} OR 
                    p.credit_card_number ILIKE $${paramIndex} OR 
                    COALESCE(p.notes, '') ILIKE $${paramIndex}
                )`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            // Filter by client_id
            if (client_id !== undefined) {
                if (Array.isArray(client_id)) {
                    whereConditions.push(`p.client_id = ANY($${paramIndex})`);
                    queryParams.push(client_id);
                } else {
                    whereConditions.push(`p.client_id = $${paramIndex}`);
                    queryParams.push(client_id);
                }
                paramIndex++;
            }

            // Filter by bank_id
            if (bank_id !== undefined) {
                if (Array.isArray(bank_id)) {
                    whereConditions.push(`p.bank_id = ANY($${paramIndex})`);
                    queryParams.push(bank_id);
                } else {
                    whereConditions.push(`p.bank_id = $${paramIndex}`);
                    queryParams.push(bank_id);
                }
                paramIndex++;
            }

            // Filter by status
            if (status !== undefined) {
                if (Array.isArray(status)) {
                    whereConditions.push(`p.status = ANY($${paramIndex}::profiler_profile_status[])`);
                    queryParams.push(status);
                } else {
                    whereConditions.push(`p.status = $${paramIndex}::profiler_profile_status`);
                    queryParams.push(status);
                }
                paramIndex++;
            }

            // Filter by carry_forward_enabled
            if (carry_forward_enabled !== undefined) {
                whereConditions.push(`p.carry_forward_enabled = $${paramIndex}`);
                queryParams.push(carry_forward_enabled);
                paramIndex++;
            }

            // Filter by balance conditions
            if (has_positive_balance) {
                whereConditions.push(`(p.current_balance - p.total_withdrawn_amount) > 0`);
            }

            if (has_negative_balance) {
                whereConditions.push(`(p.current_balance - p.total_withdrawn_amount) < 0`);
            }

            if (balance_greater_than !== undefined) {
                whereConditions.push(`(p.current_balance - p.total_withdrawn_amount) > $${paramIndex}`);
                queryParams.push(balance_greater_than);
                paramIndex++;
            }

            if (balance_less_than !== undefined) {
                whereConditions.push(`(p.current_balance - p.total_withdrawn_amount) < $${paramIndex}`);
                queryParams.push(balance_less_than);
                paramIndex++;
            }

            // Filter by date range
            if (created_at_start !== undefined) {
                whereConditions.push(`DATE(p.created_at) >= $${paramIndex}::date`);
                queryParams.push(created_at_start);
                paramIndex++;
            }

            if (created_at_end !== undefined) {
                whereConditions.push(`DATE(p.created_at) <= $${paramIndex}::date`);
                queryParams.push(created_at_end);
                paramIndex++;
            }

            // Filter by pre-planned deposit amount
            if (pre_planned_deposit_amount !== undefined) {
                whereConditions.push(`p.pre_planned_deposit_amount = $${paramIndex}`);
                queryParams.push(pre_planned_deposit_amount);
                paramIndex++;
            }

            if (min_deposit_amount !== undefined) {
                whereConditions.push(`p.pre_planned_deposit_amount >= $${paramIndex}`);
                queryParams.push(min_deposit_amount);
                paramIndex++;
            }

            if (max_deposit_amount !== undefined) {
                whereConditions.push(`p.pre_planned_deposit_amount <= $${paramIndex}`);
                queryParams.push(max_deposit_amount);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Build ORDER BY clause
            let orderByClause = '';
            switch (sort_by) {
                case 'client_name':
                    orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                    break;
                case 'bank_name':
                    orderByClause = `ORDER BY LOWER(b.bank_name) ${sort_order.toUpperCase()}`;
                    break;
                case 'credit_card_number':
                    orderByClause = `ORDER BY p.credit_card_number ${sort_order.toUpperCase()}`;
                    break;
                case 'pre_planned_deposit_amount':
                    orderByClause = `ORDER BY p.pre_planned_deposit_amount ${sort_order.toUpperCase()}`;
                    break;
                case 'current_balance':
                    orderByClause = `ORDER BY p.current_balance ${sort_order.toUpperCase()}`;
                    break;
                case 'total_withdrawn_amount':
                    orderByClause = `ORDER BY p.total_withdrawn_amount ${sort_order.toUpperCase()}`;
                    break;
                case 'remaining_balance':
                    orderByClause = `ORDER BY (p.current_balance - p.total_withdrawn_amount) ${sort_order.toUpperCase()}`;
                    break;
                case 'created_at':
                    orderByClause = `ORDER BY p.created_at ${sort_order.toUpperCase()}`;
                    break;
                case 'transaction_count':
                    orderByClause = `ORDER BY COALESCE(t.transaction_count, 0) ${sort_order.toUpperCase()}`;
                    break;
                default:
                    orderByClause = `ORDER BY p.created_at DESC`;
            }

            // Build complete query
            const dataQuery = `
                ${PROFILER_PROFILE_QUERIES.GET_ALL_PROFILES}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            queryParams.push(validatedLimit, offset);

            // Count query
            const countQuery = `
                ${PROFILER_PROFILE_QUERIES.COUNT_PROFILES}
                ${whereClause}
            `;

            // Execute queries
            const [dataResult, countResult] = await Promise.all([
                query(dataQuery, queryParams),
                query(countQuery, queryParams.slice(0, -2))
            ]);

            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');
            const totalPages = Math.ceil(totalCount / validatedLimit);

            const filters: any = {};
            if (client_id !== undefined) filters.client_id = client_id;
            if (bank_id !== undefined) filters.bank_id = bank_id;
            if (status !== undefined) filters.status = status;
            if (carry_forward_enabled !== undefined) filters.carry_forward_enabled = carry_forward_enabled;
            if (has_positive_balance !== undefined) filters.has_positive_balance = has_positive_balance;
            if (has_negative_balance !== undefined) filters.has_negative_balance = has_negative_balance;
            if (balance_greater_than !== undefined) filters.balance_greater_than = balance_greater_than;
            if (balance_less_than !== undefined) filters.balance_less_than = balance_less_than;
            if (created_at_start !== undefined) filters.created_at_start = created_at_start;
            if (created_at_end !== undefined) filters.created_at_end = created_at_end;
            if (pre_planned_deposit_amount !== undefined) filters.pre_planned_deposit_amount = pre_planned_deposit_amount;
            if (min_deposit_amount !== undefined) filters.min_deposit_amount = min_deposit_amount;
            if (max_deposit_amount !== undefined) filters.max_deposit_amount = max_deposit_amount;

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
                filters_applied: Object.keys(filters).length > 0 ? filters : undefined,
                sort_applied: {
                    sort_by,
                    sort_order
                }
            };
        } catch (error) {
            logger.error('Error fetching paginated profiler profiles:', error);
            throw new DatabaseError('Failed to fetch paginated profiler profiles', error);
        }
    }

    /**
     * Get dashboard profiles (active, positive balance)
     */
    static async getDashboardProfiles(params: GetDashboardProfilesInput): Promise<PaginatedProfilerProfileResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                client_id,
                bank_id
            } = params;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100);
            const offset = (validatedPage - 1) * validatedLimit;

            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            // Add client_id filter if provided
            if (client_id !== undefined) {
                whereConditions.push(`p.client_id = $${paramIndex}`);
                queryParams.push(client_id);
                paramIndex++;
            }

            // Add bank_id filter if provided
            if (bank_id !== undefined) {
                whereConditions.push(`p.bank_id = $${paramIndex}`);
                queryParams.push(bank_id);
                paramIndex++;
            }

            const additionalWhere = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

            const dataQuery = `
                ${PROFILER_PROFILE_QUERIES.GET_DASHBOARD_PROFILES}
                ${additionalWhere}
                ORDER BY p.created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            queryParams.push(validatedLimit, offset);

            const countQuery = `
                ${PROFILER_PROFILE_QUERIES.COUNT_DASHBOARD_PROFILES}
                ${additionalWhere.replace('AND', 'AND')}
            `;

            const [dataResult, countResult] = await Promise.all([
                query(dataQuery, queryParams),
                query(countQuery, queryParams.slice(0, -2))
            ]);

            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');
            const totalPages = Math.ceil(totalCount / validatedLimit);

            const filters: any = {
                status: 'active' as ProfilerProfileStatus,
                has_positive_balance: true
            };
            if (client_id !== undefined) filters.client_id = client_id;
            if (bank_id !== undefined) filters.bank_id = bank_id;

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
                filters_applied: filters,
                sort_applied: {
                    sort_by: 'created_at',
                    sort_order: 'desc'
                }
            };
        } catch (error) {
            logger.error('Error fetching dashboard profiles:', error);
            throw new DatabaseError('Failed to fetch dashboard profiles', error);
        }
    }

    /**
     * Get profiler profile by ID
     */
    static async getProfileById(id: number): Promise<ProfilerProfile> {
        try {
            const result: QueryResult<ProfilerProfile> = await query(
                PROFILER_PROFILE_QUERIES.GET_PROFILE_BY_ID,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler profile with ID ${id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error fetching profiler profile by ID:', error);
            throw new DatabaseError('Failed to fetch profiler profile', error);
        }
    }

    /**
     * Get profiles by client ID
     */
    static async getProfilesByClient(clientId: number): Promise<ProfilerProfile[]> {
        try {
            const result: QueryResult<ProfilerProfile> = await query(
                PROFILER_PROFILE_QUERIES.GET_PROFILES_BY_CLIENT,
                [clientId]
            );
            return result.rows;
        } catch (error) {
            logger.error('Error fetching profiles by client:', error);
            throw new DatabaseError('Failed to fetch profiles by client', error);
        }
    }

    /**
     * Create new profiler profile
     */
    static async createProfile(profileData: ProfilerProfileInput): Promise<ProfilerProfile> {
        try {
            const result: QueryResult<ProfilerProfile> = await query(
                PROFILER_PROFILE_QUERIES.CREATE_PROFILE,
                [
                    profileData.client_id,
                    profileData.bank_id,
                    profileData.credit_card_number,
                    profileData.pre_planned_deposit_amount,
                    profileData.carry_forward_enabled || false,
                    profileData.notes || null
                ]
            );

            // Fetch the complete profile with joined data
            return await this.getProfileById(result.rows[0]!.id);
        } catch (error) {
            logger.error('Error creating profiler profile:', error);
            throw new DatabaseError('Failed to create profiler profile', error);
        }
    }

    /**
     * Update profiler profile
     */
    static async updateProfile(profileData: ProfilerProfileUpdateInput): Promise<ProfilerProfile> {
        try {
            const result: QueryResult<ProfilerProfile> = await query(
                PROFILER_PROFILE_QUERIES.UPDATE_PROFILE,
                [
                    profileData.id,
                    profileData.bank_id || null,
                    profileData.credit_card_number || null,
                    profileData.pre_planned_deposit_amount || null,
                    profileData.carry_forward_enabled !== undefined ? profileData.carry_forward_enabled : null,
                    profileData.notes !== undefined ? profileData.notes : null
                ]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler profile with ID ${profileData.id} not found`);
            }

            // Fetch the complete profile with joined data
            return await this.getProfileById(result.rows[0]!.id);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error updating profiler profile:', error);
            throw new DatabaseError('Failed to update profiler profile', error);
        }
    }

    /**
     * Mark profile as done
     */
    static async markProfileAsDone(id: number): Promise<ProfilerProfile> {
        try {
            const result = await query(PROFILER_PROFILE_QUERIES.MARK_PROFILE_AS_DONE, [id]);

            if (result.rowCount === 0) {
                throw new NotFoundError(`Active profiler profile with ID ${id} not found`);
            }

            // Fetch the complete profile with joined data
            return await this.getProfileById(id);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error marking profile as done:', error);
            throw new DatabaseError('Failed to mark profile as done', error);
        }
    }

    /**
     * Delete profiler profile (only if no transactions exist)
     */
    static async deleteProfile(id: number): Promise<void> {
        try {
            const result = await query(PROFILER_PROFILE_QUERIES.DELETE_PROFILE, [id]);

            if (result.rowCount === 0) {
                // Check if profile exists
                const checkResult = await query(PROFILER_PROFILE_QUERIES.CHECK_PROFILE_EXISTS, [id]);
                if (checkResult.rows.length === 0) {
                    throw new NotFoundError(`Profiler profile with ID ${id} not found`);
                } else {
                    throw new DatabaseError(
                        'Cannot delete profiler profile with existing transactions',
                        { profileId: id }
                    );
                }
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
            logger.error('Error deleting profiler profile:', error);
            throw new DatabaseError('Failed to delete profiler profile', error);
        }
    }

    /**
     * Get profiler profiles for autocomplete
     */
    static async getProfilesAutocomplete(
        params: ProfilerProfileAutocompleteInput
    ): Promise<ProfilerProfileAutocompleteResponse> {
        try {
            const { search, client_id, status, limit = 5 } = params;
            const validatedLimit = Math.min(Math.max(1, limit), 10);

            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                whereConditions.push(`(
                    c.name ILIKE $${paramIndex} OR 
                    b.bank_name ILIKE $${paramIndex} OR 
                    p.credit_card_number ILIKE $${paramIndex}
                )`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            if (client_id !== undefined) {
                whereConditions.push(`p.client_id = $${paramIndex}`);
                queryParams.push(client_id);
                paramIndex++;
            }

            if (status !== undefined) {
                whereConditions.push(`p.status = $${paramIndex}::profiler_profile_status`);
                queryParams.push(status);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const dataQuery = `
                ${PROFILER_PROFILE_QUERIES.GET_AUTOCOMPLETE_PROFILES}
                ${whereClause}
                ORDER BY c.name ASC, p.created_at DESC
                LIMIT $${paramIndex}
            `;
            queryParams.push(validatedLimit);

            const countQuery = `
                ${PROFILER_PROFILE_QUERIES.COUNT_AUTOCOMPLETE_PROFILES}
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
            logger.error('Error fetching profiler profiles autocomplete:', error);
            throw new DatabaseError('Failed to fetch profiler profiles for autocomplete', error);
        }
    }
}

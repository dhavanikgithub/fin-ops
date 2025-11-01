import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { BANK_QUERIES } from '../queries/bankQueries.js';
import { Bank, BankInput, BankUpdateInput, GetBanksInput, PaginatedBankResponse, BankAutocompleteInput, BankAutocompleteResponse, BankAutocompleteItem } from '../types/bank.js';
import { DatabaseError, NotFoundError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js'
/**
 * Database service for bank operations
 */
export class BankService {
    /**
     * Get all banks with transaction count
     */
    static async getAllBanks(): Promise<Bank[]> {
        try {
            const result: QueryResult<Bank> = await query(BANK_QUERIES.GET_ALL_BANKS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching banks:', error);
            throw new DatabaseError('Failed to fetch banks', error);
        }
    }

    /**
     * Get paginated banks with search and sort
     */
    static async getPaginatedBanks(params: GetBanksInput): Promise<PaginatedBankResponse> {
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
                    bank.name ILIKE $${paramIndex} OR 
                    bank.name ILIKE $${paramIndex + 1}
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
                    CASE WHEN bank.name ILIKE '${searchTermExact}' THEN 0 ELSE 1 END
                )`;
                
                switch (sort_by) {
                    case 'name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(bank.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY ${exactMatchPriority}, bank.create_date ${sort_order.toUpperCase()}, bank.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY ${exactMatchPriority}, COALESCE(bank_with_transactions.transaction_count, 0) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(bank.name) ${sort_order.toUpperCase()}`;
                }
            } else {
                // Normal sorting without search priority
                switch (sort_by) {
                    case 'name':
                        orderByClause = `ORDER BY LOWER(bank.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'create_date':
                        orderByClause = `ORDER BY bank.create_date ${sort_order.toUpperCase()}, bank.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_count':
                        orderByClause = `ORDER BY COALESCE(bank_with_transactions.transaction_count, 0) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY LOWER(bank.name) ${sort_order.toUpperCase()}`;
                }
            }

            // Count query
            const countQuery = `${BANK_QUERIES.COUNT_BANKS} ${whereClause}`;
            const countResult = await query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');

            // Data query with pagination
            const dataQuery = `
                ${BANK_QUERIES.GET_PAGINATED_BANKS}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            
            const dataParams = [...queryParams, validatedLimit, offset];
            const dataResult: QueryResult<Bank> = await query(dataQuery, dataParams);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / validatedLimit);
            const hasNextPage = validatedPage < totalPages;
            const hasPreviousPage = validatedPage > 1;

            const response: PaginatedBankResponse = {
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
            logger.error('Error fetching paginated banks:', error);
            throw new DatabaseError('Failed to fetch paginated banks', error);
        }
    }

    /**
     * Create a new bank
     */
    static async createBank(bankData: BankInput): Promise<Bank> {
        try {
            const result: QueryResult<Bank> = await query(
                BANK_QUERIES.CREATE_BANK,
                [bankData.name]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create bank - no rows returned');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error creating bank:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create bank', error);
        }
    }

    /**
     * Update an existing bank
     */
    static async updateBank(bankData: BankUpdateInput): Promise<Bank> {
        try {
            const result: QueryResult<Bank> = await query(
                BANK_QUERIES.UPDATE_BANK,
                [bankData.name, bankData.id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError('Bank not found');
            }

            return result.rows[0]!;
        } catch (error) {
            logger.error('Error updating bank:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to update bank', error);
        }
    }

    /**
     * Delete a bank
     */
    static async deleteBank(id: number): Promise<boolean> {
        try {
            const result: QueryResult = await query(
                BANK_QUERIES.DELETE_BANK,
                [id]
            );

            const deleted = result.rowCount !== null && result.rowCount > 0;
            if (!deleted) {
                throw new NotFoundError('Bank not found');
            }

            return deleted;
        } catch (error) {
            logger.error('Error deleting bank:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to delete bank', error);
        }
    }

    /**
     * Get banks for autocomplete
     */
    static async getBanksAutocomplete(input: BankAutocompleteInput): Promise<BankAutocompleteResponse> {
        try {
            logger.info('getBanksAutocomplete service started', { input });

            const { search, limit = 5 } = input;
            let queryStr = BANK_QUERIES.GET_BANKS_AUTOCOMPLETE;
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

            const result: QueryResult<BankAutocompleteItem> = await query(queryStr, queryParams);
            const banks = result.rows;

            const response: BankAutocompleteResponse = {
                data: banks,
                search_query: search || '',
                result_count: banks.length,
                limit_applied: limit
            };

            logger.debug('getBanksAutocomplete service completed', {
                returnedCount: banks.length,
                search,
                limit
            });

            return response;
        } catch (error) {
            logger.error('Error in getBanksAutocomplete service', { error });
            throw new DatabaseError('Failed to fetch banks for autocomplete', error);
        }
    }
}
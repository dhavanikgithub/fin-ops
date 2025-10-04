import { QueryResult } from 'pg';
import { query } from '../../utils/db';
import { TRANSACTION_QUERIES } from '../queries/transactionQueries';
import { Transaction, TransactionInput, TransactionUpdateInput, GetTransactionsInput, PaginatedTransactionResponse, TransactionFilters, ReportPreviewInput, ReportPreviewResponse } from '../types/transaction';
import { DatabaseError, NotFoundError } from '../../common/errors/index';
import { logger } from '../../utils/logger'

/**
 * Database service for transaction operations
 */
export class TransactionService {
    /**
     * Get all transactions with client, bank, and card details
     */
    static async getAllTransactions(): Promise<Transaction[]> {
        try {
            const result: QueryResult<Transaction> = await query(TRANSACTION_QUERIES.GET_ALL_TRANSACTIONS);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching transactions:', error);
            throw new DatabaseError('Failed to fetch transactions', error);
        }
    }

    /**
     * Get paginated transactions with filters, search, and sort
     */
    static async getPaginatedTransactions(params: GetTransactionsInput): Promise<PaginatedTransactionResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                transaction_type,
                min_amount,
                max_amount,
                start_date,
                end_date,
                bank_ids,
                card_ids,
                client_ids,
                search,
                sort_by = 'create_date',
                sort_order = 'desc'
            } = params;

            // Validate page and limit
            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 records per page
            const offset = (validatedPage - 1) * validatedLimit;

            // Build WHERE conditions
            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            // Filter by transaction type
            if (transaction_type !== undefined) {
                whereConditions.push(`tr.transaction_type = $${paramIndex}`);
                queryParams.push(transaction_type);
                paramIndex++;
            }

            // Filter by amount range
            if (min_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount >= $${paramIndex}`);
                queryParams.push(min_amount);
                paramIndex++;
            }

            if (max_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount <= $${paramIndex}`);
                queryParams.push(max_amount);
                paramIndex++;
            }

            // Filter by date range
            if (start_date) {
                whereConditions.push(`tr.create_date >= $${paramIndex}`);
                queryParams.push(start_date);
                paramIndex++;
            }

            if (end_date) {
                whereConditions.push(`tr.create_date <= $${paramIndex}`);
                queryParams.push(end_date);
                paramIndex++;
            }

            // Filter by bank IDs
            if (bank_ids && bank_ids.length > 0) {
                whereConditions.push(`tr.bank_id = ANY($${paramIndex})`);
                queryParams.push(bank_ids);
                paramIndex++;
            }

            // Filter by card IDs
            if (card_ids && card_ids.length > 0) {
                whereConditions.push(`tr.card_id = ANY($${paramIndex})`);
                queryParams.push(card_ids);
                paramIndex++;
            }

            // Filter by client IDs
            if (client_ids && client_ids.length > 0) {
                whereConditions.push(`tr.client_id = ANY($${paramIndex})`);
                queryParams.push(client_ids);
                paramIndex++;
            }

            // Search functionality (case insensitive with priority for exact matches)
            if (search && search.trim()) {
                const searchTermExact = search.trim();
                const searchTermWildcard = `%${search.trim()}%`;

                // Priority search: exact match first, then wildcard match
                whereConditions.push(`(
                    (c.name ILIKE $${paramIndex} OR 
                     COALESCE(bk.name, '') ILIKE $${paramIndex} OR 
                     COALESCE(ct.name, '') ILIKE $${paramIndex} OR 
                     COALESCE(tr.remark, '') ILIKE $${paramIndex}) OR
                    (c.name ILIKE $${paramIndex + 1} OR 
                     COALESCE(bk.name, '') ILIKE $${paramIndex + 1} OR 
                     COALESCE(ct.name, '') ILIKE $${paramIndex + 1} OR 
                     COALESCE(tr.remark, '') ILIKE $${paramIndex + 1})
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
                              COALESCE(bk.name, '') ILIKE '${searchTermExact}' OR 
                              COALESCE(ct.name, '') ILIKE '${searchTermExact}' OR 
                              COALESCE(tr.remark, '') ILIKE '${searchTermExact}') 
                         THEN 0 ELSE 1 END
                )`;

                switch (sort_by) {
                    case 'create_date':
                        orderByClause = `ORDER BY ${exactMatchPriority}, tr.create_date ${sort_order.toUpperCase()}, tr.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_amount':
                        orderByClause = `ORDER BY ${exactMatchPriority}, tr.transaction_amount ${sort_order.toUpperCase()}`;
                        break;
                    case 'client_name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(c.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'bank_name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(COALESCE(bk.name, '')) ${sort_order.toUpperCase()}`;
                        break;
                    case 'card_name':
                        orderByClause = `ORDER BY ${exactMatchPriority}, LOWER(COALESCE(ct.name, '')) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY ${exactMatchPriority}, tr.create_date ${sort_order.toUpperCase()}, tr.create_time ${sort_order.toUpperCase()}`;
                }
            } else {
                // Normal sorting without search priority
                switch (sort_by) {
                    case 'create_date':
                        orderByClause = `ORDER BY tr.create_date ${sort_order.toUpperCase()}, tr.create_time ${sort_order.toUpperCase()}`;
                        break;
                    case 'transaction_amount':
                        orderByClause = `ORDER BY tr.transaction_amount ${sort_order.toUpperCase()}`;
                        break;
                    case 'client_name':
                        orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                        break;
                    case 'bank_name':
                        orderByClause = `ORDER BY LOWER(COALESCE(bk.name, '')) ${sort_order.toUpperCase()}`;
                        break;
                    case 'card_name':
                        orderByClause = `ORDER BY LOWER(COALESCE(ct.name, '')) ${sort_order.toUpperCase()}`;
                        break;
                    default:
                        orderByClause = `ORDER BY tr.create_date ${sort_order.toUpperCase()}, tr.create_time ${sort_order.toUpperCase()}`;
                }
            }

            // Count query
            const countQuery = `${TRANSACTION_QUERIES.COUNT_TRANSACTIONS} ${whereClause}`;
            const countResult = await query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');

            // Data query with pagination
            const dataQuery = `
                ${TRANSACTION_QUERIES.GET_PAGINATED_TRANSACTIONS}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const dataParams = [...queryParams, validatedLimit, offset];
            const dataResult: QueryResult<Transaction> = await query(dataQuery, dataParams);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / validatedLimit);
            const hasNextPage = validatedPage < totalPages;
            const hasPreviousPage = validatedPage > 1;

            const filtersApplied: TransactionFilters = {};
            if (transaction_type !== undefined) filtersApplied.transaction_type = transaction_type;
            if (min_amount !== undefined) filtersApplied.min_amount = min_amount;
            if (max_amount !== undefined) filtersApplied.max_amount = max_amount;
            if (start_date !== undefined) filtersApplied.start_date = start_date;
            if (end_date !== undefined) filtersApplied.end_date = end_date;
            if (bank_ids !== undefined) filtersApplied.bank_ids = bank_ids;
            if (card_ids !== undefined) filtersApplied.card_ids = card_ids;
            if (client_ids !== undefined) filtersApplied.client_ids = client_ids;

            const response: PaginatedTransactionResponse = {
                data: dataResult.rows,
                pagination: {
                    current_page: validatedPage,
                    per_page: validatedLimit,
                    total_count: totalCount,
                    total_pages: totalPages,
                    has_next_page: hasNextPage,
                    has_previous_page: hasPreviousPage
                },
                filters_applied: filtersApplied,
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
            logger.error('Error fetching paginated transactions:', error);
            throw new DatabaseError('Failed to fetch paginated transactions', error);
        }
    }

    /**
     * Get transaction by ID with details
     */
    static async getTransactionById(id: number): Promise<Transaction | null> {
        try {
            const result: QueryResult<Transaction> = await query(
                TRANSACTION_QUERIES.GET_TRANSACTION_WITH_DETAILS,
                [id]
            );
            return result.rows.length > 0 ? result.rows[0]! : null;
        } catch (error) {
            logger.error('Error fetching transaction by ID:', error);
            throw new DatabaseError('Failed to fetch transaction', error);
        }
    }

    /**
     * Create a new transaction
     */
    static async createTransaction(transactionData: TransactionInput): Promise<Transaction> {
        try {
            // Create the transaction first
            const result: QueryResult = await query(
                TRANSACTION_QUERIES.CREATE_TRANSACTION,
                [
                    transactionData.client_id,
                    transactionData.transaction_type,
                    transactionData.widthdraw_charges,
                    transactionData.transaction_amount,
                    transactionData.remark || '',
                    transactionData.bank_id || null,
                    transactionData.card_id || null
                ]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Failed to create transaction - no rows returned');
            }

            // Get the transaction with all details
            const transactionWithDetails = await query(
                TRANSACTION_QUERIES.GET_TRANSACTION_WITH_DETAILS,
                [result.rows[0].id]
            );

            if (transactionWithDetails.rows.length === 0) {
                throw new DatabaseError('Failed to retrieve created transaction details');
            }

            return transactionWithDetails.rows[0]!;
        } catch (error) {
            logger.error('Error creating transaction:', error);
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to create transaction', error);
        }
    }

    /**
     * Update an existing transaction with selective field updates
     */
    static async updateTransaction(transactionData: TransactionUpdateInput): Promise<Transaction> {
        try {
            // Build dynamic UPDATE query
            const setClause: string[] = [];
            const values: any[] = [];

            if (transactionData.client_id !== undefined) {
                setClause.push(`client_id = $${values.length + 1}`);
                values.push(transactionData.client_id);
            }

            if (transactionData.transaction_type !== undefined) {
                setClause.push(`transaction_type = $${values.length + 1}`);
                values.push(transactionData.transaction_type);
            }

            if (transactionData.widthdraw_charges !== undefined) {
                setClause.push(`widthdraw_charges = $${values.length + 1}`);
                values.push(transactionData.widthdraw_charges);
            }

            if (transactionData.transaction_amount !== undefined) {
                setClause.push(`transaction_amount = $${values.length + 1}`);
                values.push(transactionData.transaction_amount);
            }

            if (transactionData.bank_id !== undefined) {
                setClause.push(`bank_id = $${values.length + 1}`);
                values.push(transactionData.bank_id);
            }

            if (transactionData.card_id !== undefined) {
                setClause.push(`card_id = $${values.length + 1}`);
                values.push(transactionData.card_id);
            }

            if (transactionData.remark !== undefined) {
                setClause.push(`remark = $${values.length + 1}`);
                values.push(transactionData.remark);
            }

            if (setClause.length === 0) {
                throw new DatabaseError('No fields to update');
            }

            // Add ID for WHERE clause
            values.push(transactionData.id);
            const updateQuery = `UPDATE transaction_records SET ${setClause.join(', ')} WHERE id = $${values.length} RETURNING *`;

            const result: QueryResult = await query(updateQuery, values);

            if (result.rows.length === 0) {
                throw new NotFoundError('Transaction not found');
            }

            // Get the updated transaction with all details
            const transactionWithDetails = await query(
                TRANSACTION_QUERIES.GET_TRANSACTION_WITH_DETAILS,
                [transactionData.id]
            );

            if (transactionWithDetails.rows.length === 0) {
                throw new DatabaseError('Failed to retrieve updated transaction details');
            }

            return transactionWithDetails.rows[0]!;
        } catch (error) {
            logger.error('Error updating transaction:', error);
            if (error instanceof NotFoundError || error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Failed to update transaction', error);
        }
    }

    /**
     * Delete a transaction
     */
    static async deleteTransaction(id: number): Promise<boolean> {
        try {
            const result: QueryResult = await query(
                TRANSACTION_QUERIES.DELETE_TRANSACTION,
                [id]
            );

            const deleted = result.rowCount !== null && result.rowCount > 0;
            if (!deleted) {
                throw new NotFoundError('Transaction not found');
            }

            return deleted;
        } catch (error) {
            logger.error('Error deleting transaction:', error);
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError('Failed to delete transaction', error);
        }
    }

    /**
     * Get report preview with estimated rows and file size
     */
    static async getReportPreview(input: ReportPreviewInput): Promise<ReportPreviewResponse> {
        try {
            logger.info('getReportPreview service started', { input });

            const {
                transaction_type,
                min_amount,
                max_amount,
                start_date,
                end_date,
                bank_ids,
                card_ids,
                client_ids,
                search,
                format = 'CSV',
                fields = ['client_name', 'bank_name', 'card_name', 'transaction_amount', 'transaction_type', 'create_date']
            } = input;

            // Build the count query with same filters as paginated transactions
            let countQuery = TRANSACTION_QUERIES.COUNT_TRANSACTIONS_FOR_REPORT;
            let queryParams: any[] = [];
            let whereConditions: string[] = [];
            let paramIndex = 1;

            // Apply filters
            if (transaction_type !== undefined) {
                whereConditions.push(`tr.transaction_type = $${paramIndex}`);
                queryParams.push(transaction_type);
                paramIndex++;
            }

            if (min_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount >= $${paramIndex}`);
                queryParams.push(min_amount);
                paramIndex++;
            }

            if (max_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount <= $${paramIndex}`);
                queryParams.push(max_amount);
                paramIndex++;
            }

            if (start_date) {
                whereConditions.push(`tr.create_date >= $${paramIndex}`);
                queryParams.push(start_date);
                paramIndex++;
            }

            if (end_date) {
                whereConditions.push(`tr.create_date <= $${paramIndex}`);
                queryParams.push(end_date);
                paramIndex++;
            }

            if (bank_ids && bank_ids.length > 0) {
                const placeholders = bank_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.bank_id IN (${placeholders})`);
                queryParams.push(...bank_ids);
                paramIndex += bank_ids.length;
            }

            if (card_ids && card_ids.length > 0) {
                const placeholders = card_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.card_id IN (${placeholders})`);
                queryParams.push(...card_ids);
                paramIndex += card_ids.length;
            }

            if (client_ids && client_ids.length > 0) {
                const placeholders = client_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.client_id IN (${placeholders})`);
                queryParams.push(...client_ids);
                paramIndex += client_ids.length;
            }

            // Apply search if provided
            if (search && search.trim()) {
                const searchConditions = [
                    `COALESCE(c.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(b.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(ca.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(tr.remark, '') ILIKE $${paramIndex}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                queryParams.push(`%${search.trim()}%`);
                paramIndex++;
            }

            // Add WHERE clause if there are conditions
            if (whereConditions.length > 0) {
                countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            logger.debug('Executing count query for report preview', { 
                query: countQuery.replace(/\\s+/g, ' ').trim(),
                params: queryParams
            });

            // Execute count query
            const countResult: QueryResult<{ total_count: string }> = await query(countQuery, queryParams);
            const totalRows = parseInt(countResult.rows[0]?.total_count || '0');

            // Calculate estimated file size based on format and fields
            const sizeCalculation = this.calculateEstimatedSize(totalRows, format, fields);

            // Format the size in human-readable format
            const formattedSize = this.formatFileSize(sizeCalculation.totalBytes);

            // Build filters_applied object with only defined properties
            const filtersApplied: TransactionFilters = {};
            if (transaction_type !== undefined) filtersApplied.transaction_type = transaction_type;
            if (min_amount !== undefined) filtersApplied.min_amount = min_amount;
            if (max_amount !== undefined) filtersApplied.max_amount = max_amount;
            if (start_date !== undefined) filtersApplied.start_date = start_date;
            if (end_date !== undefined) filtersApplied.end_date = end_date;
            if (bank_ids !== undefined) filtersApplied.bank_ids = bank_ids;
            if (card_ids !== undefined) filtersApplied.card_ids = card_ids;
            if (client_ids !== undefined) filtersApplied.client_ids = client_ids;

            const response: ReportPreviewResponse = {
                estimated_rows: totalRows,
                estimated_size: formattedSize,
                estimated_size_bytes: sizeCalculation.totalBytes,
                format,
                filters_applied: filtersApplied,
                selected_fields: fields,
                preview_calculation: sizeCalculation.breakdown
            };

            if (search !== undefined) {
                response.search_applied = search;
            }

            logger.debug('getReportPreview service completed', {
                estimatedRows: totalRows,
                estimatedSize: formattedSize,
                format,
                fieldsCount: fields.length
            });

            return response;
        } catch (error) {
            logger.error('Error in getReportPreview service', { error });
            throw new DatabaseError('Failed to generate report preview', error);
        }
    }

    /**
     * Calculate estimated file size based on rows, format, and fields
     */
    private static calculateEstimatedSize(rows: number, format: string, fields: string[]): {
        totalBytes: number;
        breakdown: {
            base_size_per_row: number;
            field_overhead: number;
            format_overhead: number;
            compression_factor: number;
        };
    } {
        // Base size per field (average characters per field)
        const fieldSizes: Record<string, number> = {
            'client_name': 25,
            'bank_name': 20,
            'card_name': 25,
            'transaction_amount': 12,
            'transaction_type': 8,
            'create_date': 20,
            'create_time': 12,
            'remark': 50,
            'widthdraw_charges': 12
        };

        // Calculate base size per row
        let baseSizePerRow = 0;
        fields.forEach(field => {
            baseSizePerRow += fieldSizes[field] || 15; // Default 15 chars for unknown fields
        });

        // Add separators/formatting overhead per row
        let formatOverhead = 0;
        let compressionFactor = 1;

        switch (format.toUpperCase()) {
            case 'CSV':
                formatOverhead = fields.length - 1; // Commas between fields
                formatOverhead += 2; // Newline characters
                compressionFactor = 0.8; // CSV compresses well
                break;
            case 'EXCEL':
                formatOverhead = fields.length * 2; // Excel overhead per cell
                formatOverhead += 50; // Row overhead in Excel format
                compressionFactor = 0.6; // Excel compresses very well
                break;
            case 'JSON':
                formatOverhead = fields.length * 8; // JSON key names and quotes
                formatOverhead += 20; // JSON object structure overhead
                compressionFactor = 0.9; // JSON doesn't compress as well
                break;
            case 'PDF':
                formatOverhead = fields.length * 5; // PDF formatting
                formatOverhead += 100; // PDF structure overhead per row
                compressionFactor = 0.95; // PDF doesn't compress much
                break;
            default:
                formatOverhead = 10; // Default overhead
                compressionFactor = 0.85;
        }

        const totalSizePerRow = baseSizePerRow + formatOverhead;
        const rawTotalBytes = rows * totalSizePerRow;
        const compressedBytes = Math.round(rawTotalBytes * compressionFactor);

        // Add file header/footer overhead
        let fileOverhead = 0;
        switch (format.toUpperCase()) {
            case 'CSV':
                fileOverhead = fields.join(',').length + 2; // Header row
                break;
            case 'EXCEL':
                fileOverhead = 1024; // Excel file structure
                break;
            case 'JSON':
                fileOverhead = 50; // JSON array structure
                break;
            case 'PDF':
                fileOverhead = 5000; // PDF document structure
                break;
        }

        const totalBytes = compressedBytes + fileOverhead;

        return {
            totalBytes,
            breakdown: {
                base_size_per_row: baseSizePerRow,
                field_overhead: formatOverhead,
                format_overhead: fileOverhead,
                compression_factor: compressionFactor
            }
        };
    }

    /**
     * Format file size in human-readable format
     */
    private static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        const size = bytes / Math.pow(k, i);
        const formattedSize = i === 0 ? size.toString() : size.toFixed(1);
        
        return `~${formattedSize} ${sizes[i]}`;
    }
}
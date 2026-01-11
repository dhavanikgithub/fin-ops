import { QueryResult } from 'pg';
import { query } from '../../utils/db.js';
import { PROFILER_TRANSACTION_QUERIES } from '../queries/profilerTransactionQueries.js';
import * as path from 'path';
import * as fs from 'fs';
import ProfilerTransactionReportPDF from '../pdf-template/profilerTransactionReportPDF.js';
import {
    ProfilerTransaction,
    ProfilerDepositTransactionInput,
    ProfilerWithdrawTransactionInput,
    GetProfilerTransactionsInput,
    PaginatedProfilerTransactionResponse,
    ProfilerTransactionType,
    calculateWithdrawCharges
} from '../types/profilerTransaction.js';
import { DatabaseError, NotFoundError } from '../../common/errors/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Database service for profiler transaction operations
 */
export class ProfilerTransactionService {
    /**
     * Get all profiler transactions
     */
    static async getAllTransactions(): Promise<ProfilerTransaction[]> {
        try {
            const result: QueryResult<ProfilerTransaction> = await query(
                `${PROFILER_TRANSACTION_QUERIES.GET_ALL_TRANSACTIONS} ORDER BY t.created_at DESC`
            );
            return result.rows;
        } catch (error) {
            logger.error('Error fetching profiler transactions:', error);
            throw new DatabaseError('Failed to fetch profiler transactions', error);
        }
    }

    /**
     * Get paginated profiler transactions with search and filters
     */
    static async getPaginatedTransactions(
        params: GetProfilerTransactionsInput
    ): Promise<PaginatedProfilerTransactionResponse> {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                profile_id,
                client_id,
                bank_id,
                transaction_type,
                amount_greater_than,
                amount_less_than,
                date_from,
                date_to,
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
                    COALESCE(t.notes, '') ILIKE $${paramIndex} OR
                    CAST(t.amount AS TEXT) ILIKE $${paramIndex} OR
                    CAST(t.withdraw_charges_percentage AS TEXT) ILIKE $${paramIndex} OR
                    CAST(t.withdraw_charges_amount AS TEXT) ILIKE $${paramIndex}
                )`);
                queryParams.push(searchTerm);
                paramIndex++;
            }

            // Filter by profile_id
            if (profile_id !== undefined) {
                if (Array.isArray(profile_id)) {
                    whereConditions.push(`t.profile_id = ANY($${paramIndex})`);
                    queryParams.push(profile_id);
                } else {
                    whereConditions.push(`t.profile_id = $${paramIndex}`);
                    queryParams.push(profile_id);
                }
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

            // Filter by transaction_type
            if (transaction_type !== undefined) {
                if (Array.isArray(transaction_type)) {
                    whereConditions.push(`t.transaction_type = ANY($${paramIndex}::profiler_transaction_type[])`);
                    queryParams.push(transaction_type);
                } else {
                    whereConditions.push(`t.transaction_type = $${paramIndex}::profiler_transaction_type`);
                    queryParams.push(transaction_type);
                }
                paramIndex++;
            }

            // Filter by amount range
            if (amount_greater_than !== undefined) {
                whereConditions.push(`t.amount > $${paramIndex}`);
                queryParams.push(amount_greater_than);
                paramIndex++;
            }

            if (amount_less_than !== undefined) {
                whereConditions.push(`t.amount < $${paramIndex}`);
                queryParams.push(amount_less_than);
                paramIndex++;
            }

            // Filter by date range
            if (date_from !== undefined) {
                whereConditions.push(`t.created_at >= $${paramIndex}`);
                queryParams.push(date_from);
                paramIndex++;
            }

            if (date_to !== undefined) {
                whereConditions.push(`t.created_at <= $${paramIndex}`);
                queryParams.push(date_to);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Build ORDER BY clause
            let orderByClause = '';
            switch (sort_by) {
                case 'created_at':
                    orderByClause = `ORDER BY t.created_at ${sort_order.toUpperCase()}`;
                    break;
                case 'amount':
                    orderByClause = `ORDER BY t.amount ${sort_order.toUpperCase()}`;
                    break;
                case 'transaction_type':
                    orderByClause = `ORDER BY t.transaction_type ${sort_order.toUpperCase()}`;
                    break;
                case 'client_name':
                    orderByClause = `ORDER BY LOWER(c.name) ${sort_order.toUpperCase()}`;
                    break;
                case 'bank_name':
                    orderByClause = `ORDER BY LOWER(b.bank_name) ${sort_order.toUpperCase()}`;
                    break;
                default:
                    orderByClause = `ORDER BY t.created_at DESC`;
            }

            // Build complete query
            const dataQuery = `
                ${PROFILER_TRANSACTION_QUERIES.GET_ALL_TRANSACTIONS}
                ${whereClause}
                ${orderByClause}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            queryParams.push(validatedLimit, offset);

            // Count query
            const countQuery = `
                ${PROFILER_TRANSACTION_QUERIES.COUNT_TRANSACTIONS}
                ${whereClause}
            `;

            // Summary query
            const summaryQuery = `
                ${PROFILER_TRANSACTION_QUERIES.GET_TRANSACTION_SUMMARY}
                ${whereClause}
            `;

            // Execute queries
            const [dataResult, countResult, summaryResult] = await Promise.all([
                query(dataQuery, queryParams),
                query(countQuery, queryParams.slice(0, -2)),
                query(summaryQuery, queryParams.slice(0, -2))
            ]);

            const totalCount = parseInt(countResult.rows[0]?.total_count || '0');
            const totalPages = Math.ceil(totalCount / validatedLimit);

            const summary = summaryResult.rows[0];
            const summaryData = {
                total_deposits: parseFloat(summary?.total_deposits || '0'),
                total_withdrawals: parseFloat(summary?.total_withdrawals || '0'),
                total_charges: parseFloat(summary?.total_charges || '0'),
                net_amount: parseFloat(summary?.total_deposits || '0') - 
                           parseFloat(summary?.total_withdrawals || '0') - 
                           parseFloat(summary?.total_charges || '0')
            };

            const filters: any = {};
            if (profile_id !== undefined) filters.profile_id = profile_id;
            if (client_id !== undefined) filters.client_id = client_id;
            if (bank_id !== undefined) filters.bank_id = bank_id;
            if (transaction_type !== undefined) filters.transaction_type = transaction_type;
            if (amount_greater_than !== undefined) filters.amount_greater_than = amount_greater_than;
            if (amount_less_than !== undefined) filters.amount_less_than = amount_less_than;
            if (date_from !== undefined) filters.date_from = date_from;
            if (date_to !== undefined) filters.date_to = date_to;

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
                },
                summary: summaryData
            };
        } catch (error) {
            logger.error('Error fetching paginated profiler transactions:', error);
            throw new DatabaseError('Failed to fetch paginated profiler transactions', error);
        }
    }

    /**
     * Get profiler transaction by ID
     */
    static async getTransactionById(id: number): Promise<ProfilerTransaction> {
        try {
            const result: QueryResult<ProfilerTransaction> = await query(
                PROFILER_TRANSACTION_QUERIES.GET_TRANSACTION_BY_ID,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError(`Profiler transaction with ID ${id} not found`);
            }

            return result.rows[0]!;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error fetching profiler transaction by ID:', error);
            throw new DatabaseError('Failed to fetch profiler transaction', error);
        }
    }

    /**
     * Get transactions by profile ID
     */
    static async getTransactionsByProfile(profileId: number): Promise<ProfilerTransaction[]> {
        try {
            const result: QueryResult<ProfilerTransaction> = await query(
                PROFILER_TRANSACTION_QUERIES.GET_TRANSACTIONS_BY_PROFILE,
                [profileId]
            );
            return result.rows;
        } catch (error) {
            logger.error('Error fetching transactions by profile:', error);
            throw new DatabaseError('Failed to fetch transactions by profile', error);
        }
    }

    /**
     * Create deposit transaction
     */
    static async createDepositTransaction(
        transactionData: ProfilerDepositTransactionInput
    ): Promise<ProfilerTransaction> {
        try {
            const result: QueryResult<ProfilerTransaction> = await query(
                PROFILER_TRANSACTION_QUERIES.CREATE_DEPOSIT_TRANSACTION,
                [
                    transactionData.profile_id,
                    transactionData.amount,
                    transactionData.notes || null
                ]
            );

            // Fetch the complete transaction with joined data
            return await this.getTransactionById(result.rows[0]!.id);
        } catch (error) {
            logger.error('Error creating deposit transaction:', error);
            throw new DatabaseError('Failed to create deposit transaction', error);
        }
    }

    /**
     * Create withdraw transaction
     */
    static async createWithdrawTransaction(
        transactionData: ProfilerWithdrawTransactionInput
    ): Promise<ProfilerTransaction> {
        try {
            // Calculate charges if percentage is provided
            const chargesAmount = transactionData.withdraw_charges_percentage 
                ? calculateWithdrawCharges(transactionData.amount, transactionData.withdraw_charges_percentage)
                : 0;

            const result: QueryResult<ProfilerTransaction> = await query(
                PROFILER_TRANSACTION_QUERIES.CREATE_WITHDRAW_TRANSACTION,
                [
                    transactionData.profile_id,
                    transactionData.amount,
                    transactionData.withdraw_charges_percentage || null,
                    chargesAmount,
                    transactionData.notes || null
                ]
            );

            // Fetch the complete transaction with joined data
            return await this.getTransactionById(result.rows[0]!.id);
        } catch (error) {
            logger.error('Error creating withdraw transaction:', error);
            throw new DatabaseError('Failed to create withdraw transaction', error);
        }
    }

    /**
     * Delete profiler transaction
     */
    static async deleteTransaction(id: number): Promise<void> {
        try {
            const result = await query(PROFILER_TRANSACTION_QUERIES.DELETE_TRANSACTION, [id]);

            if (result.rowCount === 0) {
                throw new NotFoundError(`Profiler transaction with ID ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error deleting profiler transaction:', error);
            throw new DatabaseError('Failed to delete profiler transaction', error);
        }
    }

    /**
     * Get transaction summary for a profile
     */
    static async getProfileTransactionSummary(profileId: number): Promise<{
        total_deposits: number;
        total_withdrawals: number;
        total_charges: number;
        net_amount: number;
        transaction_count: number;
    }> {
        try {
            const result = await query(
                PROFILER_TRANSACTION_QUERIES.GET_PROFILE_TRANSACTION_SUMMARY,
                [profileId]
            );

            const summary = result.rows[0];
            return {
                total_deposits: parseFloat(summary?.total_deposits || '0'),
                total_withdrawals: parseFloat(summary?.total_withdrawals || '0'),
                total_charges: parseFloat(summary?.total_charges || '0'),
                net_amount: parseFloat(summary?.total_deposits || '0') - 
                           parseFloat(summary?.total_withdrawals || '0') - 
                           parseFloat(summary?.total_charges || '0'),
                transaction_count: parseInt(summary?.transaction_count || '0')
            };
        } catch (error) {
            logger.error('Error fetching profile transaction summary:', error);
            throw new DatabaseError('Failed to fetch profile transaction summary', error);
        }
    }

    /**
     * Export profile transactions as PDF
     */
    static async exportProfileTransactionsPDF(profileId: number): Promise<string> {
        try {
            // Get profile information
            const profileQuery = `
                SELECT 
                    p.id,
                    c.name AS client_name,
                    b.bank_name,
                    p.credit_card_number,
                    p.pre_planned_deposit_amount,
                    p.current_balance
                FROM profiler_profiles p
                INNER JOIN profiler_clients c ON p.client_id = c.id
                INNER JOIN profiler_banks b ON p.bank_id = b.id
                WHERE p.id = $1
            `;
            const profileResult = await query(profileQuery, [profileId]);
            
            if (profileResult.rows.length === 0) {
                throw new NotFoundError(`Profile with ID ${profileId} not found`);
            }

            const profile = profileResult.rows[0];

            // Get transactions
            const transactions = await this.getTransactionsByProfile(profileId);

            // Get summary
            const summary = await this.getProfileTransactionSummary(profileId);

            // Prepare PDF data
            const pdfData = {
                client_name: profile.client_name,
                bank_name: profile.bank_name,
                credit_card_number: profile.credit_card_number,
                opening_balance: parseFloat(profile.pre_planned_deposit_amount),
                current_balance: parseFloat(profile.current_balance),
                transactions,
                summary
            };

            // Generate filename with client name and datetime
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const sanitizedClientName = profile.client_name.replace(/[^a-z0-9]/gi, '_');
            const filename = `${sanitizedClientName}_Transactions_${timestamp}.pdf`;
            
            // Ensure temp directory exists
            const tempDir = path.join(process.cwd(), 'temp', 'pdf-exports');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const outputPath = path.join(tempDir, filename);

            // Generate PDF
            const pdfGenerator = new ProfilerTransactionReportPDF();
            await pdfGenerator.generatePDF(pdfData, outputPath);

            return outputPath;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error('Error exporting profile transactions to PDF:', error);
            throw new DatabaseError('Failed to export profile transactions to PDF', error);
        }
    }
}

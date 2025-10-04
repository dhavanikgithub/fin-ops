import { pool } from '../../utils/db';
import { TRANSACTION_REPORT_QUERIES } from '../queries/reportQueries';
import { 
    ReportRequestBody, 
    TransactionRecord,
    TransactionExportRecord
} from '../types/report';
import { getTransactionTypeStr } from '../../utils/helper';

export class ReportService {
    /**
     * Get transactions for report generation
     */
    static async getTransactionsForReport(
        startDate: string, 
        endDate: string, 
        clientId?: string | null
    ): Promise<TransactionRecord[]> {
        const isClientSpecific = clientId !== undefined && clientId !== null;
        
        let query: string;
        let params: (string | number)[];

        if (isClientSpecific) {
            query = TRANSACTION_REPORT_QUERIES.GET_TRANSACTIONS_FOR_REPORT_BY_CLIENT;
            params = [startDate, endDate, parseInt(clientId as string, 10)];
        } else {
            query = TRANSACTION_REPORT_QUERIES.GET_TRANSACTIONS_FOR_REPORT;
            params = [startDate, endDate];
        }

        const result = await pool.query<TransactionRecord>(query, params);
        return result.rows;
    }

    /**
     * Get transactions for export with filters
     */
    static async getTransactionsForExport(reportRequest: ReportRequestBody): Promise<TransactionExportRecord[]> {
        const { startDate, endDate, filters } = reportRequest;
        
        let query = TRANSACTION_REPORT_QUERIES.GET_TRANSACTIONS_FOR_EXPORT;
        let queryParams: any[] = [];
        let whereConditions: string[] = [];
        let paramIndex = 1;

        // Date range is required
        if (startDate && endDate) {
            whereConditions.push(`tr.create_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            queryParams.push(startDate, endDate);
            paramIndex += 2;
        }

        // Apply additional filters if provided
        if (filters) {
            if (filters.transaction_type !== undefined) {
                whereConditions.push(`tr.transaction_type = $${paramIndex}`);
                queryParams.push(filters.transaction_type);
                paramIndex++;
            }

            if (filters.min_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount >= $${paramIndex}`);
                queryParams.push(filters.min_amount);
                paramIndex++;
            }

            if (filters.max_amount !== undefined) {
                whereConditions.push(`tr.transaction_amount <= $${paramIndex}`);
                queryParams.push(filters.max_amount);
                paramIndex++;
            }

            if (filters.bank_ids && filters.bank_ids.length > 0) {
                const placeholders = filters.bank_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.bank_id IN (${placeholders})`);
                queryParams.push(...filters.bank_ids);
                paramIndex += filters.bank_ids.length;
            }

            if (filters.card_ids && filters.card_ids.length > 0) {
                const placeholders = filters.card_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.card_id IN (${placeholders})`);
                queryParams.push(...filters.card_ids);
                paramIndex += filters.card_ids.length;
            }

            if (filters.client_ids && filters.client_ids.length > 0) {
                const placeholders = filters.client_ids.map((_, index) => `$${paramIndex + index}`).join(', ');
                whereConditions.push(`tr.client_id IN (${placeholders})`);
                queryParams.push(...filters.client_ids);
                paramIndex += filters.client_ids.length;
            }

            if (filters.search && filters.search.trim()) {
                const searchConditions = [
                    `COALESCE(c.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(bk.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(ct.name, '') ILIKE $${paramIndex}`,
                    `COALESCE(tr.remark, '') ILIKE $${paramIndex}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                queryParams.push(`%${filters.search.trim()}%`);
                paramIndex++;
            }
        }

        // Add WHERE clause
        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        // Add ordering
        query += ` ORDER BY tr.create_date DESC, tr.create_time DESC`;

        const result = await pool.query<TransactionRecord>(query, queryParams);
        
        // Convert to export format
        return result.rows.map(row => ({
            id: row.id,
            transaction_type: getTransactionTypeStr(row.transaction_type),
            client_name: row.client_name,
            bank_name: row.bank_name || null,
            card_name: row.card_name || null,
            transaction_amount: row.transaction_amount,
            widthdraw_charges: row.widthdraw_charges,
            remark: row.remark,
            create_date: row.create_date || null,
            create_time: row.create_time || null
        }));
    }

    /**
     * Validate report request
     */
    static validateReportRequest(data: ReportRequestBody): string[] {
        const errors: string[] = [];

        if (!data.startDate) {
            errors.push('Required field "startDate" is missing');
        }

        if (!data.endDate) {
            errors.push('Required field "endDate" is missing');
        }

        // Validate date format if provided
        if (data.startDate && isNaN(Date.parse(data.startDate))) {
            errors.push('Invalid startDate format');
        }

        if (data.endDate && isNaN(Date.parse(data.endDate))) {
            errors.push('Invalid endDate format');
        }

        // Validate format if provided
        if (data.format) {
            const validFormats = ['PDF', 'Excel', 'JSON', 'CSV'];
            if (!validFormats.includes(data.format)) {
                errors.push(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
            }
        }

        // Validate clientId if provided
        if (data.clientId !== undefined && data.clientId !== null) {
            const clientIdNum = parseInt(data.clientId as string, 10);
            if (isNaN(clientIdNum) || clientIdNum <= 0) {
                errors.push('Invalid clientId - must be a positive number');
            }
        }

        // Validate fields if provided
        if (data.fields && data.fields.length > 0) {
            const validFields = [
                'id', 'transaction_type', 'client_name', 'bank_name', 'card_name',
                'transaction_amount', 'widthdraw_charges', 'remark', 'create_date', 'create_time'
            ];
            const invalidFields = data.fields.filter(field => !validFields.includes(field));
            if (invalidFields.length > 0) {
                errors.push(`Invalid fields: ${invalidFields.join(', ')}. Valid fields are: ${validFields.join(', ')}`);
            }
        }

        return errors;
    }
}
import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService.js';
import { TransactionInput, TransactionUpdateInput, DeleteTransactionInput, GetTransactionsInput } from '../types/transaction.js';
import { 
    ReportRequestBody, 
    TransactionRecord, 
    GroupedData, 
    ReportData,
    TransactionReportData 
} from '../types/transaction.js';
import { createSuccessResponse, RESPONSE_MESSAGES, SUCCESS_CODES } from '../../common/utils/responseFormat.js';
import { ValidationError, PDFGenerationError, asyncHandler } from '../../common/errors/index.js';
import { 
    formatAmount, 
    formatDate, 
    formatTime, 
    getTransactionTypeStr, 
    isTransactionTypeDeposit, 
    isTransactionTypeWidthdraw 
} from '../../utils/helper.js';
import TransactionReportPDF from '../pdf-template/transactionReportPDF.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger.js';

/**
 * Controller for transaction operations
 */
export class TransactionController {
    /**
     * GET all transactions with client, bank, and card details (Legacy - without pagination)
     */
    static getAllTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const transactions = await TransactionService.getAllTransactions();
        const response = createSuccessResponse(
            transactions,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            RESPONSE_MESSAGES.TRANSACTION_RETRIEVED
        );
        res.status(200).json(response);
    });

    /**
     * GET paginated transactions with filters, search, and sort
     */
    static getPaginatedTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page,
            limit,
            transaction_type,
            min_amount,
            max_amount,
            start_date,
            end_date,
            bank_ids,
            card_ids,
            client_ids,
            search,
            sort_by,
            sort_order
        } = req.query;

        // Parse and validate query parameters
        const params: GetTransactionsInput = {};

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

        // Filter parameters
        if (transaction_type !== undefined) {
            const parsedType = parseInt(transaction_type as string);
            if (isNaN(parsedType) || (parsedType !== 1 && parsedType !== 0)) {
                throw new ValidationError('Transaction type must be 1 (Deposit) or 0 (Withdraw)', {
                    field: 'transaction_type',
                    value: transaction_type,
                    expected: '1 or 0'
                });
            }
            params.transaction_type = parsedType;
        }

        if (min_amount !== undefined) {
            const parsedAmount = parseFloat(min_amount as string);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                throw new ValidationError('Minimum amount must be a non-negative number', {
                    field: 'min_amount',
                    value: min_amount,
                    expected: 'non-negative number'
                });
            }
            params.min_amount = parsedAmount;
        }

        if (max_amount !== undefined) {
            const parsedAmount = parseFloat(max_amount as string);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                throw new ValidationError('Maximum amount must be a non-negative number', {
                    field: 'max_amount',
                    value: max_amount,
                    expected: 'non-negative number'
                });
            }
            params.max_amount = parsedAmount;
        }

        // Validate amount range
        if (params.min_amount !== undefined && params.max_amount !== undefined && params.min_amount > params.max_amount) {
            throw new ValidationError('Minimum amount cannot be greater than maximum amount', {
                field: 'amount_range',
                value: `min: ${params.min_amount}, max: ${params.max_amount}`
            });
        }

        // Date filters
        if (start_date !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_date as string)) {
                throw new ValidationError('Start date must be in YYYY-MM-DD format', {
                    field: 'start_date',
                    value: start_date,
                    expected: 'YYYY-MM-DD format'
                });
            }
            params.start_date = start_date as string;
        }

        if (end_date !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(end_date as string)) {
                throw new ValidationError('End date must be in YYYY-MM-DD format', {
                    field: 'end_date',
                    value: end_date,
                    expected: 'YYYY-MM-DD format'
                });
            }
            params.end_date = end_date as string;
        }

        // ID array filters
        if (bank_ids !== undefined) {
            try {
                const ids = Array.isArray(bank_ids) ? bank_ids : [bank_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid bank ID');
                    return parsed;
                });
                params.bank_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Bank IDs must be valid integers', {
                    field: 'bank_ids',
                    value: bank_ids,
                    expected: 'array of integers'
                });
            }
        }

        if (card_ids !== undefined) {
            try {
                const ids = Array.isArray(card_ids) ? card_ids : [card_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid card ID');
                    return parsed;
                });
                params.card_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Card IDs must be valid integers', {
                    field: 'card_ids',
                    value: card_ids,
                    expected: 'array of integers'
                });
            }
        }

        if (client_ids !== undefined) {
            try {
                const ids = Array.isArray(client_ids) ? client_ids : [client_ids];
                const parsedIds = ids.map(id => {
                    const parsed = parseInt(id as string);
                    if (isNaN(parsed)) throw new Error('Invalid client ID');
                    return parsed;
                });
                params.client_ids = parsedIds;
            } catch (error) {
                throw new ValidationError('Client IDs must be valid integers', {
                    field: 'client_ids',
                    value: client_ids,
                    expected: 'array of integers'
                });
            }
        }

        // Search parameter
        if (search !== undefined) {
            params.search = (search as string).trim();
        }

        // Sort parameters
        if (sort_by !== undefined) {
            const validSortFields = ['create_date', 'transaction_amount', 'client_name', 'bank_name', 'card_name'];
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

        const result = await TransactionService.getPaginatedTransactions(params);
        const response = createSuccessResponse(
            result,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            'Paginated transactions retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * GET transaction by ID
     */
    static getTransactionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id || '');

        if (isNaN(id)) {
            throw new ValidationError('Invalid transaction ID', {
                field: 'id',
                value: req.params.id,
                expected: 'number'
            });
        }

        const transaction = await TransactionService.getTransactionById(id);

        if (!transaction) {
            throw new ValidationError('Transaction not found', {
                field: 'id',
                value: id
            });
        }

        const response = createSuccessResponse(
            transaction,
            200,
            SUCCESS_CODES.TRANSACTIONS_RETRIEVED,
            'Transaction retrieved successfully'
        );
        res.status(200).json(response);
    });

    /**
     * POST create a new transaction
     */
    static createTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: TransactionInput = req.body;

        // Validate required fields
        if (!data.client_id || typeof data.client_id !== 'number') {
            throw new ValidationError('Client ID is required and must be a number', {
                field: 'client_id',
                value: data.client_id,
                expected: 'number'
            });
        }

        if (data.transaction_amount === undefined || typeof data.transaction_amount !== 'number') {
            throw new ValidationError('Transaction amount is required and must be a number', {
                field: 'transaction_amount',
                value: data.transaction_amount,
                expected: 'number'
            });
        }

        if (data.transaction_type === undefined || typeof data.transaction_type !== 'number') {
            throw new ValidationError('Transaction type is required and must be a number', {
                field: 'transaction_type',
                value: data.transaction_type,
                expected: 'number'
            });
        }

        if (data.widthdraw_charges === undefined || typeof data.widthdraw_charges !== 'number') {
            throw new ValidationError('Withdraw charges is required and must be a number', {
                field: 'widthdraw_charges',
                value: data.widthdraw_charges,
                expected: 'number'
            });
        }

        // Validate business rules
        if (data.widthdraw_charges < 0 || data.widthdraw_charges > 100) {
            throw new ValidationError('Withdraw charges must be between 0 and 100', {
                field: 'widthdraw_charges',
                value: data.widthdraw_charges,
                expected: 'number between 0 and 100'
            });
        }

        if (data.transaction_amount <= 0) {
            throw new ValidationError('Transaction amount must be greater than 0', {
                field: 'transaction_amount',
                value: data.transaction_amount,
                expected: 'positive number'
            });
        }

        // Validate optional fields
        if (data.bank_id !== undefined && (typeof data.bank_id !== 'number' || isNaN(data.bank_id))) {
            throw new ValidationError('Bank ID must be a valid number', {
                field: 'bank_id',
                value: data.bank_id,
                expected: 'number'
            });
        }

        if (data.card_id !== undefined && (typeof data.card_id !== 'number' || isNaN(data.card_id))) {
            throw new ValidationError('Card ID must be a valid number', {
                field: 'card_id',
                value: data.card_id,
                expected: 'number'
            });
        }

        const transaction = await TransactionService.createTransaction({
            client_id: data.client_id,
            transaction_type: data.transaction_type,
            widthdraw_charges: data.widthdraw_charges,
            transaction_amount: data.transaction_amount,
            bank_id: data.bank_id || null,
            card_id: data.card_id || null,
            remark: data.remark || ''
        });

        const response = createSuccessResponse(
            transaction,
            201,
            SUCCESS_CODES.TRANSACTION_CREATED,
            RESPONSE_MESSAGES.TRANSACTION_CREATED
        );
        res.status(201).json(response);
    });

    /**
     * PUT update an existing transaction
     */
    static updateTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: TransactionUpdateInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        // Validate optional fields when provided
        if (data.client_id !== undefined && (typeof data.client_id !== 'number' || isNaN(data.client_id))) {
            throw new ValidationError('Client ID must be a valid number', {
                field: 'client_id',
                value: data.client_id,
                expected: 'number'
            });
        }

        if (data.transaction_type !== undefined && (typeof data.transaction_type !== 'number' || isNaN(data.transaction_type))) {
            throw new ValidationError('Transaction type must be a valid number', {
                field: 'transaction_type',
                value: data.transaction_type,
                expected: 'number'
            });
        }

        if (data.widthdraw_charges !== undefined) {
            if (typeof data.widthdraw_charges !== 'number' || isNaN(data.widthdraw_charges)) {
                throw new ValidationError('Withdraw charges must be a valid number', {
                    field: 'widthdraw_charges',
                    value: data.widthdraw_charges,
                    expected: 'number'
                });
            }
            if (data.widthdraw_charges < 0 || data.widthdraw_charges > 100) {
                throw new ValidationError('Withdraw charges must be between 0 and 100', {
                    field: 'widthdraw_charges',
                    value: data.widthdraw_charges,
                    expected: 'number between 0 and 100'
                });
            }
        }

        if (data.transaction_amount !== undefined) {
            if (typeof data.transaction_amount !== 'number' || isNaN(data.transaction_amount)) {
                throw new ValidationError('Transaction amount must be a valid number', {
                    field: 'transaction_amount',
                    value: data.transaction_amount,
                    expected: 'number'
                });
            }
            if (data.transaction_amount <= 0) {
                throw new ValidationError('Transaction amount must be greater than 0', {
                    field: 'transaction_amount',
                    value: data.transaction_amount,
                    expected: 'positive number'
                });
            }
        }

        if (data.bank_id !== undefined && data.bank_id !== null && (typeof data.bank_id !== 'number' || isNaN(data.bank_id))) {
            throw new ValidationError('Bank ID must be a valid number', {
                field: 'bank_id',
                value: data.bank_id,
                expected: 'number'
            });
        }

        if (data.card_id !== undefined && data.card_id !== null && (typeof data.card_id !== 'number' || isNaN(data.card_id))) {
            throw new ValidationError('Card ID must be a valid number', {
                field: 'card_id',
                value: data.card_id,
                expected: 'number'
            });
        }

        // Check if at least one field to update is provided
        const hasUpdates = [
            'client_id', 'transaction_type', 'widthdraw_charges',
            'transaction_amount', 'bank_id', 'card_id', 'remark'
        ].some(field => data[field as keyof TransactionUpdateInput] !== undefined);

        if (!hasUpdates) {
            throw new ValidationError('No fields to update', {
                message: 'At least one field must be provided for update'
            });
        }

        const transaction = await TransactionService.updateTransaction(data);

        const response = createSuccessResponse(
            transaction,
            200,
            SUCCESS_CODES.TRANSACTION_UPDATED,
            RESPONSE_MESSAGES.TRANSACTION_UPDATED
        );
        res.status(200).json(response);
    });

    /**
     * DELETE a transaction
     */
    static deleteTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: DeleteTransactionInput = req.body;

        // Validation
        if (!data.id || typeof data.id !== 'number') {
            throw new ValidationError('ID is required and must be a number', {
                field: 'id',
                value: data.id,
                expected: 'number'
            });
        }

        await TransactionService.deleteTransaction(data.id);

        const response = createSuccessResponse(
            { id: data.id },
            200,
            SUCCESS_CODES.TRANSACTION_DELETED,
            RESPONSE_MESSAGES.TRANSACTION_DELETED
        );
        res.status(200).json(response);
    });

    /**
     * POST generate transaction report (PDF)
     */
    static generateReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const requestData: ReportRequestBody = req.body;
        const { clientId, startDate, endDate } = requestData;
        const isClientSpecific = clientId !== undefined && clientId !== null;

        // Validate required fields
        if (!startDate || !endDate) {
            throw new ValidationError('Start date and end date are required', {
                field: 'dates',
                value: { startDate, endDate },
                expected: 'Both startDate and endDate required'
            });
        }

        // Get transactions data
        const transactions = await TransactionService.getTransactionsForReport(
            startDate,
            endDate,
            clientId
        );

        if (transactions.length === 0) {
            throw new ValidationError(
                'No transactions found for the specified criteria'
            );
        }

        let isOnlyWithdraw = true;

        // Group data by client and adjust to the required format
        const groupedData: { [clientName: string]: GroupedData } = transactions.reduce(
            (acc: { [clientName: string]: GroupedData }, row: TransactionRecord) => {
                if (!acc[row.client_name]) {
                    acc[row.client_name] = {
                        total: {
                            final_amount: "0",
                            transaction_amount: "0",
                            widthdraw_charges: "0",
                        },
                        data: [],
                        clientInfo: {
                            name: row.client_name,
                            email: row.client_email || null,
                            contact: row.client_contact || null,
                            address: row.client_address || null
                        }
                    };
                }

                const clientData = acc[row.client_name]!;
                const widthdraw_charges = (row.transaction_amount * row.widthdraw_charges) / 100;

                // Add transaction data to 'data' array
                const transactionData: TransactionReportData = {
                    transaction_type: getTransactionTypeStr(row.transaction_type),
                    transaction_amount: `Rs. ${formatAmount(row.transaction_amount.toString())}/-`,
                    widthdraw_charges: `Rs. ${formatAmount(widthdraw_charges.toString())}/-`,
                    widthdraw_charges_pr: `${row.widthdraw_charges.toString()}%`,
                    date: row.create_date ? formatDate(row.create_date) : '-',
                    time: row.create_time ? formatTime(row.create_time) : '-',
                    is_widthdraw_transaction: isTransactionTypeWidthdraw(row.transaction_type),
                    bank_name: row.bank_name || '',
                    card_name: row.card_name || '',
                };

                clientData.data.push(transactionData);

                // Update totals
                if (isTransactionTypeDeposit(row.transaction_type)) {
                    isOnlyWithdraw = false;
                    clientData.total.transaction_amount = (
                        parseFloat(clientData.total.transaction_amount) + row.transaction_amount
                    ).toString();
                } else {
                    clientData.total.transaction_amount = (
                        parseFloat(clientData.total.transaction_amount) - row.transaction_amount
                    ).toString();
                }

                clientData.total.widthdraw_charges = (
                    parseFloat(clientData.total.widthdraw_charges) + widthdraw_charges
                ).toString();

                clientData.total.final_amount = (
                    parseFloat(clientData.total.transaction_amount) + 
                    parseFloat(clientData.total.widthdraw_charges)
                ).toString();

                return acc;
            }, 
            {}
        );

        // Helper functions for amount formatting
        const transactionAmountWithSign = (amount: string): string => {
            let num = parseFloat(amount.toString());
            if (isOnlyWithdraw) {
                num = 0;
            }
            return `Rs. ${formatAmount(Math.abs(num).toString())}/-`;
        };

        const finalAmountWithSign = (amount: string, widthdraw_charges: string): string => {
            let num = parseFloat(amount.toString());
            if (isOnlyWithdraw) {
                return `Rs. ${formatAmount(widthdraw_charges)}/-`;
            } else {
                return `Rs. ${formatAmount(Math.abs(num).toString())}/-`;
            }
        };

        // Format the totals as currency
        Object.keys(groupedData).forEach(clientName => {
            const clientData = groupedData[clientName]!;
            clientData.total.widthdraw_charges = `Rs. ${formatAmount(clientData.total.widthdraw_charges)}/-`;
            clientData.total.final_amount = finalAmountWithSign(
                clientData.total.final_amount, 
                clientData.total.widthdraw_charges
            );
            clientData.total.transaction_amount = transactionAmountWithSign(
                clientData.total.transaction_amount
            );
        });

        // Prepare the report data object
        const reportData: ReportData = {
            isClientSpecific,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            groupedData,
            columns: ['transaction_type', 'transaction_amount', 'widthdraw_charges', 'bank_name', 'card_name', 'date_and_time'],
        };

        try {
            // Create PDF generator instance
            const reportGenerator = new TransactionReportPDF();

            // Format dates for filename
            const formattedStartDate = startDate.split('-').reverse().join(''); // Convert YYYY-MM-DD to DDMMYYYY
            const formattedEndDate = endDate.split('-').reverse().join(''); // Convert YYYY-MM-DD to DDMMYYYY
            
            // Get current date time in Indian timezone (IST - UTC+5:30)
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
            const istTime = new Date(now.getTime() + istOffset);
            const day = String(istTime.getUTCDate()).padStart(2, '0');
            const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
            const year = istTime.getUTCFullYear();
            const hours = String(istTime.getUTCHours()).padStart(2, '0');
            const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
            const createdDateTime = `${day}${month}${year}_${hours}-${minutes}-${seconds}`;

            // Generate temporary file path with client name if client-specific
            let tempFileName: string;
            if (isClientSpecific && transactions && transactions.length > 0) {
                // Get client name and sanitize it for file system
                const clientName = transactions[0]!!.client_name
                    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '_') // Replace spaces with underscores
                    .trim();
                tempFileName = `${clientName}_transaction_report_${formattedStartDate}_to_${formattedEndDate}_${createdDateTime}.pdf`;
            } else {
                tempFileName = `transaction_report_${formattedStartDate}_to_${formattedEndDate}_${createdDateTime}.pdf`;
            }
            const tempDir = path.join(process.cwd(), 'temp');
            const tempFilePath = path.join(tempDir, tempFileName);

            // Ensure temp directory exists
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Generate PDF file
            await reportGenerator.generatePDF(reportData, tempFilePath);

            // Read the generated PDF file
            const pdfBuffer = fs.readFileSync(tempFilePath);

            // Convert to base64
            const bodyBufferBase64 = pdfBuffer.toString('base64');

            // Clean up temporary file
            fs.unlinkSync(tempFilePath);

            // Return success response with PDF content
            const response = createSuccessResponse(
                { 
                    pdfContent: bodyBufferBase64,
                    filename: tempFileName
                },
                200,
                SUCCESS_CODES.REPORT_GENERATED_SUCCESS,
                'Transaction report generated successfully'
            );
            res.status(200).json(response);

        } catch (pdfError) {
            logger.error('Error generating PDF:', pdfError);
            throw new PDFGenerationError(
                'Failed to generate PDF report',
                pdfError
            );
        }
    });


}
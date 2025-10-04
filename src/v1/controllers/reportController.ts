import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { ExportService } from '../services/exportService';
import { createSuccessResponse, SUCCESS_CODES, RESPONSE_MESSAGES } from '../../common/utils/responseFormat';
import { ValidationError, asyncHandler, PDFGenerationError } from '../../common/errors/index';
import { 
    ReportRequestBody, 
    TransactionRecord, 
    GroupedData, 
    ReportData,
    TransactionReportData 
} from '../types/report';
import { 
    formatAmount, 
    formatDate, 
    formatTime, 
    getTransactionTypeStr, 
    isTransactionTypeDeposit, 
    isTransactionTypeWidthdraw 
} from '../../utils/helper';
import TransactionReportPDF from '../pdf-template/transactionReportPDF';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

export class ReportController {
    /**
     * Generate report in multiple formats (PDF, Excel, JSON, CSV)
     * POST /api/v1/reports/generate
     */
    static generateReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const requestData: ReportRequestBody = req.body;

        // Validate request data
        const validationErrors = ReportService.validateReportRequest(requestData);
        if (validationErrors.length > 0) {
            throw new ValidationError(
                'Validation failed',
                validationErrors
            );
        }

        const { format = 'PDF', fields } = requestData;

        try {
            // Check if this is a legacy PDF-only request or new multi-format request
            if (format === 'PDF' && !requestData.filters && !requestData.fields) {
                // Legacy PDF generation path
                await ReportController.generateLegacyPDFReport(req, res);
                return;
            }

            // New multi-format export path
            logger.info('Starting multi-format report generation', { 
                format, 
                hasFilters: !!requestData.filters,
                fieldCount: fields?.length || 0
            });

            // Get transactions data using new export method
            const transactions = await ReportService.getTransactionsForExport(requestData);

            if (transactions.length === 0) {
                throw new ValidationError(
                    'No transactions found for the specified criteria'
                );
            }

            // Generate export using ExportService
            const exportResult = await ExportService.exportData(
                transactions,
                format,
                requestData.filters || {},
                fields
            );

            // Return success response
            const response = createSuccessResponse(
                exportResult,
                200,
                SUCCESS_CODES.REPORT_GENERATED_SUCCESS,
                `${format} report generated successfully`
            );
            res.status(200).json(response);

        } catch (error) {
            logger.error('Error generating report:', error);
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new PDFGenerationError(
                'Failed to generate report',
                error
            );
        }
    });

    /**
     * Legacy PDF report generation (for backwards compatibility)
     */
    private static async generateLegacyPDFReport(req: Request, res: Response): Promise<void> {
        const requestData: ReportRequestBody = req.body;
        const { clientId, startDate, endDate } = requestData;
        const isClientSpecific = clientId !== undefined && clientId !== null;

        // Get transactions data
        const transactions = await ReportService.getTransactionsForReport(
            startDate!,
            endDate!,
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
                        data: []
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
            startDate: formatDate(startDate!),
            endDate: formatDate(endDate!),
            groupedData,
            columns: ['transaction_type', 'transaction_amount', 'widthdraw_charges', 'bank_name', 'card_name', 'date_and_time'],
        };

        try {
            // Create PDF generator instance
            const reportGenerator = new TransactionReportPDF();

            // Generate temporary file path
            const tempFileName = `transaction_report_${Date.now()}.pdf`;
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
                { pdfContent: bodyBufferBase64 },
                200,
                SUCCESS_CODES.REPORT_GENERATED_SUCCESS,
                RESPONSE_MESSAGES.REPORT_GENERATED
            );
            res.status(200).json(response);

        } catch (pdfError) {
            logger.error('Error generating PDF:', pdfError);
            throw new PDFGenerationError(
                'Failed to generate PDF report',
                pdfError
            );
        }
    }
}
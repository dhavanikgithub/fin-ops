import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';
import { TransactionExportRecord, ReportResponse } from '../types/report';
import { formatAmount, formatDate, formatTime, getTransactionTypeStr } from '../../utils/helper';
import TransactionReportPDF from '../pdf-template/transactionReportPDF';
import { ReportData, GroupedData, TransactionReportData } from '../types/report';

export class ExportService {
    /**
     * Export data in the specified format
     */
    static async exportData(
        transactions: TransactionExportRecord[],
        format: string,
        filters: any = {},
        customFields?: string[]
    ): Promise<ReportResponse> {
        logger.info('Starting export', { format, recordCount: transactions.length });

        const timestamp = new Date().toISOString();
        const filename = `transaction_export_${Date.now()}`;

        switch (format.toUpperCase()) {
            case 'CSV':
                return this.exportCSV(transactions, filename, filters, customFields);
            case 'EXCEL':
                return this.exportExcel(transactions, filename, filters, customFields);
            case 'JSON':
                return this.exportJSON(transactions, filename, filters, customFields);
            case 'PDF':
                return this.exportPDF(transactions, filename, filters);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export as CSV
     */
    private static async exportCSV(
        transactions: TransactionExportRecord[],
        filename: string,
        filters: any,
        customFields?: string[]
    ): Promise<ReportResponse> {
        const selectedFields = customFields || [
            'id', 'transaction_type', 'client_name', 'bank_name', 'card_name',
            'transaction_amount', 'widthdraw_charges', 'remark', 'create_date', 'create_time'
        ];

        // Create header row
        const headers = selectedFields.map(field => this.getFieldDisplayName(field));
        let csvContent = headers.join(',') + '\\n';

        // Add data rows
        transactions.forEach(transaction => {
            const row = selectedFields.map(field => {
                let value = this.getFieldValue(transaction, field);
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('\"') || value.includes('\\n'))) {
                    value = '\"' + value.replace(/\"/g, '\"\"') + '\"';
                }
                return value;
            });
            csvContent += row.join(',') + '\\n';
        });

        const contentBuffer = Buffer.from(csvContent, 'utf8');

        return {
            content: contentBuffer.toString('base64'),
            filename: `${filename}.csv`,
            mimeType: 'text/csv',
            format: 'CSV',
            metadata: {
                total_rows: transactions.length,
                file_size_bytes: contentBuffer.length,
                generated_at: new Date().toISOString(),
                filters_applied: filters
            }
        };
    }

    /**
     * Export as Excel
     */
    private static async exportExcel(
        transactions: TransactionExportRecord[],
        filename: string,
        filters: any,
        customFields?: string[]
    ): Promise<ReportResponse> {
        const selectedFields = customFields || [
            'id', 'transaction_type', 'client_name', 'bank_name', 'card_name',
            'transaction_amount', 'widthdraw_charges', 'remark', 'create_date', 'create_time'
        ];

        // Prepare data for Excel
        const excelData = transactions.map(transaction => {
            const row: any = {};
            selectedFields.forEach(field => {
                row[this.getFieldDisplayName(field)] = this.getFieldValue(transaction, field);
            });
            return row;
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = selectedFields.map(field => ({
            wch: this.getColumnWidth(field)
        }));
        worksheet['!cols'] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        // Add metadata sheet
        const metadataSheet = XLSX.utils.json_to_sheet([
            { Property: 'Total Rows', Value: transactions.length },
            { Property: 'Generated At', Value: new Date().toISOString() },
            { Property: 'Filters Applied', Value: JSON.stringify(filters) }
        ]);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return {
            content: excelBuffer.toString('base64'),
            filename: `${filename}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            format: 'Excel',
            metadata: {
                total_rows: transactions.length,
                file_size_bytes: excelBuffer.length,
                generated_at: new Date().toISOString(),
                filters_applied: filters
            }
        };
    }

    /**
     * Export as JSON
     */
    private static async exportJSON(
        transactions: TransactionExportRecord[],
        filename: string,
        filters: any,
        customFields?: string[]
    ): Promise<ReportResponse> {
        const selectedFields = customFields || [
            'id', 'transaction_type', 'client_name', 'bank_name', 'card_name',
            'transaction_amount', 'widthdraw_charges', 'remark', 'create_date', 'create_time'
        ];

        // Prepare JSON data
        const jsonData = {
            metadata: {
                total_rows: transactions.length,
                generated_at: new Date().toISOString(),
                filters_applied: filters,
                selected_fields: selectedFields
            },
            transactions: transactions.map(transaction => {
                const record: any = {};
                selectedFields.forEach(field => {
                    record[field] = this.getFieldValue(transaction, field);
                });
                return record;
            })
        };

        const jsonString = JSON.stringify(jsonData, null, 2);
        const contentBuffer = Buffer.from(jsonString, 'utf8');

        return {
            content: contentBuffer.toString('base64'),
            filename: `${filename}.json`,
            mimeType: 'application/json',
            format: 'JSON',
            metadata: {
                total_rows: transactions.length,
                file_size_bytes: contentBuffer.length,
                generated_at: new Date().toISOString(),
                filters_applied: filters
            }
        };
    }

    /**
     * Export as PDF (using existing PDF template)
     */
    private static async exportPDF(
        transactions: TransactionExportRecord[],
        filename: string,
        filters: any
    ): Promise<ReportResponse> {
        // Convert export records to grouped data format for PDF template
        const groupedData: { [clientName: string]: GroupedData } = {};
        let isOnlyWithdraw = true;

        transactions.forEach(transaction => {
            const clientName = transaction.client_name;
            
            if (!groupedData[clientName]) {
                groupedData[clientName] = {
                    total: {
                        final_amount: "0",
                        transaction_amount: "0",
                        widthdraw_charges: "0",
                    },
                    data: []
                };
            }

            const clientData = groupedData[clientName]!;
            const widthdrawChargesAmount = (transaction.transaction_amount * transaction.widthdraw_charges) / 100;

            // Add transaction data
            const transactionData: TransactionReportData = {
                transaction_type: transaction.transaction_type,
                transaction_amount: `Rs. ${formatAmount(transaction.transaction_amount.toString())}/-`,
                widthdraw_charges: `Rs. ${formatAmount(widthdrawChargesAmount.toString())}/-`,
                widthdraw_charges_pr: `${transaction.widthdraw_charges.toString()}%`,
                date: transaction.create_date ? formatDate(transaction.create_date) : '-',
                time: transaction.create_time ? formatTime(transaction.create_time) : '-',
                is_widthdraw_transaction: transaction.transaction_type === 'Withdraw',
                bank_name: transaction.bank_name || '',
                card_name: transaction.card_name || '',
            };

            clientData.data.push(transactionData);

            // Update totals
            if (transaction.transaction_type === 'Deposit') {
                isOnlyWithdraw = false;
                clientData.total.transaction_amount = (
                    parseFloat(clientData.total.transaction_amount) + transaction.transaction_amount
                ).toString();
            } else {
                clientData.total.transaction_amount = (
                    parseFloat(clientData.total.transaction_amount) - transaction.transaction_amount
                ).toString();
            }

            clientData.total.widthdraw_charges = (
                parseFloat(clientData.total.widthdraw_charges) + widthdrawChargesAmount
            ).toString();

            clientData.total.final_amount = (
                parseFloat(clientData.total.transaction_amount) + 
                parseFloat(clientData.total.widthdraw_charges)
            ).toString();
        });

        // Format totals
        Object.keys(groupedData).forEach(clientName => {
            const clientData = groupedData[clientName]!;
            clientData.total.widthdraw_charges = `Rs. ${formatAmount(clientData.total.widthdraw_charges)}/-`;
            
            if (isOnlyWithdraw) {
                clientData.total.final_amount = clientData.total.widthdraw_charges;
                clientData.total.transaction_amount = `Rs. 0/-`;
            } else {
                clientData.total.final_amount = `Rs. ${formatAmount(Math.abs(parseFloat(clientData.total.final_amount)).toString())}/-`;
                clientData.total.transaction_amount = `Rs. ${formatAmount(Math.abs(parseFloat(clientData.total.transaction_amount)).toString())}/-`;
            }
        });

        // Prepare report data
        const reportData: ReportData = {
            isClientSpecific: false,
            startDate: filters.start_date ? formatDate(filters.start_date) : '',
            endDate: filters.end_date ? formatDate(filters.end_date) : '',
            groupedData,
            columns: ['transaction_type', 'transaction_amount', 'widthdraw_charges', 'bank_name', 'card_name', 'date_and_time'],
        };

        // Generate PDF
        const reportGenerator = new TransactionReportPDF();
        const tempFileName = `${filename}.pdf`;
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

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        return {
            content: pdfBuffer.toString('base64'),
            filename: tempFileName,
            mimeType: 'application/pdf',
            format: 'PDF',
            metadata: {
                total_rows: transactions.length,
                file_size_bytes: pdfBuffer.length,
                generated_at: new Date().toISOString(),
                filters_applied: filters
            }
        };
    }

    /**
     * Get field value with proper formatting
     */
    private static getFieldValue(transaction: TransactionExportRecord, field: string): any {
        switch (field) {
            case 'transaction_amount':
                return transaction.transaction_amount;
            case 'widthdraw_charges':
                return transaction.widthdraw_charges;
            case 'create_date':
                return transaction.create_date ? formatDate(transaction.create_date) : '';
            case 'create_time':
                return transaction.create_time ? formatTime(transaction.create_time) : '';
            case 'bank_name':
                return transaction.bank_name || '';
            case 'card_name':
                return transaction.card_name || '';
            default:
                return (transaction as any)[field] || '';
        }
    }

    /**
     * Get display name for field
     */
    private static getFieldDisplayName(field: string): string {
        const fieldNames: Record<string, string> = {
            'id': 'Transaction ID',
            'transaction_type': 'Type',
            'client_name': 'Client Name',
            'bank_name': 'Bank Name',
            'card_name': 'Card Name',
            'transaction_amount': 'Amount',
            'widthdraw_charges': 'Charges (%)',
            'remark': 'Remarks',
            'create_date': 'Date',
            'create_time': 'Time'
        };
        return fieldNames[field] || field;
    }

    /**
     * Get column width for Excel
     */
    private static getColumnWidth(field: string): number {
        const widths: Record<string, number> = {
            'id': 15,
            'transaction_type': 12,
            'client_name': 25,
            'bank_name': 20,
            'card_name': 20,
            'transaction_amount': 15,
            'widthdraw_charges': 12,
            'remark': 30,
            'create_date': 12,
            'create_time': 12
        };
        return widths[field] || 15;
    }
}
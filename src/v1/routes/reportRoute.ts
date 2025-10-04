import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

const router = Router();

/**
 * @swagger
 * /api/v1/reports/generate:
 *   post:
 *     summary: Generate transaction report in multiple formats
 *     description: Generate a report for transactions in PDF, Excel, JSON, or CSV format with advanced filtering options
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: Optional client ID to filter transactions (legacy support)
 *                 example: "1"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for the report (YYYY-MM-DD)
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date for the report (YYYY-MM-DD)
 *                 example: "2024-12-31"
 *               format:
 *                 type: string
 *                 enum: [PDF, Excel, JSON, CSV]
 *                 description: Export format for the report
 *                 default: PDF
 *                 example: "Excel"
 *               fields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional list of fields to include in export (if not provided, all fields are included)
 *                 example: ["transaction_type", "transaction_amount", "client_name", "bank_name", "create_date"]
 *               filters:
 *                 type: object
 *                 description: Advanced filtering options
 *                 properties:
 *                   clientIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Filter by multiple client IDs
 *                     example: ["1", "2", "3"]
 *                   bankIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Filter by multiple bank IDs
 *                     example: ["1", "2"]
 *                   cardIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Filter by multiple card IDs
 *                     example: ["1", "2"]
 *                   transactionTypes:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: Filter by transaction types (1=deposit, 2=withdrawal)
 *                     example: [1, 2]
 *                   amountRange:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                         description: Minimum transaction amount
 *                         example: 100
 *                       max:
 *                         type: number
 *                         description: Maximum transaction amount
 *                         example: 10000
 *           examples:
 *             legacy_pdf:
 *               summary: Legacy PDF report (backwards compatible)
 *               value:
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-12-31"
 *                 clientId: "1"
 *             excel_export:
 *               summary: Excel export with filtering
 *               value:
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-12-31"
 *                 format: "Excel"
 *                 fields: ["transaction_type", "transaction_amount", "client_name", "bank_name", "create_date"]
 *                 filters:
 *                   clientIds: ["1", "2"]
 *                   transactionTypes: [1]
 *                   amountRange:
 *                     min: 1000
 *                     max: 50000
 *             csv_export:
 *               summary: CSV export with all data
 *               value:
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-12-31"
 *                 format: "CSV"
 *             json_export:
 *               summary: JSON export with specific fields
 *               value:
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-12-31"
 *                 format: "JSON"
 *                 fields: ["transaction_type", "transaction_amount", "client_name", "create_date"]
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         pdfContent:
 *                           type: string
 *                           description: Base64 encoded PDF content (legacy)
 *                     - type: object
 *                       properties:
 *                         fileName:
 *                           type: string
 *                           example: "transaction_report_2024-01-01_to_2024-12-31.xlsx"
 *                         content:
 *                           type: string
 *                           description: Base64 encoded file content (Excel/PDF)
 *                         mimeType:
 *                           type: string
 *                           example: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 *                         size:
 *                           type: number
 *                           description: File size in bytes
 *                           example: 15420
 *                     - type: object
 *                       properties:
 *                         fileName:
 *                           type: string
 *                           example: "transaction_report_2024-01-01_to_2024-12-31.json"
 *                         content:
 *                           type: object
 *                           description: JSON data structure
 *                         mimeType:
 *                           type: string
 *                           example: "application/json"
 *                         size:
 *                           type: number
 *                           description: Data size in bytes
 *                           example: 8750
 *                     - type: object
 *                       properties:
 *                         fileName:
 *                           type: string
 *                           example: "transaction_report_2024-01-01_to_2024-12-31.csv"
 *                         content:
 *                           type: string
 *                           description: CSV formatted data
 *                         mimeType:
 *                           type: string
 *                           example: "text/csv"
 *                         size:
 *                           type: number
 *                           description: File size in bytes
 *                           example: 5230
 *                 successCode:
 *                   type: string
 *                   example: "REPORT_GENERATED_SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Excel report generated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_date:
 *                 summary: Missing required date
 *                 value:
 *                   success: false
 *                   error:
 *                     statusCode: 400
 *                     message: "Validation failed"
 *                     errorCode: "VALIDATION_ERROR"
 *                     details: ["Required field \"startDate\" is missing"]
 *                     timestamp: "2024-01-20T10:30:00.000Z"
 *               invalid_format:
 *                 summary: Invalid export format
 *                 value:
 *                   success: false
 *                   error:
 *                     statusCode: 400
 *                     message: "Validation failed"
 *                     errorCode: "VALIDATION_ERROR"
 *                     details: ["Format must be one of: PDF, Excel, JSON, CSV"]
 *                     timestamp: "2024-01-20T10:30:00.000Z"
 *       404:
 *         description: No transactions found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_data:
 *                 summary: No transactions found
 *                 value:
 *                   success: false
 *                   error:
 *                     statusCode: 404
 *                     message: "No transactions found for the specified criteria"
 *                     errorCode: "VALIDATION_ERROR"
 *                     timestamp: "2024-01-20T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate', ReportController.generateReport);

export default router;
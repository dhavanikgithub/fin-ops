/**
 * Example requests and responses for Report API endpoints
 */

export const REPORT_API_EXAMPLES = {
    // Generate Report Examples
    generateReport: {
        // Request examples
        requests: {
            allClients: {
                description: "Generate report for all clients within date range",
                body: {
                    startDate: "2024-01-01",
                    endDate: "2024-12-31"
                }
            },
            specificClient: {
                description: "Generate report for specific client within date range",
                body: {
                    clientId: "1",
                    startDate: "2024-01-01", 
                    endDate: "2024-12-31"
                }
            }
        },

        // Response examples
        responses: {
            success: {
                description: "Successful report generation",
                statusCode: 200,
                body: {
                    success: true,
                    data: {
                        pdfContent: "JVBERi0xLjQKJcOkw7zDscO..." // Base64 encoded PDF content (truncated)
                    },
                    successCode: "REPORT_GENERATED_SUCCESS",
                    message: "Transaction report generated successfully",
                    timestamp: "2024-01-20T10:30:00.000Z",
                    statusCode: 200
                }
            },
            validationError: {
                description: "Validation error - missing required fields",
                statusCode: 400,
                body: {
                    success: false,
                    error: {
                        statusCode: 400,
                        message: "Validation failed",
                        errorCode: "VALIDATION_ERROR",
                        details: [
                            "Required field \"startDate\" is missing",
                            "Required field \"endDate\" is missing"
                        ],
                        timestamp: "2024-01-20T10:30:00.000Z"
                    }
                }
            },
            invalidDate: {
                description: "Validation error - invalid date format",
                statusCode: 400,
                body: {
                    success: false,
                    error: {
                        statusCode: 400,
                        message: "Validation failed",
                        errorCode: "VALIDATION_ERROR",
                        details: [
                            "Invalid startDate format",
                            "Invalid clientId - must be a positive number"
                        ],
                        timestamp: "2024-01-20T10:30:00.000Z"
                    }
                }
            },
            noDataFound: {
                description: "No transactions found for the criteria",
                statusCode: 404,
                body: {
                    success: false,
                    error: {
                        statusCode: 404,
                        message: "No transactions found for the specified criteria",
                        errorCode: "VALIDATION_ERROR",
                        timestamp: "2024-01-20T10:30:00.000Z"
                    }
                }
            },
            pdfGenerationError: {
                description: "PDF generation failed",
                statusCode: 500,
                body: {
                    success: false,
                    error: {
                        statusCode: 500,
                        message: "Failed to generate PDF report",
                        errorCode: "PDF_GENERATION_ERROR",
                        timestamp: "2024-01-20T10:30:00.000Z"
                    }
                }
            }
        }
    }
} as const;

/**
 * Usage Instructions:
 * 
 * 1. Generate Report for All Clients:
 *    POST /api/v1/reports/generate
 *    Content-Type: application/json
 *    Body: {
 *      "startDate": "2024-01-01",
 *      "endDate": "2024-12-31"
 *    }
 * 
 * 2. Generate Report for Specific Client:
 *    POST /api/v1/reports/generate
 *    Content-Type: application/json
 *    Body: {
 *      "clientId": "1",
 *      "startDate": "2024-01-01",
 *      "endDate": "2024-12-31"
 *    }
 * 
 * 3. Handle Base64 PDF Response:
 *    - The response contains a base64 encoded PDF in the 'pdfContent' field
 *    - To convert to file: Buffer.from(pdfContent, 'base64')
 *    - To display in browser: data:application/pdf;base64,{pdfContent}
 * 
 * 4. Error Handling:
 *    - All errors follow the standard error response format
 *    - Check the 'success' field to determine if the request was successful
 *    - Error details are provided in the 'error.details' array for validation errors
 */
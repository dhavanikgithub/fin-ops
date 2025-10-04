/**
 * Standard API response format for consistent cross-platform communication
 */

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    successCode: string;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedResponse<T = any> extends SuccessResponse<T> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Creates a standardized success response
 */
export const createSuccessResponse = <T = any>(
    data: T,
    statusCode: number = 200,
    successCode: string = 'OPERATION_SUCCESS',
    message?: string
): SuccessResponse<T> => {
    const response: SuccessResponse<T> = {
        success: true,
        data,
        successCode,
        timestamp: new Date().toISOString(),
        statusCode
    };

    if (message) {
        response.message = message;
    }

    return response;
};

/**
 * Creates a standardized paginated response
 */
export const createPaginatedResponse = <T = any>(
    data: T,
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    },
    statusCode: number = 200,
    successCode: string = 'DATA_RETRIEVED',
    message?: string
): PaginatedResponse<T> => {
    const response: PaginatedResponse<T> = {
        success: true,
        data,
        successCode,
        timestamp: new Date().toISOString(),
        statusCode,
        pagination
    };

    if (message) {
        response.message = message;
    }

    return response;
};

/**
 * Standard success codes
 */
export const SUCCESS_CODES = {
    // Generic operations
    OPERATION_SUCCESS: 'OPERATION_SUCCESS',
    DATA_RETRIEVED: 'DATA_RETRIEVED',
    RESOURCE_CREATED: 'RESOURCE_CREATED',
    RESOURCE_UPDATED: 'RESOURCE_UPDATED',
    RESOURCE_DELETED: 'RESOURCE_DELETED',

    // Bank specific
    BANKS_RETRIEVED: 'BANKS_RETRIEVED',
    BANK_CREATED: 'BANK_CREATED',
    BANK_UPDATED: 'BANK_UPDATED',
    BANK_DELETED: 'BANK_DELETED',

    // Card specific
    CARDS_RETRIEVED: 'CARDS_RETRIEVED',
    CARD_CREATED: 'CARD_CREATED',
    CARD_UPDATED: 'CARD_UPDATED',
    CARD_DELETED: 'CARD_DELETED',

    // Client specific
    CLIENTS_RETRIEVED: 'CLIENTS_RETRIEVED',
    CLIENT_CREATED: 'CLIENT_CREATED',
    CLIENT_UPDATED: 'CLIENT_UPDATED',
    CLIENT_DELETED: 'CLIENT_DELETED',

    // Transaction specific
    TRANSACTIONS_RETRIEVED: 'TRANSACTIONS_RETRIEVED',
    TRANSACTION_CREATED: 'TRANSACTION_CREATED',
    TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
    TRANSACTION_DELETED: 'TRANSACTION_DELETED',

    // Report specific
    REPORT_GENERATED_SUCCESS: 'REPORT_GENERATED_SUCCESS',

} as const;

/**
 * Standard response messages
 */
export const RESPONSE_MESSAGES = {
    // Generic
    SUCCESS: 'Operation completed successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',

    // Bank specific
    BANK_RETRIEVED: 'Banks retrieved successfully',
    BANK_CREATED: 'Bank created successfully',
    BANK_UPDATED: 'Bank updated successfully',
    BANK_DELETED: 'Bank deleted successfully',

    // Card specific
    CARD_RETRIEVED: 'Cards retrieved successfully',
    CARD_CREATED: 'Card created successfully',
    CARD_UPDATED: 'Card updated successfully',
    CARD_DELETED: 'Card deleted successfully',

    // Client specific
    CLIENT_RETRIEVED: 'Clients retrieved successfully',
    CLIENT_CREATED: 'Client created successfully',
    CLIENT_UPDATED: 'Client updated successfully',
    CLIENT_DELETED: 'Client deleted successfully',

    // Transaction specific
    TRANSACTION_RETRIEVED: 'Transactions retrieved successfully',
    TRANSACTION_CREATED: 'Transaction created successfully',
    TRANSACTION_UPDATED: 'Transaction updated successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully',

    // Report specific
    REPORT_GENERATED: 'Transaction report generated successfully',

} as const;
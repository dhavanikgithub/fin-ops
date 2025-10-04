/**
 * Response format examples for the Transaction API
 * This file demonstrates the consistent response structure across all endpoints
 */

// Success Response Examples
export const TRANSACTION_RESPONSE_EXAMPLES = {
    // GET /api/v1/transactions - Success
    GET_TRANSACTIONS_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "transaction_type": 1,
                "client_id": 1,
                "widthdraw_charges": 5,
                "transaction_amount": 1000,
                "client_name": "John Doe",
                "bank_name": "Chase Bank",
                "card_name": "Credit Card",
                "bank_id": 1,
                "card_id": 1,
                "remark": "Monthly deposit",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null
            },
            {
                "id": 2,
                "transaction_type": 2,
                "client_id": 2,
                "widthdraw_charges": 10,
                "transaction_amount": 500,
                "client_name": "Jane Smith",
                "bank_name": "Wells Fargo",
                "card_name": null,
                "bank_id": 2,
                "card_id": null,
                "remark": "ATM withdrawal",
                "create_date": "2024-01-02T00:00:00.000Z",
                "create_time": "14:45:00",
                "modify_date": "2024-01-15T00:00:00.000Z",
                "modify_time": "09:20:00"
            }
        ],
        "successCode": "TRANSACTIONS_RETRIEVED",
        "message": "Transactions retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // GET /api/v1/transactions/:id - Success
    GET_TRANSACTION_BY_ID_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "transaction_type": 1,
            "client_id": 1,
            "widthdraw_charges": 5,
            "transaction_amount": 1000,
            "client_name": "John Doe",
            "bank_name": "Chase Bank",
            "card_name": "Credit Card",
            "bank_id": 1,
            "card_id": 1,
            "remark": "Monthly deposit",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTIONS_RETRIEVED",
        "message": "Transaction retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/transactions - Success
    CREATE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 3,
            "transaction_type": 1,
            "client_id": 3,
            "widthdraw_charges": 2,
            "transaction_amount": 2500,
            "client_name": "Rajesh Kumar",
            "bank_name": "Bank of America",
            "card_name": "Debit Card",
            "bank_id": 3,
            "card_id": 2,
            "remark": "Business deposit",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTION_CREATED",
        "message": "Transaction created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // POST /api/v1/transactions - Success (minimal data)
    CREATE_TRANSACTION_MINIMAL_SUCCESS: {
        "success": true,
        "data": {
            "id": 4,
            "transaction_type": 2,
            "client_id": 4,
            "widthdraw_charges": 0,
            "transaction_amount": 100,
            "client_name": "Anonymous Client",
            "bank_name": null,
            "card_name": null,
            "bank_id": null,
            "card_id": null,
            "remark": "",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTION_CREATED",
        "message": "Transaction created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // PUT /api/v1/transactions - Success
    UPDATE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "transaction_type": 1,
            "client_id": 1,
            "widthdraw_charges": 3,
            "transaction_amount": 1500,
            "client_name": "John Doe",
            "bank_name": "Chase Bank",
            "card_name": "Credit Card",
            "bank_id": 1,
            "card_id": 1,
            "remark": "Updated monthly deposit",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": "2024-10-04T00:00:00.000Z",
            "modify_time": "10:30:00"
        },
        "successCode": "TRANSACTION_UPDATED",
        "message": "Transaction updated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // DELETE /api/v1/transactions - Success
    DELETE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 1
        },
        "successCode": "TRANSACTION_DELETED",
        "message": "Transaction deleted successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    }
};

// Error Response Examples
export const TRANSACTION_ERROR_EXAMPLES = {
    // Validation Error - Missing required field
    VALIDATION_ERROR_MISSING_CLIENT_ID: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Client ID is required and must be a number",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "client_id",
                "value": undefined,
                "expected": "number"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - Invalid withdraw charges
    VALIDATION_ERROR_INVALID_CHARGES: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Withdraw charges must be between 0 and 100",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "widthdraw_charges",
                "value": 150,
                "expected": "number between 0 and 100"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - Invalid transaction amount
    VALIDATION_ERROR_INVALID_AMOUNT: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Transaction amount must be greater than 0",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "transaction_amount",
                "value": -100,
                "expected": "positive number"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - No fields to update
    VALIDATION_ERROR_NO_UPDATES: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "No fields to update",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "message": "At least one field must be provided for update"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "PUT"
        }
    },

    // Not Found Error
    NOT_FOUND_ERROR: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Transaction not found",
            "errorCode": "NOT_FOUND",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "PUT"
        }
    },

    // Database Error
    DATABASE_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to fetch transactions",
            "errorCode": "DATABASE_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "GET"
        }
    }
};
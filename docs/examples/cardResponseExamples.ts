/**
 * Response format examples for the Card API
 * This file demonstrates the consistent response structure across all endpoints
 */

// Success Response Examples
export const CARD_RESPONSE_EXAMPLES = {
    // GET /api/v1/cards - Success
    GET_CARDS_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "name": "Credit Card",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null,
                "transaction_count": 25
            },
            {
                "id": 2,
                "name": "Debit Card",
                "create_date": "2024-01-02T00:00:00.000Z",
                "create_time": "14:45:00",
                "modify_date": "2024-01-15T00:00:00.000Z",
                "modify_time": "09:20:00",
                "transaction_count": 12
            }
        ],
        "successCode": "CARDS_RETRIEVED",
        "message": "Cards retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/cards - Success
    CREATE_CARD_SUCCESS: {
        "success": true,
        "data": {
            "id": 3,
            "name": "Prepaid Card",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null,
            "transaction_count": 0
        },
        "successCode": "CARD_CREATED",
        "message": "Card created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // PUT /api/v1/cards - Success
    UPDATE_CARD_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "name": "Premium Credit Card",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": "2024-10-04T00:00:00.000Z",
            "modify_time": "10:30:00",
            "transaction_count": 25
        },
        "successCode": "CARD_UPDATED",
        "message": "Card updated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // DELETE /api/v1/cards - Success
    DELETE_CARD_SUCCESS: {
        "success": true,
        "data": {
            "id": 1
        },
        "successCode": "CARD_DELETED",
        "message": "Card deleted successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    }
};

// Error Response Examples
export const CARD_ERROR_EXAMPLES = {
    // Validation Error - Missing name
    VALIDATION_ERROR: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Name is required and must be a non-empty string",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "name",
                "value": "",
                "expected": "non-empty string"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/cards",
            "method": "POST"
        }
    },

    // Not Found Error
    NOT_FOUND_ERROR: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Card not found",
            "errorCode": "NOT_FOUND",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/cards",
            "method": "PUT"
        }
    },

    // Database Error
    DATABASE_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to fetch cards",
            "errorCode": "DATABASE_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/cards",
            "method": "GET"
        }
    }
};
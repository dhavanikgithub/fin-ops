/**
 * Response format examples for the Bank API
 * This file demonstrates the consistent response structure across all endpoints
 */

// Success Response Examples
export const RESPONSE_EXAMPLES = {
    // GET /api/v1/banks - Success
    GET_BANKS_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "name": "Chase Bank",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null,
                "transaction_count": 15
            },
            {
                "id": 2,
                "name": "Wells Fargo",
                "create_date": "2024-01-02T00:00:00.000Z",
                "create_time": "14:45:00",
                "modify_date": "2024-01-15T00:00:00.000Z",
                "modify_time": "09:20:00",
                "transaction_count": 8
            }
        ],
        "successCode": "BANKS_RETRIEVED",
        "message": "Banks retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/banks - Success
    CREATE_BANK_SUCCESS: {
        "success": true,
        "data": {
            "id": 3,
            "name": "Bank of America",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null,
            "transaction_count": 0
        },
        "successCode": "BANK_CREATED",
        "message": "Bank created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // PUT /api/v1/banks - Success
    UPDATE_BANK_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "name": "JPMorgan Chase Bank",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": "2024-10-04T00:00:00.000Z",
            "modify_time": "10:30:00",
            "transaction_count": 15
        },
        "successCode": "BANK_UPDATED",
        "message": "Bank updated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // DELETE /api/v1/banks - Success
    DELETE_BANK_SUCCESS: {
        "success": true,
        "data": {
            "id": 1
        },
        "successCode": "BANK_DELETED",
        "message": "Bank deleted successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    }
};

// Error Response Examples
export const ERROR_EXAMPLES = {
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
            "path": "/api/v1/banks",
            "method": "POST"
        }
    },

    // Not Found Error
    NOT_FOUND_ERROR: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Bank not found",
            "errorCode": "NOT_FOUND",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/banks",
            "method": "PUT"
        }
    },

    // Database Error
    DATABASE_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to fetch banks",
            "errorCode": "DATABASE_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/banks",
            "method": "GET"
        }
    },

    // Route Not Found
    ROUTE_NOT_FOUND: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Route /api/v1/invalid-endpoint not found",
            "errorCode": "ROUTE_NOT_FOUND",
            "details": {
                "availableRoutes": [
                    "/api/v1/health",
                    "/api/v2/health"
                ]
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/invalid-endpoint",
            "method": "GET"
        }
    }
};
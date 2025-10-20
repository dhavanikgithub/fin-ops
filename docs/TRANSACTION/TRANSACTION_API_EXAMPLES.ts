/**
 * Example usage of the new paginated transactions API
 * This file demonstrates various use cases for the enhanced API
 */

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=1&limit=50',
  description: 'Get first 50 transactions with default sorting (newest first)'
};

// Example 2: Filter by transaction type and amount range
export const filterExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?transaction_type=1&min_amount=100&max_amount=5000',
  description: 'Get deposit transactions between $100 and $5000'
};

// Example 3: Date range filter
export const dateRangeExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?start_date=2025-01-01&end_date=2025-01-31&page=1',
  description: 'Get transactions from January 2025'
};

// Example 4: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?search=john&sort_by=transaction_amount&sort_order=desc',
  description: 'Search for "john" in client name, bank name, card name, or remark'
};

// Example 5: Multiple bank IDs filter
export const multipleBanksExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?bank_ids=1&bank_ids=2&bank_ids=3',
  description: 'Get transactions from specific banks'
};

// Example 6: Complex filter combination
export const complexFilterExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=2&limit=25&transaction_type=2&min_amount=500&client_ids=1&client_ids=2&search=withdraw&sort_by=create_date&sort_order=desc',
  description: 'Complex filter: page 2, 25 records, withdrawals over $500, specific clients, search "withdraw", sorted by date desc'
};

// Example 7: Sort by client name
export const sortByClientExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?sort_by=client_name&sort_order=asc',
  description: 'Get transactions sorted by client name alphabetically'
};

// Example 8: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};

/**
 * Expected response structure
 */
export const expectedResponseStructure = {
  success: true,
  data: {
    data: [
      {
        id: 1,
        transaction_type: 1,
        client_id: 1,
        widthdraw_charges: 5.00,
        transaction_amount: 1000.00,
        client_name: "John Doe",
        bank_name: "Bank of America",
        card_name: "Visa Card",
        bank_id: 1,
        card_id: 1,
        remark: "Monthly deposit",
        create_date: "2025-01-15T00:00:00.000Z",
        create_time: "14:30:00",
        modify_date: null,
        modify_time: null
      }
      // ... more transactions
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_count: 150,
      total_pages: 3,
      has_next_page: true,
      has_previous_page: false
    },
    filters_applied: {
      transaction_type: 1,
      min_amount: 100
    },
    search_applied: "john",
    sort_applied: {
      sort_by: "create_date",
      sort_order: "desc"
    }
  },
  code: "TRANSACTIONS_RETRIEVED",
  message: "Paginated transactions retrieved successfully"
};

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
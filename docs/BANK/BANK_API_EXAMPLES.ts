/**
 * Example usage of the new paginated banks API
 * This file demonstrates various use cases for the enhanced API
 */

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?page=1&limit=50',
  description: 'Get first 50 banks with default sorting (alphabetical by name)'
};

// Example 2: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?search=america&sort_by=name&sort_order=asc',
  description: 'Search for "america" in bank names'
};

// Example 3: Sort by transaction count
export const sortByTransactionCountExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?sort_by=transaction_count&sort_order=desc',
  description: 'Get banks sorted by transaction count (most active first)'
};

// Example 4: Search with custom pagination
export const searchWithPaginationExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?page=2&limit=25&search=national&sort_by=create_date&sort_order=desc',
  description: 'Search for "national" banks with custom pagination and date sorting'
};

// Example 5: Sort by creation date
export const sortByDateExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?sort_by=create_date&sort_order=desc',
  description: 'Get newest banks first'
};

// Example 6: Search for major banks
export const majorBanksExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?search=bank of&sort_by=transaction_count&sort_order=desc',
  description: 'Search for major banks and sort by activity'
};

// Example 7: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/banks/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};


/**
 * Expected response structure for banks
 */
export const expectedResponseStructure = {
  success: true,
  data: {
    data: [
      {
        id: 1,
        name: "Bank of America",
        create_date: "2025-01-15T00:00:00.000Z",
        create_time: "14:30:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 45
      },
      {
        id: 2,
        name: "JPMorgan Chase",
        create_date: "2025-01-10T00:00:00.000Z",
        create_time: "10:15:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 38
      }
      // ... more banks
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_count: 25,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false
    },
    search_applied: "america",
    sort_applied: {
      sort_by: "name",
      sort_order: "asc"
    }
  },
  code: "BANKS_RETRIEVED",
  message: "Paginated banks retrieved successfully"
};

/**
 * Common search patterns for different banking use cases
 */
export const searchUseCase = {
  // Search by bank brand/type
  majorBanks: '/api/v1/banks/paginated?search=bank of&sort_by=transaction_count&sort_order=desc',
  chase: '/api/v1/banks/paginated?search=chase&sort_by=name',
  wellsFargo: '/api/v1/banks/paginated?search=wells&sort_by=name',
  bankOfAmerica: '/api/v1/banks/paginated?search=america&sort_by=name',
  citibank: '/api/v1/banks/paginated?search=citi&sort_by=name',
  
  // Search by institution type
  creditUnions: '/api/v1/banks/paginated?search=credit union&sort_by=name',
  nationalBanks: '/api/v1/banks/paginated?search=national&sort_by=name',
  regionalBanks: '/api/v1/banks/paginated?search=first&sort_by=name',
  
  // Sort patterns
  mostActive: '/api/v1/banks/paginated?sort_by=transaction_count&sort_order=desc',
  leastActive: '/api/v1/banks/paginated?sort_by=transaction_count&sort_order=asc',
  newest: '/api/v1/banks/paginated?sort_by=create_date&sort_order=desc',
  oldest: '/api/v1/banks/paginated?sort_by=create_date&sort_order=asc',
  alphabetical: '/api/v1/banks/paginated?sort_by=name&sort_order=asc'
};

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
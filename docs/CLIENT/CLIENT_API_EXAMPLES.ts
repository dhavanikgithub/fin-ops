/**
 * Example usage of the new paginated clients API
 * This file demonstrates various use cases for the enhanced API
 */

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=1&limit=50',
  description: 'Get first 50 clients with default sorting (alphabetical by name)'
};

// Example 2: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?search=john&sort_by=name&sort_order=asc',
  description: 'Search for "john" in client name, email, contact, or address'
};

// Example 3: Sort by transaction count
export const sortByTransactionCountExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=transaction_count&sort_order=desc',
  description: 'Get clients sorted by transaction count (highest first)'
};

// Example 4: Search with custom pagination
export const searchWithPaginationExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=2&limit=25&search=gmail&sort_by=create_date&sort_order=desc',
  description: 'Search for "gmail" with custom pagination and date sorting'
};

// Example 5: Sort by email
export const sortByEmailExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=email&sort_order=asc',
  description: 'Get clients sorted by email address alphabetically'
};

// Example 6: Search for location
export const locationSearchExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?search=Mumbai&sort_by=name&sort_order=asc',
  description: 'Search for clients in Mumbai area'
};

// Example 7: Sort by creation date
export const sortByDateExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=create_date&sort_order=desc',
  description: 'Get newest clients first'
};

// Example 8: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};


/**
 * Expected response structure for clients
 */
export const expectedResponseStructure = {
  success: true,
  data: {
    data: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "9876543210",
        address: "123 Main Street, Mumbai",
        create_date: "2025-01-15T00:00:00.000Z",
        create_time: "14:30:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 15
      }
      // ... more clients
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_count: 120,
      total_pages: 3,
      has_next_page: true,
      has_previous_page: false
    },
    search_applied: "john",
    sort_applied: {
      sort_by: "name",
      sort_order: "asc"
    }
  },
  code: "CLIENTS_RETRIEVED",
  message: "Paginated clients retrieved successfully"
};

/**
 * Filter examples for different use cases
 */
export const searchUseCase = {
  // Search by name
  byName: '/api/v1/clients/paginated?search=John&sort_by=name',
  
  // Search by email domain
  byEmailDomain: '/api/v1/clients/paginated?search=gmail.com&sort_by=email',
  
  // Search by contact (partial)
  byContact: '/api/v1/clients/paginated?search=987&sort_by=contact',
  
  // Search by location
  byLocation: '/api/v1/clients/paginated?search=Mumbai&sort_by=name',
  
  // Search with sorting by transaction count
  activeClients: '/api/v1/clients/paginated?search=&sort_by=transaction_count&sort_order=desc',
  
  // Search new clients
  newClients: '/api/v1/clients/paginated?sort_by=create_date&sort_order=desc&limit=20'
};

/**
 * Response format examples for the Client API
 * This file demonstrates the consistent response structure across all endpoints
 */

// Success Response Examples
export const CLIENT_RESPONSE_EXAMPLES = {
    // GET /api/v1/clients - Success
    GET_CLIENTS_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "contact": "9876543210",
                "address": "123 Main Street, Mumbai, Maharashtra",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null,
                "transaction_count": 15
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "email": null,
                "contact": "8765432109",
                "address": "456 Oak Avenue, Delhi",
                "create_date": "2024-01-02T00:00:00.000Z",
                "create_time": "14:45:00",
                "modify_date": "2024-01-15T00:00:00.000Z",
                "modify_time": "09:20:00",
                "transaction_count": 8
            }
        ],
        "successCode": "CLIENTS_RETRIEVED",
        "message": "Clients retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // GET /api/v1/clients/:id - Success
    GET_CLIENT_BY_ID_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "contact": "9876543210",
            "address": "123 Main Street, Mumbai, Maharashtra",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null,
            "transaction_count": 15
        },
        "successCode": "CLIENTS_RETRIEVED",
        "message": "Client retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // GET /api/v1/clients/name/:name - Success
    GET_CLIENT_BY_NAME_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "contact": "9876543210",
                "address": "123 Main Street, Mumbai, Maharashtra",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null,
                "transaction_count": 15
            }
        ],
        "successCode": "CLIENTS_RETRIEVED",
        "message": "Client retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/clients - Success
    CREATE_CLIENT_SUCCESS: {
        "success": true,
        "data": {
            "id": 3,
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@example.com",
            "contact": "7890123456",
            "address": "789 Commercial Street, Bangalore, Karnataka",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null,
            "transaction_count": 0
        },
        "successCode": "CLIENT_CREATED",
        "message": "Client created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // POST /api/v1/clients - Success (with optional fields as null)
    CREATE_CLIENT_MINIMAL_SUCCESS: {
        "success": true,
        "data": {
            "id": 4,
            "name": "Anonymous Client",
            "email": null,
            "contact": null,
            "address": null,
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null,
            "transaction_count": 0
        },
        "successCode": "CLIENT_CREATED",
        "message": "Client created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // PUT /api/v1/clients - Success
    UPDATE_CLIENT_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "name": "John Doe Updated",
            "email": "john.doe.updated@example.com",
            "contact": "9876543210",
            "address": "456 Updated Street, Mumbai, Maharashtra",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": "2024-10-04T00:00:00.000Z",
            "modify_time": "10:30:00",
            "transaction_count": 15
        },
        "successCode": "CLIENT_UPDATED",
        "message": "Client updated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // DELETE /api/v1/clients - Success
    DELETE_CLIENT_SUCCESS: {
        "success": true,
        "data": {
            "id": 1
        },
        "successCode": "CLIENT_DELETED",
        "message": "Client deleted successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    }
};

// Error Response Examples
export const CLIENT_ERROR_EXAMPLES = {
    // Validation Error - Missing name
    VALIDATION_ERROR_MISSING_NAME: {
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
            "path": "/api/v1/clients",
            "method": "POST"
        }
    },

    // Validation Error - Invalid email
    VALIDATION_ERROR_INVALID_EMAIL: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Invalid email format",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "fields": {
                    "email": "invalid-email",
                    "contact": "9876543210"
                },
                "errors": ["Invalid email format"]
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/clients",
            "method": "POST"
        }
    },

    // Validation Error - Invalid contact
    VALIDATION_ERROR_INVALID_CONTACT: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Invalid contact number - must be a 10-digit Indian mobile number starting with 6-9",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "fields": {
                    "email": "john@example.com",
                    "contact": "1234567890"
                },
                "errors": ["Invalid contact number - must be a 10-digit Indian mobile number starting with 6-9"]
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/clients",
            "method": "POST"
        }
    },

    // Not Found Error
    NOT_FOUND_ERROR: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Client not found",
            "errorCode": "NOT_FOUND",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/clients",
            "method": "PUT"
        }
    },

    // Database Error
    DATABASE_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to fetch clients",
            "errorCode": "DATABASE_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/clients",
            "method": "GET"
        }
    }
};
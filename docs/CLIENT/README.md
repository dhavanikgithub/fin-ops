# Client API Documentation

## Overview

The paginated client API provides comprehensive searching and sorting capabilities with full pagination support designed specifically for modern frontend implementations, including infinite scroll. The enhancement was implemented to support pagination, searching, and sorting capabilities, following the same structure as the transaction paginated API for consistency.

## Endpoint

`GET /api/v1/clients/paginated`

## Key Features

- **Pagination**: 50 records per page by default (configurable up to 100).
- **Searching**: Case-insensitive search with exact match priority, performed across multiple client fields.
- **Sorting**: Flexible sorting with multiple field options.
- **Infinite Scroll Ready**: Designed for efficient frontend infinite scroll implementations using `has_next_page` metadata.
- **API Consistency**: Follows the same structure, validation, and search priority logic as the Transaction and Card APIs.

## Query Parameters

### Pagination
- `page` (optional): Page number starting from 1 (default: 1).
- `limit` (optional): Records per page, max 100 (default: 50).

### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Client name
  - Email address
  - Contact number
  - Address

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first.
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches.
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching.

### Sort
- `sort_by` (optional): Field to sort by
  - `name` (default)
  - `email`
  - `contact`
  - `create_date`
  - `transaction_count`
- `sort_order` (optional): Sort direction
  - `asc` (default for name, email, contact)
  - `desc`

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1.
2. **Limit**: Must be between 1 and 100.
3. **Sort Fields**: Must be one of: `name`, `email`, `contact`, `create_date`, `transaction_count`.
4. **Sort Order**: Must be 'asc' or 'desc'.
5. **Search**: Any string, automatically trimmed.

## Example Requests

### Basic Pagination
```
GET /api/v1/clients/paginated?page=1&limit=50
```

### Search Functionality
```
GET /api/v1/clients/paginated?search=john&sort_by=name&sort_order=asc
```

### Sort by Transaction Count
```
GET /api/v1/clients/paginated?sort_by=transaction_count&sort_order=desc
```

### Search with Custom Pagination
```
GET /api/v1/clients/paginated?page=2&limit=25&search=gmail&sort_by=create_date&sort_order=desc
```

### Complex Query
```
GET /api/v1/clients/paginated?page=1&limit=30&search=Mumbai&sort_by=transaction_count&sort_order=desc
```

## Search Examples

**Search for "john":**
1. ✅ **Exact matches first**: "John Doe", "John Smith"
2. ✅ **Partial matches second**: "Johnson", "Johnny", "john.doe@email.com"

**Search for "gmail":**
1. ✅ **Exact matches first**: Clients with "gmail" in any field
2. ✅ **Partial matches second**: "john@gmail.com", "user.gmail@domain.com"

**Search for "Mumbai":**
1. ✅ **Exact matches first**: Addresses with "Mumbai"
2. ✅ **Partial matches second**: "Mumbai Central", "New Mumbai"

## Response Format

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "contact": "9876543210",
        "address": "123 Main Street, Mumbai",
        "create_date": "2025-01-15T00:00:00.000Z",
        "create_time": "14:30:00",
        "modify_date": null,
        "modify_time": null,
        "transaction_count": 15
      }
      // ... more clients
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_count": 120,
      "total_pages": 3,
      "has_next_page": true,
      "has_previous_page": false
    },
    "search_applied": "john",
    "sort_applied": {
      "sort_by": "name",
      "sort_order": "asc"
    }
  },
  "code": "CLIENTS_RETRIEVED",
  "message": "Paginated clients retrieved successfully"
}
```

## Error Handling

All validation errors return a standardized error response:

```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Page must be a positive integer",
    "details": {
      "field": "page",
      "value": "0",
      "expected": "positive integer"
    }
  }
}
```

---

## Technical & Performance Details

### Performance Considerations

- Maximum 100 records per request to prevent large response sizes.
- Efficient database queries with proper indexing on searchable fields.
- Case-insensitive search optimized for performance with `ILIKE`.
- Pagination offset optimization for large datasets.
- Parameter binding for SQL injection prevention.

### Security Considerations

- SQL injection prevention through parameterized queries.
- Input sanitization.
- Case-insensitive search optimization.

### Implementation Summary (Files Modified)

The implementation involved adding new components to support the paginated structure:

1.  **Types (`src/v1/types/client.ts`):** Added new interfaces for `ClientSearch`, `ClientSort`, `ClientPagination`, `GetClientsInput`, and `PaginatedClientResponse`.
2.  **Queries (`src/v1/queries/clientQueries.ts`):** Added `GET_PAGINATED_CLIENTS` (base query) and `COUNT_CLIENTS` (metadata count query).
3.  **Service (`src/v1/services/clientService.ts`):** Added `getPaginatedClients()` for core logic (dynamic WHERE, exact match priority across multiple fields, sorting, offset/limit).
4.  **Controller (`src/v1/controllers/clientController.ts`):** Added `getPaginatedClients()` for request handling, validation, type conversion, and error handling.
5.  **Routes (`src/v1/routes/clientRoute.ts`):** Added the new endpoint `GET /api/v1/clients/paginated`.
6.  **Documentation:** Created this comprehensive documentation (`docs/CLIENT/README.md`).

---

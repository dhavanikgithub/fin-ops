# Card API Documentation

## Overview

The paginated card API provides comprehensive searching and sorting capabilities with full pagination support designed specifically for modern frontend implementations, including infinite scroll. The enhancement was implemented to support pagination, searching, and sorting capabilities, following the same structure as the client and transaction paginated APIs for consistency. All endpoints follow a consistent structure and return standardized responses.

---

## Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/v1/cards` | Get all cards (legacy, no pagination) |
| **GET** | `/api/v1/cards/paginated` | Get paginated cards with search/sort |
| **GET** | `/api/v1/cards/autocomplete` | Get cards for autocomplete dropdown |
| **POST** | `/api/v1/cards` | Create a new card |
| **PUT** | `/api/v1/cards` | Update an existing card |
| **DELETE** | `/api/v1/cards` | Delete a card |

---

## 1. Get All Cards (Legacy)

**`GET /api/v1/cards`**

Returns all cards with transaction count. No pagination or search is supported on this endpoint.

### Response Example
```json
{
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
    }
  ],
  "successCode": "CARDS_RETRIEVED",
  "message": "Cards retrieved successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

---

## 2. Get Paginated Cards

**`GET /api/v1/cards/paginated`**

Returns paginated cards with search and sort options, designed for modern frontend implementations like infinite scroll.

### Key Features

- **Pagination**: 50 records per page by default (configurable).
- **Searching**: Case-insensitive search with exact match priority, performed on the **Card name** field.
- **Sorting**: Flexible sorting with multiple field options: `name`, `create_date`, `transaction_count`.
- **Infinite Scroll Ready**: Designed for efficient frontend infinite scroll implementations using `has_next_page` metadata.
- **API Consistency**: Follows the same structure, validation, and search priority logic as the Client and Transaction APIs.

### Query Parameters

#### Pagination
- `page` (optional): Page number starting from 1 (default: 1).
- `limit` (optional): Records per page, max 100 (default: 50).

#### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Card name

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first.
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches.
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching.

#### Sort
- `sort_by` (optional): Field to sort by
  - `name` (default)
  - `create_date`
  - `transaction_count`
- `sort_order` (optional): Sort direction
  - `asc` (default)
  - `desc`

### Validation Rules

1. **Page**: Must be a positive integer ≥ 1.
2. **Limit**: Must be between 1 and 100.
3. **Sort Fields**: Must be one of: `name`, `create_date`, `transaction_count`.
4. **Sort Order**: Must be 'asc' or 'desc'.
5. **Search**: Any string, automatically trimmed.

### Example Requests

| Description | Example URL |
| :--- | :--- |
| **Basic Pagination** | `GET /api/v1/cards/paginated?page=1&limit=50` |
| **Search Functionality** | `GET /api/v1/cards/paginated?search=visa&sort_by=name&sort_order=asc` |
| **Sort by Transaction Count** | `GET /api/v1/cards/paginated?sort_by=transaction_count&sort_order=desc` |
| **Search with Custom Pagination** | `GET /api/v1/cards/paginated?page=2&limit=25&search=master&sort_by=create_date&sort_order=desc` |
| **Complex Query** | `GET /api/v1/cards/paginated?page=1&limit=30&search=credit&sort_by=transaction_count&sort_order=desc` |

### Search Examples

| Search Term | Exact Match Priority (1) | Partial Match (2) |
| :--- | :--- | :--- |
| **Search for "visa":** | "Visa", "VISA" | "Visa Credit Card", "My Visa Card" |
| **Search for "credit":** | "Credit" (if exists) | "Credit Card", "Visa Credit", "Master Credit" |
| **Search for "master":** | "Master" | "MasterCard", "Master Credit", "Master Debit" |

### Response Format
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Visa Credit Card",
        "create_date": "2025-01-15T00:00:00.000Z",
        "create_time": "14:30:00",
        "modify_date": null,
        "modify_time": null,
        "transaction_count": 25
      }
      // ... more cards
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_count": 15,
      "total_pages": 1,
      "has_next_page": false,
      "has_previous_page": false
    },
    "search_applied": "visa",
    "sort_applied": {
      "sort_by": "name",
      "sort_order": "asc"
    }
  },
  "code": "CARDS_RETRIEVED",
  "message": "Paginated cards retrieved successfully"
}
```

---

## 3. Get Cards for Autocomplete

**`GET /api/v1/cards/autocomplete`**

Returns a list of cards for use in dropdowns/autocomplete fields.

### Query Parameters
- `search` (optional): Search by card name (case-insensitive, supports exact, starts with, contains)
- `limit` (optional): Max results (default: 5, max: 10)

### Response Example
```json
{
  "success": true,
  "data": {
    "data": [
      { "id": 1, "name": "Visa Credit Card" },
      { "id": 2, "name": "MasterCard Debit" }
    ],
    "search_query": "visa",
    "result_count": 2,
    "limit_applied": 5
  },
  "successCode": "DATA_RETRIEVED",
  "message": "Cards autocomplete data retrieved successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

---

## 4. Create a New Card

**`POST /api/v1/cards`**

### Request Body
```json
{
  "name": "Prepaid Card"
}
```

### Validation
- `name` is required, must be a non-empty string

### Response Example
```json
{
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
}
```

---

## 5. Update an Existing Card

**`PUT /api/v1/cards`**

### Request Body
```json
{
  "id": 1,
  "name": "Premium Credit Card"
}
```

### Validation
- `id` is required, must be a number
- `name` is required, must be a non-empty string

### Response Example
```json
{
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
}
```

---

## 6. Delete a Card

**`DELETE /api/v1/cards`**

### Request Body
```json
{
  "id": 1
}
```

### Validation
- `id` is required, must be a number

### Response Example
```json
{
  "success": true,
  "data": { "id": 1 },
  "successCode": "CARD_DELETED",
  "message": "Card deleted successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

---

## Error Handling

All validation and server errors return a standardized error response.

### Validation Error Example (General Structure)
```json
{
  "success": false,
  "error": {
    "type": "ValidationError", // Specific to README.md, used in paginated API
    "statusCode": 422, // Specific to CardAPI.md
    "message": "Page must be a positive integer", // Or "Name is required and must be a non-empty string"
    "errorCode": "VALIDATION_ERROR", // Specific to CardAPI.md
    "details": {
      "field": "page", // Or "name"
      "value": "0", // Or ""
      "expected": "positive integer" // Or "non-empty string"
    },
    "timestamp": "2024-10-04T10:30:00.000Z", // Specific to CardAPI.md
    "path": "/api/v1/cards",
    "method": "POST"
  }
}
```

### Not Found Error Example
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Card not found",
    "errorCode": "NOT_FOUND",
    "timestamp": "2024-10-04T10:30:00.000Z",
    "path": "/api/v1/cards",
    "method": "PUT"
  }
}
```

### Database Error Example
```json
{
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
```

---

## Technical & Performance Details

### Performance Considerations

- Efficient database queries with proper indexing on card name.
- Case-insensitive search optimized for performance with `ILIKE` (PostgreSQL operator).
- Pagination offset optimization for large datasets.
- Limited result sets (max 100) to prevent large responses.
- Parameter binding for SQL injection prevention.

### Security Considerations

- SQL injection prevention through parameterized queries.
- Input sanitization.

---

## Implementation Summary (Files Modified for Pagination Enhancement)

The implementation of the paginated API (`GET /api/v1/cards/paginated`) involved adding new components to support the paginated structure:

1.  **Types (`src/v1/types/card.ts`):** Added new interfaces for `CardSearch`, `CardSort`, `CardPagination`, `GetCardsInput`, and `PaginatedCardResponse`.
2.  **Queries (`src/v1/queries/cardQueries.ts`):** Added `GET_PAGINATED_CARDS` (base query) and `COUNT_CARDS` (metadata count query).
3.  **Service (`src/v1/services/cardService.ts`):** Added `getPaginatedCards()` for core logic (dynamic WHERE, exact match priority, sorting, offset/limit).
4.  **Controller (`src/v1/controllers/cardController.ts`):** Added `getPaginatedCards()` for request handling, validation, type conversion, and error handling.
5.  **Routes (`src/v1/routes/cardRoute.ts`):** Added the new endpoint `GET /api/v1/cards/paginated`.
6.  **Documentation:** Created comprehensive documentation files (`docs/CARD/README.md` and `CardAPI.md`).
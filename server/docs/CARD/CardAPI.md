# Card API Documentation

This document provides comprehensive details for all Card API endpoints, including request/response formats, validation, and error handling. All endpoints follow a consistent structure and return standardized responses.

---

## Endpoints Overview

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| GET    | /api/v1/cards                 | Get all cards (legacy, no pagination)       |
| GET    | /api/v1/cards/paginated       | Get paginated cards with search/sort        |
| GET    | /api/v1/cards/autocomplete    | Get cards for autocomplete dropdown         |
| POST   | /api/v1/cards                 | Create a new card                           |
| PUT    | /api/v1/cards                 | Update an existing card                     |
| DELETE | /api/v1/cards                 | Delete a card                               |

---

## 1. Get All Cards (Legacy)

**GET /api/v1/cards**

Returns all cards with transaction count. No pagination or search.

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

**GET /api/v1/cards/paginated**

Returns paginated cards with search and sort options.

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50, max: 100)
- `search` (optional): Search by card name (case-insensitive, exact/wildcard)
- `sort_by` (optional): `name` (default), `create_date`, `transaction_count`
- `sort_order` (optional): `asc` (default), `desc`

### Validation Rules
1. **Page**: Must be a positive integer ≥ 1
2. **Limit**: Must be between 1 and 100
3. **Sort Fields**: Must be one of: `name`, `create_date`, `transaction_count`
4. **Sort Order**: Must be 'asc' or 'desc'
5. **Search**: Any string, automatically trimmed

### Response Example
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

**GET /api/v1/cards/autocomplete**

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

**POST /api/v1/cards**

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

**PUT /api/v1/cards**

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

**DELETE /api/v1/cards**

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

All validation and server errors return a standardized error response:

### Validation Error Example
```json
{
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

- Efficient database queries with proper indexing on card name
- Case-insensitive search optimized for performance with `ILIKE`
- Pagination offset optimization for large datasets
- Limited result sets to prevent large responses
- Parameter binding for SQL injection prevention
- SQL injection prevention through parameterized queries
- Input sanitization

---

## Implementation Summary

- **Types**: `src/v1/types/card.ts`
- **Queries**: `src/v1/queries/cardQueries.ts`
- **Service**: `src/v1/services/cardService.ts`
- **Controller**: `src/v1/controllers/cardController.ts`
- **Routes**: `src/v1/routes/cardRoute.ts`
- **Documentation**: This file

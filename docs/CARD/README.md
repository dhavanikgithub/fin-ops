# Card API Documentation

## Overview

The paginated card API provides comprehensive searching and sorting capabilities with full pagination support designed specifically for modern frontend implementations, including infinite scroll. The enhancement was implemented to support pagination, searching, and sorting capabilities, following the same structure as the client and transaction paginated APIs for consistency.

## Endpoint

`GET /api/v1/cards/paginated`

## Key Features

- **Pagination**: 50 records per page by default (configurable).
- **Searching**: Case-insensitive search with exact match priority, performed on the **Card name** field.
- **Sorting**: Flexible sorting with multiple field options: `name`, `create_date`, `transaction_count`.
- **Infinite Scroll Ready**: Designed for efficient frontend infinite scroll implementations using `has_next_page` metadata.
- **API Consistency**: Follows the same structure, validation, and search priority logic as the Client and Transaction APIs.

## Query Parameters

### Pagination
- `page` (optional): Page number starting from 1 (default: 1).
- `limit` (optional): Records per page, max 100 (default: 50).

### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Card name

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first.
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches.
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching.

### Sort
- `sort_by` (optional): Field to sort by
  - `name` (default)
  - `create_date`
  - `transaction_count`
- `sort_order` (optional): Sort direction
  - `asc` (default)
  - `desc`

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1.
2. **Limit**: Must be between 1 and 100.
3. **Sort Fields**: Must be one of: `name`, `create_date`, `transaction_count`.
4. **Sort Order**: Must be 'asc' or 'desc'.
5. **Search**: Any string, automatically trimmed.

## Example Requests

### Basic Pagination
```
GET /api/v1/cards/paginated?page=1&limit=50
```

### Search Functionality
```
GET /api/v1/cards/paginated?search=visa&sort_by=name&sort_order=asc
```

### Sort by Transaction Count
```
GET /api/v1/cards/paginated?sort_by=transaction_count&sort_order=desc
```

### Search with Custom Pagination
```
GET /api/v1/cards/paginated?page=2&limit=25&search=master&sort_by=create_date&sort_order=desc
```

### Complex Query
```
GET /api/v1/cards/paginated?page=1&limit=30&search=credit&sort_by=transaction_count&sort_order=desc
```

## Search Examples

**Search for "visa":**
1. ✅ **Exact matches first**: "Visa", "VISA"
2. ✅ **Partial matches second**: "Visa Credit Card", "My Visa Card"

**Search for "credit":**
1. ✅ **Exact matches first**: "Credit" (if exists)
2. ✅ **Partial matches second**: "Credit Card", "Visa Credit", "Master Credit"

**Search for "master":**
1. ✅ **Exact matches first**: "Master"
2. ✅ **Partial matches second**: "MasterCard", "Master Credit", "Master Debit"

## Response Format

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

- Efficient database queries with proper indexing on card name.
- Case-insensitive search optimized for performance with `ILIKE`.
- Pagination offset optimization for large datasets.
- Limited result sets to prevent large responses.
- Parameter binding for SQL injection prevention.

### Security Considerations

- SQL injection prevention through parameterized queries.
- Input sanitization.
- Case-insensitive search optimization.

### Implementation Summary (Files Modified)

The implementation involved adding new components to support the paginated structure:

1.  **Types (`src/v1/types/card.ts`):** Added new interfaces for `CardSearch`, `CardSort`, `CardPagination`, `GetCardsInput`, and `PaginatedCardResponse`.
2.  **Queries (`src/v1/queries/cardQueries.ts`):** Added `GET_PAGINATED_CARDS` (base query) and `COUNT_CARDS` (metadata count query).
3.  **Service (`src/v1/services/cardService.ts`):** Added `getPaginatedCards()` for core logic (dynamic WHERE, exact match priority, sorting, offset/limit).
4.  **Controller (`src/v1/controllers/cardController.ts`):** Added `getPaginatedCards()` for request handling, validation, type conversion, and error handling.
5.  **Routes (`src/v1/routes/cardRoute.ts`):** Added the new endpoint `GET /api/v1/cards/paginated`.
6.  **Documentation:** Created this comprehensive documentation (`docs/CARD_PAGINATION_API.md`) and usage examples (`docs/CARD_API_EXAMPLES.ts`).

---
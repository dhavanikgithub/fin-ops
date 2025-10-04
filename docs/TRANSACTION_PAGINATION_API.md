# Transaction Pagination API Documentation

## Overview
The new paginated transaction API provides comprehensive filtering, searching, and sorting capabilities with pagination support designed for infinite scroll implementations.

## Endpoint
`GET /api/v1/transactions/paginated`

## Features
- **Pagination**: 50 records per page by default (configurable up to 100)
- **Filtering**: Multiple filter options for precise data retrieval
- **Searching**: Case-insensitive search across multiple fields
- **Sorting**: Flexible sorting with multiple field options
- **Infinite Scroll Ready**: Designed for frontend infinite scroll implementations

## Query Parameters

### Pagination
- `page` (optional): Page number starting from 1 (default: 1)
- `limit` (optional): Records per page, max 100 (default: 50)

### Filters
- `transaction_type` (optional): Filter by transaction type
  - `1` = Deposit
  - `2` = Withdraw
- `min_amount` (optional): Minimum transaction amount (number)
- `max_amount` (optional): Maximum transaction amount (number)
- `start_date` (optional): Start date filter (YYYY-MM-DD format)
- `end_date` (optional): End date filter (YYYY-MM-DD format)
- `bank_ids` (optional): Array of bank IDs to filter by
- `card_ids` (optional): Array of card IDs to filter by
- `client_ids` (optional): Array of client IDs to filter by

### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Client name
  - Bank name
  - Card name
  - Transaction remark

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first
2. **Wildcard Match**: If no exact matches or additional results needed, partial matches using wildcards are included
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching

**Examples:**
- Search for "John" will prioritize records with exact "John" matches before "Johnson" or "Johnny"
- Search for "Bank" will show "Bank of America" before "First National Bank"

### Sort
- `sort_by` (optional): Field to sort by
  - `create_date` (default)
  - `transaction_amount`
  - `client_name`
  - `bank_name`
  - `card_name`
- `sort_order` (optional): Sort direction
  - `desc` (default)
  - `asc`

## Example Requests

### Basic Pagination
```
GET /api/v1/transactions/paginated?page=1&limit=50
```

### Filter by Transaction Type and Amount Range
```
GET /api/v1/transactions/paginated?transaction_type=1&min_amount=100&max_amount=1000
```

### Date Range Filter
```
GET /api/v1/transactions/paginated?start_date=2025-01-01&end_date=2025-01-31
```

### Multiple Bank IDs Filter
```
GET /api/v1/transactions/paginated?bank_ids=1&bank_ids=2&bank_ids=3
```

### Search with Sort
```
GET /api/v1/transactions/paginated?search=john&sort_by=transaction_amount&sort_order=desc
```

### Complex Query (Multiple Filters)
```
GET /api/v1/transactions/paginated?page=2&limit=25&transaction_type=2&min_amount=500&client_ids=1&client_ids=2&search=withdraw&sort_by=create_date&sort_order=desc
```

## Response Format

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "transaction_type": 1,
        "client_id": 1,
        "widthdraw_charges": 5.00,
        "transaction_amount": 1000.00,
        "client_name": "John Doe",
        "bank_name": "Bank of America",
        "card_name": "Visa Card",
        "bank_id": 1,
        "card_id": 1,
        "remark": "Monthly deposit",
        "create_date": "2025-01-15T00:00:00.000Z",
        "create_time": "14:30:00",
        "modify_date": null,
        "modify_time": null
      }
      // ... more transactions
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_count": 150,
      "total_pages": 3,
      "has_next_page": true,
      "has_previous_page": false
    },
    "filters_applied": {
      "transaction_type": 1,
      "min_amount": 100,
      "max_amount": 1000
    },
    "search_applied": "john",
    "sort_applied": {
      "sort_by": "create_date",
      "sort_order": "desc"
    }
  },
  "code": "TRANSACTIONS_RETRIEVED",
  "message": "Paginated transactions retrieved successfully"
}
```

## Frontend Implementation Guide

### Infinite Scroll Pattern
```javascript
// Initial load
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

async function loadTransactions(filters = {}) {
  if (isLoading || !hasMoreData) return;
  
  isLoading = true;
  
  const params = new URLSearchParams({
    page: currentPage,
    limit: 50,
    ...filters
  });
  
  try {
    const response = await fetch(`/api/v1/transactions/paginated?${params}`);
    const result = await response.json();
    
    if (result.success) {
      const { data, pagination } = result.data;
      
      // Append new data to existing list
      appendTransactions(data);
      
      // Update pagination state
      hasMoreData = pagination.has_next_page;
      currentPage = pagination.current_page + 1;
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
  } finally {
    isLoading = false;
  }
}

// Load more on scroll
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    loadTransactions();
  }
}

window.addEventListener('scroll', handleScroll);
```

### Filter Implementation
```javascript
// Apply filters and reset pagination
function applyFilters(filters) {
  currentPage = 1;
  hasMoreData = true;
  clearTransactionList(); // Clear existing data
  loadTransactions(filters);
}

// Example filter object
const filters = {
  transaction_type: 1,
  min_amount: 100,
  max_amount: 5000,
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  bank_ids: [1, 2, 3],
  search: 'deposit',
  sort_by: 'transaction_amount',
  sort_order: 'desc'
};

applyFilters(filters);
```

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1
2. **Limit**: Must be between 1 and 100
3. **Transaction Type**: Must be 1 (Deposit) or 2 (Withdraw)
4. **Amount Range**: min_amount ≤ max_amount, both must be non-negative
5. **Dates**: Must be in YYYY-MM-DD format
6. **ID Arrays**: All IDs must be valid integers
7. **Sort Fields**: Must be one of the allowed sort fields
8. **Sort Order**: Must be 'asc' or 'desc'

## Performance Considerations

- Maximum 100 records per request to prevent large response sizes
- Efficient database queries with proper indexing on filtered fields
- Case-insensitive search optimized for performance
- Pagination offset optimization for large datasets

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

## Migration Guide

The original `/api/v1/transactions` endpoint remains unchanged for backward compatibility. To migrate to the new paginated API:

1. Replace endpoint URL from `/transactions` to `/transactions/paginated`
2. Update response handling to use the new response structure
3. Implement pagination logic using the pagination metadata
4. Add filter and search capabilities as needed
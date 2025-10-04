# Bank Pagination API Documentation

## Overview
The paginated bank API provides comprehensive searching and sorting capabilities with pagination support designed for infinite scroll implementations.

## Endpoint
`GET /api/v1/banks/paginated`

## Features
- **Pagination**: 50 records per page by default (configurable up to 100)
- **Searching**: Case-insensitive search with exact match priority
- **Sorting**: Flexible sorting with multiple field options
- **Infinite Scroll Ready**: Designed for frontend infinite scroll implementations

## Query Parameters

### Pagination
- `page` (optional): Page number starting from 1 (default: 1)
- `limit` (optional): Records per page, max 100 (default: 50)

### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Bank name

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching

### Sort
- `sort_by` (optional): Field to sort by
  - `name` (default)
  - `create_date`
  - `transaction_count`
- `sort_order` (optional): Sort direction
  - `asc` (default)
  - `desc`

## Example Requests

### Basic Pagination
```
GET /api/v1/banks/paginated?page=1&limit=50
```

### Search Functionality
```
GET /api/v1/banks/paginated?search=america&sort_by=name&sort_order=asc
```

### Sort by Transaction Count
```
GET /api/v1/banks/paginated?sort_by=transaction_count&sort_order=desc
```

### Search with Custom Pagination
```
GET /api/v1/banks/paginated?page=2&limit=25&search=chase&sort_by=create_date&sort_order=desc
```

### Complex Query
```
GET /api/v1/banks/paginated?page=1&limit=30&search=national&sort_by=transaction_count&sort_order=desc
```

## Response Format

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Bank of America",
        "create_date": "2025-01-15T00:00:00.000Z",
        "create_time": "14:30:00",
        "modify_date": null,
        "modify_time": null,
        "transaction_count": 45
      }
      // ... more banks
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_count": 25,
      "total_pages": 1,
      "has_next_page": false,
      "has_previous_page": false
    },
    "search_applied": "america",
    "sort_applied": {
      "sort_by": "name",
      "sort_order": "asc"
    }
  },
  "code": "BANKS_RETRIEVED",
  "message": "Paginated banks retrieved successfully"
}
```

## Frontend Implementation Guide

### Infinite Scroll Pattern
```javascript
class BankManager {
  constructor() {
    this.banks = [];
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreData = true;
    this.searchQuery = '';
    this.sortOptions = {
      sort_by: 'name',
      sort_order: 'asc'
    };
  }

  async loadBanks(resetData = false) {
    if (this.isLoading || (!resetData && !this.hasMoreData)) return;

    this.isLoading = true;

    const params = new URLSearchParams({
      page: resetData ? 1 : this.currentPage,
      limit: 50,
      search: this.searchQuery,
      ...this.sortOptions
    });

    try {
      const response = await fetch(`/api/v1/banks/paginated?${params}`);
      const result = await response.json();

      if (result.success) {
        const { data, pagination } = result.data;

        if (resetData) {
          this.banks = data;
          this.currentPage = 1;
        } else {
          this.banks = [...this.banks, ...data];
        }

        this.hasMoreData = pagination.has_next_page;
        this.currentPage = pagination.current_page + 1;

        this.renderBanks();
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Search functionality
  async searchBanks(searchTerm) {
    this.searchQuery = searchTerm;
    this.loadBanks(true); // Reset data with new search
  }

  // Sort functionality
  async sortBanks(sortBy, sortOrder = 'asc') {
    this.sortOptions = { sort_by: sortBy, sort_order: sortOrder };
    this.loadBanks(true); // Reset data with new sort
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        this.loadBanks();
      }
    });
  }

  renderBanks() {
    // Render logic here
    console.log('Rendering', this.banks.length, 'banks');
  }
}

// Usage
const bankManager = new BankManager();
bankManager.setupInfiniteScroll();
bankManager.loadBanks(true);

// Search examples
bankManager.searchBanks('america');
bankManager.searchBanks('chase');
bankManager.searchBanks('wells');

// Sort examples
bankManager.sortBanks('transaction_count', 'desc');
bankManager.sortBanks('create_date', 'desc');
bankManager.sortBanks('name', 'asc');
```

### Search with Debouncing
```javascript
// Debounced search implementation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSearch = debounce((searchTerm) => {
  bankManager.searchBanks(searchTerm);
}, 300);

// Usage in search input
document.getElementById('bankSearchInput').addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1
2. **Limit**: Must be between 1 and 100
3. **Sort Fields**: Must be one of: name, create_date, transaction_count
4. **Sort Order**: Must be 'asc' or 'desc'
5. **Search**: Any string, automatically trimmed

## Performance Considerations

- Maximum 100 records per request to prevent large response sizes
- Efficient database queries with proper indexing on bank name
- Case-insensitive search optimized for performance with ILIKE
- Pagination offset optimization for large datasets

## Search Examples

**Search for "america":**
1. ✅ **Exact matches first**: "America" (if exists)
2. ✅ **Partial matches second**: "Bank of America", "America First Credit Union"

**Search for "chase":**
1. ✅ **Exact matches first**: "Chase" (if exists)
2. ✅ **Partial matches second**: "JPMorgan Chase", "Chase Bank"

**Search for "national":**
1. ✅ **Exact matches first**: "National" (if exists)
2. ✅ **Partial matches second**: "First National Bank", "National Trust"

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

## Use Cases

### Financial Institution Bank Management
```javascript
// Load most active banks
bankManager.sortBanks('transaction_count', 'desc');

// Search for specific bank
bankManager.searchBanks('chase');

// Find recently added banks
bankManager.sortBanks('create_date', 'desc');
```

### Bank Type/Category Filtering
```javascript
// Major banks
bankManager.searchBanks('bank of');

// Credit unions
bankManager.searchBanks('credit union');

// Regional banks
bankManager.searchBanks('first');

// National banks
bankManager.searchBanks('national');
```

## Migration Guide

The original `/api/v1/banks` endpoint remains unchanged for backward compatibility. To migrate to the new paginated API:

1. Replace endpoint URL from `/banks` to `/banks/paginated`
2. Update response handling to use the new response structure
3. Implement pagination logic using the pagination metadata
4. Add search and sort capabilities as needed

## Comparison with Other APIs

The bank pagination API follows the same structure as the client, card, and transaction pagination APIs:

| Feature | Banks | Cards | Clients | Transactions |
|---------|-------|-------|---------|-------------|
| **Search Fields** | name | name | name, email, contact, address | client_name, bank_name, card_name, remark |
| **Sort Fields** | name, create_date, transaction_count | name, create_date, transaction_count | name, email, contact, create_date, transaction_count | create_date, transaction_amount, client_name, bank_name, card_name |
| **Filters** | Search only | Search only | Search only | Transaction type, amount range, date range, entity IDs |
| **Default Sort** | name ASC | name ASC | name ASC | create_date DESC |
| **Complexity** | Simple (search + sort + pagination) | Simple (search + sort + pagination) | Simple (search + sort + pagination) | Complex (filters + search + sort + pagination) |

## Financial Industry Context

### Bank Management Benefits
1. **Institution Analysis**: Easily filter and analyze banks by name or type
2. **Activity Monitoring**: Identify most/least active banking partners
3. **Partnership Management**: Track banking relationships and activity levels
4. **Vendor Management**: Organize banking service providers

### Business Use Cases
- **Banking Partner Analysis**: Understanding which banks have most transactions
- **Relationship Management**: Managing multiple banking relationships
- **Compliance Tracking**: Organizing banks for regulatory reporting
- **Financial Planning**: Analyzing banking partner distribution

This provides a consistent API experience across all entity types while maintaining the specific requirements of banking institution management.
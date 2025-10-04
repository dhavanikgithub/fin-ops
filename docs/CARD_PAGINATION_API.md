# Card Pagination API Documentation

## Overview
The paginated card API provides comprehensive searching and sorting capabilities with pagination support designed for infinite scroll implementations.

## Endpoint
`GET /api/v1/cards/paginated`

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
  - Card name

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

## Frontend Implementation Guide

### Infinite Scroll Pattern
```javascript
class CardManager {
  constructor() {
    this.cards = [];
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreData = true;
    this.searchQuery = '';
    this.sortOptions = {
      sort_by: 'name',
      sort_order: 'asc'
    };
  }

  async loadCards(resetData = false) {
    if (this.isLoading || (!resetData && !this.hasMoreData)) return;

    this.isLoading = true;

    const params = new URLSearchParams({
      page: resetData ? 1 : this.currentPage,
      limit: 50,
      search: this.searchQuery,
      ...this.sortOptions
    });

    try {
      const response = await fetch(`/api/v1/cards/paginated?${params}`);
      const result = await response.json();

      if (result.success) {
        const { data, pagination } = result.data;

        if (resetData) {
          this.cards = data;
          this.currentPage = 1;
        } else {
          this.cards = [...this.cards, ...data];
        }

        this.hasMoreData = pagination.has_next_page;
        this.currentPage = pagination.current_page + 1;

        this.renderCards();
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Search functionality
  async searchCards(searchTerm) {
    this.searchQuery = searchTerm;
    this.loadCards(true); // Reset data with new search
  }

  // Sort functionality
  async sortCards(sortBy, sortOrder = 'asc') {
    this.sortOptions = { sort_by: sortBy, sort_order: sortOrder };
    this.loadCards(true); // Reset data with new sort
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        this.loadCards();
      }
    });
  }

  renderCards() {
    // Render logic here
    console.log('Rendering', this.cards.length, 'cards');
  }
}

// Usage
const cardManager = new CardManager();
cardManager.setupInfiniteScroll();
cardManager.loadCards(true);

// Search examples
cardManager.searchCards('visa');
cardManager.searchCards('master');
cardManager.searchCards('credit');

// Sort examples
cardManager.sortCards('transaction_count', 'desc');
cardManager.sortCards('create_date', 'desc');
cardManager.sortCards('name', 'asc');
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
  cardManager.searchCards(searchTerm);
}, 300);

// Usage in search input
document.getElementById('cardSearchInput').addEventListener('input', (e) => {
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
- Efficient database queries with proper indexing on card name
- Case-insensitive search optimized for performance with ILIKE
- Pagination offset optimization for large datasets

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

### Financial Institution Card Management
```javascript
// Load most active cards
cardManager.sortCards('transaction_count', 'desc');

// Search for specific card type
cardManager.searchCards('debit');

// Find recently added cards
cardManager.sortCards('create_date', 'desc');
```

### Card Type Filtering
```javascript
// Credit cards
cardManager.searchCards('credit');

// Debit cards  
cardManager.searchCards('debit');

// Visa cards
cardManager.searchCards('visa');

// MasterCard
cardManager.searchCards('master');
```

## Migration Guide

The original `/api/v1/cards` endpoint remains unchanged for backward compatibility. To migrate to the new paginated API:

1. Replace endpoint URL from `/cards` to `/cards/paginated`
2. Update response handling to use the new response structure
3. Implement pagination logic using the pagination metadata
4. Add search and sort capabilities as needed

## Comparison with Other APIs

The card pagination API follows the same structure as the client and transaction pagination APIs:

| Feature | Cards | Clients | Transactions |
|---------|-------|---------|-------------|
| **Search Fields** | name | name, email, contact, address | client_name, bank_name, card_name, remark |
| **Sort Fields** | name, create_date, transaction_count | name, email, contact, create_date, transaction_count | create_date, transaction_amount, client_name, bank_name, card_name |
| **Filters** | Search only | Search only | Transaction type, amount range, date range, entity IDs |
| **Default Sort** | name ASC | name ASC | create_date DESC |
| **Complexity** | Simple (search + sort + pagination) | Simple (search + sort + pagination) | Complex (filters + search + sort + pagination) |

This provides a consistent API experience across all entity types while maintaining the specific requirements of each entity.
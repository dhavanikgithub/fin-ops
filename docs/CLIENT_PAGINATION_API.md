# Client Pagination API Documentation

## Overview
The paginated client API provides comprehensive searching and sorting capabilities with pagination support designed for infinite scroll implementations.

## Endpoint
`GET /api/v1/clients/paginated`

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
  - Client name
  - Email address
  - Contact number
  - Address

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching

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

## Frontend Implementation Guide

### Infinite Scroll Pattern
```javascript
class ClientManager {
  constructor() {
    this.clients = [];
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreData = true;
    this.searchQuery = '';
    this.sortOptions = {
      sort_by: 'name',
      sort_order: 'asc'
    };
  }

  async loadClients(resetData = false) {
    if (this.isLoading || (!resetData && !this.hasMoreData)) return;

    this.isLoading = true;

    const params = new URLSearchParams({
      page: resetData ? 1 : this.currentPage,
      limit: 50,
      search: this.searchQuery,
      ...this.sortOptions
    });

    try {
      const response = await fetch(`/api/v1/clients/paginated?${params}`);
      const result = await response.json();

      if (result.success) {
        const { data, pagination } = result.data;

        if (resetData) {
          this.clients = data;
          this.currentPage = 1;
        } else {
          this.clients = [...this.clients, ...data];
        }

        this.hasMoreData = pagination.has_next_page;
        this.currentPage = pagination.current_page + 1;

        this.renderClients();
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Search functionality
  async searchClients(searchTerm) {
    this.searchQuery = searchTerm;
    this.loadClients(true); // Reset data with new search
  }

  // Sort functionality
  async sortClients(sortBy, sortOrder = 'asc') {
    this.sortOptions = { sort_by: sortBy, sort_order: sortOrder };
    this.loadClients(true); // Reset data with new sort
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        this.loadClients();
      }
    });
  }

  renderClients() {
    // Render logic here
    console.log('Rendering', this.clients.length, 'clients');
  }
}

// Usage
const clientManager = new ClientManager();
clientManager.setupInfiniteScroll();
clientManager.loadClients(true);

// Search example
clientManager.searchClients('john');

// Sort examples
clientManager.sortClients('transaction_count', 'desc');
clientManager.sortClients('create_date', 'desc');
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
  clientManager.searchClients(searchTerm);
}, 300);

// Usage in search input
document.getElementById('searchInput').addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1
2. **Limit**: Must be between 1 and 100
3. **Sort Fields**: Must be one of: name, email, contact, create_date, transaction_count
4. **Sort Order**: Must be 'asc' or 'desc'
5. **Search**: Any string, automatically trimmed

## Performance Considerations

- Maximum 100 records per request to prevent large response sizes
- Efficient database queries with proper indexing on searchable fields
- Case-insensitive search optimized for performance with ILIKE
- Pagination offset optimization for large datasets

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

The original `/api/v1/clients` endpoint remains unchanged for backward compatibility. To migrate to the new paginated API:

1. Replace endpoint URL from `/clients` to `/clients/paginated`
2. Update response handling to use the new response structure
3. Implement pagination logic using the pagination metadata
4. Add search and sort capabilities as needed

## Comparison with Transaction API

The client pagination API follows the same structure as the transaction pagination API with these differences:

| Feature | Clients | Transactions |
|---------|---------|-------------|
| **Search Fields** | name, email, contact, address | client_name, bank_name, card_name, remark |
| **Sort Fields** | name, email, contact, create_date, transaction_count | create_date, transaction_amount, client_name, bank_name, card_name |
| **Filters** | Search only | Transaction type, amount range, date range, entity IDs |
| **Default Sort** | name ASC | create_date DESC |

This provides a consistent API experience across all entity types while maintaining the specific requirements of each entity.
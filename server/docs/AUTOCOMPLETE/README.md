# Autocomplete API Documentation

This document provides comprehensive documentation for the autocomplete endpoints and report preview functionality for the finance management system.

## Overview

### Autocomplete Endpoints
The autocomplete endpoints provide fast, searchable data for dropdown components in transaction filter modals. All endpoints implement intelligent priority-based search with case-insensitive matching.

### Report Preview Endpoint
The report preview endpoint calculates estimated file size and row count for transaction exports based on applied filters, helping users understand the scope of their export before generation.

### Search Priority Logic (Autocomplete)
1. **Exact Match** - Highest priority (case-insensitive)
2. **Starts With** - Medium priority 
3. **Contains** - Lowest priority

---

## 1. Client Autocomplete API

### Endpoint
```
GET /api/v1/clients/autocomplete
```

### Description
Retrieves client data optimized for autocomplete dropdown components with intelligent search prioritization.

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `search` | string | No | `""` | - | Search term for filtering client names |
| `limit` | number | No | `5` | `10` | Maximum number of results to return |

### Request Examples

#### Basic Request (No Search)
```http
GET /api/v1/clients/autocomplete?limit=5
```

#### Search Request
```http
GET /api/v1/clients/autocomplete?search=john&limit=3
```

#### Maximum Results
```http
GET /api/v1/clients/autocomplete?search=test&limit=10
```

### Response Format

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "John Doe"
      },
      {
        "id": 5,
        "name": "Johnny Smith"
      }
    ],
    "search_query": "john",
    "result_count": 2,
    "limit_applied": 3
  },
  "successCode": "DATA_RETRIEVED",
  "timestamp": "2025-10-04T07:09:16.007Z",
  "statusCode": 200,
  "message": "Clients autocomplete data retrieved successfully"
}
```

#### Error Response (422) - Invalid Limit
```json
{
  "success": false,
  "error": {
    "statusCode": 422,
    "message": "Limit must be a number between 1 and 10",
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2025-10-04T07:09:21.562Z",
    "path": "/api/v1/clients/autocomplete?limit=15",
    "method": "GET"
  }
}
```

---

## 2. Bank Autocomplete API

### Endpoint
```
GET /api/v1/banks/autocomplete
```

### Description
Retrieves bank data optimized for autocomplete dropdown components with intelligent search prioritization.

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `search` | string | No | `""` | - | Search term for filtering bank names |
| `limit` | number | No | `5` | `10` | Maximum number of results to return |

### Request Examples

#### Basic Request (No Search)
```http
GET /api/v1/banks/autocomplete?limit=5
```

#### Search Request  
```http
GET /api/v1/banks/autocomplete?search=hdfc&limit=3
```

#### Case-Insensitive Search
```http
GET /api/v1/banks/autocomplete?search=HD&limit=5
```

### Response Format

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "HDFC Bank"
      },
      {
        "id": 3,
        "name": "HDFC Corporate"
      }
    ],
    "search_query": "hdfc",
    "result_count": 2,
    "limit_applied": 3
  },
  "successCode": "DATA_RETRIEVED",
  "timestamp": "2025-10-04T07:09:16.007Z",
  "statusCode": 200,
  "message": "Banks autocomplete data retrieved successfully"
}
```

---

## 3. Card Autocomplete API

### Endpoint
```
GET /api/v1/cards/autocomplete
```

### Description
Retrieves card data optimized for autocomplete dropdown components with intelligent search prioritization.

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `search` | string | No | `""` | - | Search term for filtering card names |
| `limit` | number | No | `5` | `10` | Maximum number of results to return |

### Request Examples

#### Basic Request (No Search)
```http
GET /api/v1/cards/autocomplete?limit=5
```

#### Search Request
```http
GET /api/v1/cards/autocomplete?search=visa&limit=3
```

#### Partial Match Search
```http
GET /api/v1/cards/autocomplete?search=mas&limit=5
```

### Response Format

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 2,
        "name": "Visa Credit Card"
      },
      {
        "id": 4,
        "name": "Visa Debit Card"
      }
    ],
    "search_query": "visa",
    "result_count": 2,
    "limit_applied": 3
  },
  "successCode": "DATA_RETRIEVED",
  "timestamp": "2025-10-04T07:09:16.007Z",
  "statusCode": 200,
  "message": "Cards autocomplete data retrieved successfully"
}
```

---

## 4. Report Preview API

### Endpoint
```
GET /api/v1/transactions/report-preview
```

### Description
Calculates estimated file size and row count for transaction exports based on applied filters. This endpoint helps users understand the scope of their export before generating the actual file.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `transaction_type` | number | No | - | Transaction type filter (1=Deposit, 2=Withdraw) |
| `min_amount` | number | No | - | Minimum transaction amount filter |
| `max_amount` | number | No | - | Maximum transaction amount filter |
| `start_date` | string | No | - | Start date filter (YYYY-MM-DD format) |
| `end_date` | string | No | - | End date filter (YYYY-MM-DD format) |
| `bank_ids` | number[] | No | - | Array of bank IDs to filter by |
| `card_ids` | number[] | No | - | Array of card IDs to filter by |
| `client_ids` | number[] | No | - | Array of client IDs to filter by |
| `search` | string | No | - | Search term for filtering across multiple fields |
| `format` | string | No | `CSV` | Export format (CSV, Excel, JSON, PDF) |
| `fields` | string[] | No | `[default fields]` | Fields to include in export |

### Default Fields
```typescript
[
  'client_name',
  'bank_name', 
  'card_name',
  'transaction_amount',
  'transaction_type',
  'create_date'
]
```

### Available Fields
- `client_name` - Client name
- `bank_name` - Bank name  
- `card_name` - Card name
- `transaction_amount` - Transaction amount
- `transaction_type` - Transaction type (Deposit/Withdraw)
- `create_date` - Transaction creation date
- `create_time` - Transaction creation time
- `remark` - Transaction remarks/notes
- `widthdraw_charges` - Withdrawal charges

### Request Examples

#### Basic Preview
```http
GET /api/v1/transactions/report-preview?format=CSV
```

#### Preview with Date Range
```http
GET /api/v1/transactions/report-preview?start_date=2025-09-01&end_date=2025-09-30&format=Excel
```

#### Preview with Multiple Filters
```http
GET /api/v1/transactions/report-preview?transaction_type=1&min_amount=100&max_amount=5000&client_ids=1&client_ids=2&format=JSON
```

#### Preview with Custom Fields
```http
GET /api/v1/transactions/report-preview?fields=client_name&fields=transaction_amount&fields=create_date&format=PDF
```

### Response Format

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "estimated_rows": 248,
    "estimated_size": "~120 KB",
    "estimated_size_bytes": 122880,
    "format": "CSV",
    "filters_applied": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30"
    },
    "search_applied": "HDFC",
    "selected_fields": [
      "client_name",
      "bank_name",
      "card_name",
      "transaction_amount",
      "transaction_type", 
      "create_date"
    ],
    "preview_calculation": {
      "base_size_per_row": 110,
      "field_overhead": 7,
      "format_overhead": 25,
      "compression_factor": 0.8
    }
  },
  "successCode": "DATA_RETRIEVED",
  "timestamp": "2025-10-04T07:15:30.123Z",
  "statusCode": 200,
  "message": "Report preview generated successfully"
}
```

#### Validation Error Response (422)
```json
{
  "success": false,
  "error": {
    "statusCode": 422,
    "message": "Format must be one of: CSV, Excel, JSON, PDF",
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2025-10-04T07:15:30.123Z",
    "path": "/api/v1/transactions/report-preview?format=XML",
    "method": "GET"
  }
}
```

### Size Calculation Logic

The endpoint calculates file size based on:

1. **Base Size Per Row**: Estimated characters per field
2. **Field Overhead**: Format-specific overhead (commas, quotes, etc.)
3. **Format Overhead**: File structure overhead
4. **Compression Factor**: Format-specific compression ratio

#### Format-Specific Calculations

| Format | Compression Factor | Overhead | Use Case |
|--------|-------------------|----------|----------|
| CSV | 0.8 | Low | Simple data exchange |
| Excel | 0.6 | Medium | Spreadsheet analysis |
| JSON | 0.9 | High | API integration |
| PDF | 0.95 | Very High | Reports and printing |

### Field Size Estimates

| Field | Estimated Size (chars) |
|-------|----------------------|
| client_name | 25 |
| bank_name | 20 |
| card_name | 25 |
| transaction_amount | 12 |
| transaction_type | 8 |
| create_date | 20 |
| create_time | 12 |
| remark | 50 |
| widthdraw_charges | 12 |

---

## Common Response Fields

### Data Object Structure
```typescript
interface AutocompleteResponse {
  data: {
    data: Array<{
      id: number;
      name: string;
    }>;
    search_query: string;
    result_count: number;
    limit_applied: number;
  };
}
```

### Success Response Wrapper
```typescript
interface SuccessResponse {
  success: true;
  data: AutocompleteResponse["data"];
  successCode: string;
  timestamp: string;
  statusCode: number;
  message: string;
}
```

### Error Response Structure
```typescript
interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    errorCode: string;
    timestamp: string;
    path: string;
    method: string;
    stack?: string; // Only in development
  };
}
```

---

## Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| `422` | `VALIDATION_ERROR` | Invalid input parameters (e.g., limit > 10) |
| `500` | `DATABASE_ERROR` | Database connection or query issues |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server errors |

---

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

#### Basic Fetch Implementation
```javascript
async function fetchClientAutocomplete(searchTerm = '', limit = 5) {
  try {
    const response = await fetch(
      `/api/v1/clients/autocomplete?search=${encodeURIComponent(searchTerm)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data.data; // Array of {id, name}
  } catch (error) {
    console.error('Error fetching client autocomplete:', error);
    return [];
  }
}
```

#### React Hook Example
```typescript
import { useState, useEffect } from 'react';

interface AutocompleteItem {
  id: number;
  name: string;
}

function useAutocomplete(endpoint: string, searchTerm: string, limit = 5) {
  const [data, setData] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm.length < 2) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/${endpoint}/autocomplete?search=${encodeURIComponent(searchTerm)}&limit=${limit}`
        );
        
        const result = await response.json();
        
        if (result.success) {
          setData(result.data.data);
        } else {
          setError(result.error?.message || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [endpoint, searchTerm, limit]);

  return { data, loading, error };
}

// Usage
function ClientSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients, loading, error } = useAutocomplete('clients', searchTerm);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search clients..."
      />
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <ul>
        {clients.map(client => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Performance Considerations

### Recommended Practices

1. **Debouncing**: Implement client-side debouncing (300ms recommended) to avoid excessive API calls
2. **Minimum Search Length**: Consider requiring minimum 2-3 characters before triggering search
3. **Caching**: Cache results for repeated searches to improve user experience
4. **Limit Management**: Use appropriate limits based on UI constraints (3-5 for small dropdowns, 10 for larger lists)

### Database Optimization

- All autocomplete queries use PostgreSQL `ILIKE` for case-insensitive search
- Queries are optimized with proper indexing on name fields
- Results are limited at database level for optimal performance

---

## Testing

### cURL Examples

#### Test Client Autocomplete
```bash
# Basic request
curl "http://localhost:3001/api/v1/clients/autocomplete?limit=5"

# Search request
curl "http://localhost:3001/api/v1/clients/autocomplete?search=john&limit=3"

# Validation error test
curl "http://localhost:3001/api/v1/clients/autocomplete?limit=15"
```

#### Test Bank Autocomplete
```bash
# Basic request
curl "http://localhost:3001/api/v1/banks/autocomplete?limit=5"

# Search request
curl "http://localhost:3001/api/v1/banks/autocomplete?search=hdfc&limit=3"
```

#### Test Card Autocomplete
```bash
# Basic request
curl "http://localhost:3001/api/v1/cards/autocomplete?limit=5"

# Search request
curl "http://localhost:3001/api/v1/cards/autocomplete?search=visa&limit=3"
```

### PowerShell Examples
```powershell
# Client autocomplete
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/clients/autocomplete?search=john&limit=3' -Method Get

# Bank autocomplete
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/banks/autocomplete?search=hdfc&limit=5' -Method Get

# Card autocomplete
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/cards/autocomplete?search=visa&limit=3' -Method Get
```

---

## Security Notes

- All inputs are properly sanitized and parameterized to prevent SQL injection
- Search terms are validated and escaped before database queries
- Rate limiting should be implemented at the API gateway level for production use
- Consider implementing authentication/authorization as per your security requirements

---


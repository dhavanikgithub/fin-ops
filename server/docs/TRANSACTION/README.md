# Transaction API Documentation

## Overview

The Transaction API provides comprehensive functionality for managing transactions and generating reports. It includes paginated transaction retrieval with advanced filtering, searching, sorting capabilities, and PDF report generation for transaction data analysis.

## Endpoints

### 1. Paginated Transactions
`GET /api/v1/transactions/paginated`

### 2. Transaction Report Generation
`POST /api/v1/transactions/report`

## Key Features

### Paginated Transactions
- **Pagination**: 50 records per page by default (configurable up to 100).
- **Filtering**: Multiple filter options for precise data retrieval (Type, Amount Range, Date Range, Entity IDs).
- **Searching**: Case-insensitive search with exact match priority across multiple fields.
- **Sorting**: Flexible sorting with multiple field options.
- **Infinite Scroll Ready**: Designed for efficient frontend infinite scroll implementations using `has_next_page` metadata.
- **API Consistency**: Follows the same structure, validation, and search priority logic as the Client and Card APIs.

### Transaction Report Generation
- **PDF Report Generation**: Create comprehensive transaction reports in PDF format.
- **Date Range Filtering**: Generate reports for specific date ranges.
- **Client-Specific Reports**: Generate reports for specific clients or all clients.
- **Detailed Transaction Data**: Includes client, bank, card information with calculated totals and charges.
- **Professional Formatting**: Well-formatted PDF reports with proper calculations and summaries.

## Query Parameters

### Pagination
- `page` (optional): Page number starting from 1 (default: 1).
- `limit` (optional): Records per page, max 100 (default: 50).

### Filters
- `transaction_type` (optional): Filter by transaction type
  - `1` = Deposit
  - `2` = Withdraw
- `min_amount` (optional): Minimum transaction amount (number, must be non-negative)
- `max_amount` (optional): Maximum transaction amount (number, must be non-negative)
- `start_date` (optional): Start date filter (YYYY-MM-DD format)
- `end_date` (optional): End date filter (YYYY-MM-DD format)
- `bank_ids` (optional): Array of bank IDs to filter by (all IDs must be valid integers)
- `card_ids` (optional): Array of card IDs to filter by (all IDs must be valid integers)
- `client_ids` (optional): Array of client IDs to filter by (all IDs must be valid integers)

### Search
- `search` (optional): Case-insensitive search with priority matching across:
  - Client names
  - Bank names
  - Card names
  - Transaction remarks

**Search Priority Logic:**
1. **Exact Match Priority**: Results that exactly match the search term are displayed first.
2. **Wildcard Match**: Partial matches using wildcards are included after exact matches.
3. **Case Insensitive**: Uses PostgreSQL's `ILIKE` operator for case-insensitive matching.

**Examples:**
- Search for "John" will prioritize records with exact "John" matches before "Johnson" or "Johnny".
- Search for "Bank" will show "Bank of America" before "First National Bank".

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

## Validation Rules

1. **Page**: Must be a positive integer ≥ 1.
2. **Limit**: Must be between 1 and 100.
3. **Transaction Type**: Must be 1 (Deposit) or 2 (Withdraw).
4. **Amount Range**: `min_amount` ≤ `max_amount`, both must be non-negative.
5. **Dates**: Must be in YYYY-MM-DD format.
6. **ID Arrays**: All IDs must be valid integers.
7. **Sort Fields**: Must be one of: `create_date`, `transaction_amount`, `client_name`, `bank_name`, `card_name`.
8. **Sort Order**: Must be 'asc' or 'desc'.
9. **Search**: Any string, automatically trimmed.

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

### Multiple Client IDs Filter
```
GET /api/v1/transactions/paginated?client_ids=1&client_ids=2&client_ids=3
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
      // ... all applied filters
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
- Efficient database queries with proper indexing on filtered fields.
- Case-insensitive search optimized for performance.
- Pagination offset optimization for large datasets.
- Parameter binding for SQL injection prevention.

### Security Considerations

- SQL injection prevention through parameterized queries.
- Input sanitization.
- Rate limiting considerations (recommended for production).
- Case-insensitive search optimization.

---

## Transaction Report API

### Endpoint
`POST /api/v1/transactions/report`

### Description
Generate comprehensive PDF reports for transaction data with optional client-specific filtering and date range selection.

### Request Body

```json
{
  "startDate": "2024-01-01",    // Required: Start date (YYYY-MM-DD format)
  "endDate": "2024-12-31",      // Required: End date (YYYY-MM-DD format)  
  "clientId": "1"               // Optional: Client ID (string), null for all clients
}
```

### Request Body Parameters

- **`startDate`** (required): Start date for the report in YYYY-MM-DD format
- **`endDate`** (required): End date for the report in YYYY-MM-DD format
- **`clientId`** (optional): Client ID as string, set to `null` or omit for all clients

### Validation Rules

1. **Start Date**: Required, must be in YYYY-MM-DD format
2. **End Date**: Required, must be in YYYY-MM-DD format  
3. **Client ID**: Optional, must be a valid client ID string or null
4. **Date Range**: End date must be >= start date

### Example Requests

#### Generate Report for All Clients
```bash
curl -X POST http://localhost:3000/api/v1/transactions/report \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "clientId": null
  }'
```

#### Generate Report for Specific Client
```bash
curl -X POST http://localhost:3000/api/v1/transactions/report \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-10-01", 
    "endDate": "2024-10-31",
    "clientId": "5"
  }'
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    "pdfContent": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI..."
  },
  "code": "REPORT_GENERATED_SUCCESS",
  "message": "Transaction report generated successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "No transactions found for the specified criteria"
  }
}
```

### Response Details

- **`pdfContent`**: Base64 encoded PDF content that can be downloaded or displayed
- **PDF Features**:
  - Professional formatting with company branding
  - Detailed transaction listings grouped by client
  - Calculated totals including transaction amounts and withdrawal charges
  - Date range and client information in header
  - Summary calculations and final amounts

### Report Contents

The generated PDF report includes:

1. **Header Information**:
   - Report title and date range
   - Client information (if client-specific)
   - Generation timestamp

2. **Transaction Details**:
   - Transaction type (Deposit/Withdraw)
   - Transaction amount with proper formatting
   - Withdrawal charges (percentage and amount)
   - Bank and card information
   - Transaction date and time
   - Remarks/notes

3. **Summary Calculations**:
   - Total transaction amounts by client
   - Total withdrawal charges
   - Final amounts after charges
   - Grand totals for all clients

4. **Professional Formatting**:
   - Currency formatting (Rs. X,XXX/-)
   - Proper date/time formatting
   - Organized client grouping
   - Clean table layouts

---

## Implementation Summary (Files Modified)

The implementation involved adding new components to support both paginated transactions and report generation:

1. **Types (`src/v1/types/transaction.ts`):** Added interfaces for `TransactionFilters`, `TransactionSearch`, `TransactionSort`, `TransactionPagination`, `GetTransactionsInput`, `PaginatedTransactionResponse`, `ReportRequestBody`, `TransactionReportData`, `GroupedData`, `ReportData`, and `TransactionRecord`.

2. **Queries (`src/v1/queries/transactionQueries.ts`):** Added `GET_PAGINATED_TRANSACTIONS`, `COUNT_TRANSACTIONS`, `GET_TRANSACTIONS_FOR_REPORT`, and `GET_TRANSACTIONS_FOR_REPORT_BY_CLIENT` queries.

3. **Service (`src/v1/services/transactionService.ts`):** Added `getPaginatedTransactions()` and `getTransactionsForReport()` methods for core business logic.

4. **Controller (`src/v1/controllers/transactionController.ts`):** Added `getPaginatedTransactions()` and `generateReport()` methods for request handling, validation, and response formatting.

5. **Routes (`src/v1/routes/transactionRoute.ts`):** Added endpoints `GET /api/v1/transactions/paginated` and `POST /api/v1/transactions/report`.

6. **Documentation:** Created comprehensive documentation (`docs/TRANSACTION/README.md`) and examples (`docs/TRANSACTION/TRANSACTION_API_EXAMPLES.ts`).

---

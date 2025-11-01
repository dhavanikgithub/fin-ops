# Bank API Documentation

This comprehensive document outlines the standardized API response format and details the Bank API endpoints, including the new enhancements for pagination, searching, and sorting.

---

## 1. API Response Format Documentation

This section outlines the standardized response format used across all API endpoints in the Finance Inventory Backend for consistent cross-platform communication.

### Success Response Structure

All successful API responses follow this consistent structure:

```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  successCode: string;
  timestamp: string;
  statusCode: number;
}
```

### Error Response Structure

All error responses follow this consistent structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    errorCode: string;
    details?: any;
    timestamp: string;
    path?: string;
    method?: string;
    stack?: string; // Only in development
  };
}
```

### Benefits of This Format

1.  **Consistency**: All endpoints return the same structure with both success and error codes
2.  **Cross-platform Compatibility**: Easy to parse on any platform
3.  **Debugging**: Clear success/error codes and messages for better troubleshooting
4.  **Type Safety**: Well-defined TypeScript interfaces
5.  **Maintainability**: Centralized response formatting
6.  **Monitoring**: Structured logging with timestamps and context
7.  **Client Logic**: Success codes allow clients to handle different types of successful operations differently

---

## 2. API Success Codes

The API uses standardized success codes for easy identification:

### Generic Success Codes
- `OPERATION_SUCCESS` - General successful operation
- `DATA_RETRIEVED` - Data successfully retrieved
- `RESOURCE_CREATED` - Resource successfully created
- `RESOURCE_UPDATED` - Resource successfully updated
- `RESOURCE_DELETED` - Resource successfully deleted

### Entity Specific Success Codes
| Entity | Retrieval | Creation | Update | Deletion |
| :--- | :--- | :--- | :--- | :--- |
| **Bank** | `BANKS_RETRIEVED` | `BANK_CREATED` | `BANK_UPDATED` | `BANK_DELETED` |
---

## 3. API Error Codes

The API uses standardized error codes for easy identification:

| Error Code | HTTP Status Code | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `ROUTE_NOT_FOUND` | 404 | API endpoint not found |
| `INTERNAL_SERVER_ERROR` | 500 | General server error |
| `BAD_REQUEST` | 400 | Invalid request format |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |

---

## 4. Bank API Endpoints

The Bank API manages financial institution records in the inventory.

### 4.1. Bank CRUD Endpoints (Backward Compatible)

The original Bank CRUD endpoints maintain the standard `SuccessResponse` format.

#### **GET /api/v1/banks** (List All)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chase Bank",
      "create_date": "2024-01-01T00:00:00.000Z",
      "create_time": "10:30:00",
      "modify_date": null,
      "modify_time": null,
      "transaction_count": 15
    }
  ],
  "successCode": "BANKS_RETRIEVED",
  "message": "Banks retrieved successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

#### **POST /api/v1/banks** (Create)

**Request Body:**
```json
{
  "name": "Bank of America"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Bank of America",
    "create_date": "2024-10-04T00:00:00.000Z",
    "create_time": "10:30:00",
    "modify_date": null,
    "modify_time": null,
    "transaction_count": 0
  },
  "successCode": "BANK_CREATED",
  "message": "Bank created successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 201
}
```

**Validation Error (422):**
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
    "path": "/api/v1/banks",
    "method": "POST"
  }
}
```

#### **PUT /api/v1/banks** (Update)

**Request Body:**
```json
{
  "id": 1,
  "name": "JPMorgan Chase Bank"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JPMorgan Chase Bank",
    "create_date": "2024-01-01T00:00:00.000Z",
    "create_time": "10:30:00",
    "modify_date": "2024-10-04T00:00:00.000Z",
    "modify_time": "10:30:00",
    "transaction_count": 15
  },
  "successCode": "BANK_UPDATED",
  "message": "Bank updated successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Bank not found",
    "errorCode": "NOT_FOUND",
    "timestamp": "2024-10-04T10:30:00.000Z",
    "path": "/api/v1/banks",
    "method": "PUT"
  }
}
```

#### **DELETE /api/v1/banks** (Delete)

**Request Body:**
```json
{
  "id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "successCode": "BANK_DELETED",
  "message": "Bank deleted successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```

### 4.2. Bank Pagination, Search, and Sort Endpoint

The new paginated endpoint provides comprehensive searching and sorting capabilities with pagination support designed for infinite scroll implementations.

**Endpoint:**
`GET /api/v1/banks/paginated`

**Features Implemented:**
- **Pagination**: Configurable page size (default: 50, max: 100) with complete metadata.
- **Searching**: Case-insensitive search on **Bank names** with **Exact Match Priority**.
- **Sorting**: Flexible sorting by `name`, `create_date`, or `transaction_count`.

#### Query Parameters

| Parameter | Type | Optional | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | Yes | 1 | Page number starting from 1. **Validation**: Must be a positive integer $\ge 1$. |
| `limit` | Integer | Yes | 50 | Records per page, max 100. **Validation**: Must be between 1 and 100. |
| `search` | String | Yes | "" | Case-insensitive search string for bank name. |
| `sort_by` | String | Yes | `name` | Field to sort by: `name`, `create_date`, `transaction_count`. |
| `sort_order` | String | Yes | `asc` | Sort direction: `asc` or `desc`. |

#### Example Requests

| Use Case | Request |
| :--- | :--- |
| **Basic Pagination** | `GET /api/v1/banks/paginated?page=1&limit=50` |
| **Search Functionality** | `GET /api/v1/banks/paginated?search=america&sort_by=name&sort_order=asc` |
| **Sort by Activity** | `GET /api/v1/banks/paginated?sort_by=transaction_count&sort_order=desc` |
| **Complex Query** | `GET /api/v1/banks/paginated?page=2&limit=25&search=chase&sort_by=create_date&sort_order=desc` |

#### Paginated Success Response Structure (200)

The response nests the data and metadata within the primary `data` field of the standard success response.

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
  "successCode": "BANKS_RETRIEVED",
  "message": "Paginated banks retrieved successfully",
  "timestamp": "2024-10-04T10:30:00.000Z",
  "statusCode": 200
}
```


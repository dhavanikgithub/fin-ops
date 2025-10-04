# API Response Format Documentation

This document outlines the standardized response format used across all API endpoints in the Finance Inventory Backend for consistent cross-platform communication.

## Response Structure

### Success Response Format

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

### Error Response Format

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

## Bank API Examples

### GET /api/v1/banks

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

### POST /api/v1/banks

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

### PUT /api/v1/banks

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

### DELETE /api/v1/banks

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

## Success Codes

The API uses standardized success codes for easy identification:

### Generic Success Codes
- `OPERATION_SUCCESS` - General successful operation
- `DATA_RETRIEVED` - Data successfully retrieved
- `RESOURCE_CREATED` - Resource successfully created
- `RESOURCE_UPDATED` - Resource successfully updated
- `RESOURCE_DELETED` - Resource successfully deleted

### Bank Specific Success Codes
- `BANKS_RETRIEVED` - Banks list retrieved successfully
- `BANK_CREATED` - Bank created successfully
- `BANK_UPDATED` - Bank updated successfully
- `BANK_DELETED` - Bank deleted successfully

### User Specific Success Codes
- `USERS_RETRIEVED` - Users list retrieved successfully
- `USER_CREATED` - User created successfully
- `USER_UPDATED` - User updated successfully
- `USER_DELETED` - User deleted successfully

### Authentication Success Codes
- `LOGIN_SUCCESS` - User logged in successfully
- `LOGOUT_SUCCESS` - User logged out successfully
- `TOKEN_REFRESHED` - Authentication token refreshed

### File Operation Success Codes
- `FILE_UPLOADED` - File uploaded successfully
- `FILE_DOWNLOADED` - File downloaded successfully
- `FILE_DELETED` - File deleted successfully

## Error Codes

The API uses standardized error codes for easy identification:

- `VALIDATION_ERROR` (422) - Input validation failed
- `NOT_FOUND` (404) - Resource not found
- `DATABASE_ERROR` (500) - Database operation failed
- `ROUTE_NOT_FOUND` (404) - API endpoint not found
- `INTERNAL_SERVER_ERROR` (500) - General server error
- `BAD_REQUEST` (400) - Invalid request format
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied

## Benefits of This Format

1. **Consistency**: All endpoints return the same structure with both success and error codes
2. **Cross-platform Compatibility**: Easy to parse on any platform
3. **Debugging**: Clear success/error codes and messages for better troubleshooting
4. **Type Safety**: Well-defined TypeScript interfaces
5. **Maintainability**: Centralized response formatting
6. **Monitoring**: Structured logging with timestamps and context
7. **Client Logic**: Success codes allow clients to handle different types of successful operations differently

## Implementation Details

- **Response Utility**: `src/common/utils/responseFormat.ts`
- **Error Classes**: `src/common/errors/`
- **Error Handler Middleware**: `src/common/errors/errorHandler.ts`
- **Async Handler**: Wraps controllers for automatic error handling

This consistent format ensures that client applications can reliably parse responses and handle both success and error cases across all API endpoints with proper identification codes.
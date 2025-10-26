# Finkeda Settings API Documentation

This document provides comprehensive details for all Finkeda Settings API endpoints, including request/response formats, validation, and error handling. All endpoints follow a consistent structure and return standardized responses.

---

## Endpoints Overview

| Method | Endpoint                             | Description                                 |
|--------|--------------------------------------|---------------------------------------------|
| GET    | /api/v1/finkeda-settings             | Get latest finkeda calculator settings      |
| GET    | /api/v1/finkeda-settings/history     | Get finkeda calculator settings history     |
| PUT    | /api/v1/finkeda-settings             | Update or create finkeda calculator settings|

---

## 1. Get Latest Settings

**GET /api/v1/finkeda-settings**

Returns the most recent finkeda calculator settings.

### Response Example (Settings Found)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rupay_card_charge_amount": 5.50,
    "master_card_charge_amount": 7.25,
    "create_date": "2024-10-26T00:00:00.000Z",
    "create_time": "10:30:00",
    "modify_date": "2024-10-26T00:00:00.000Z",
    "modify_time": "14:45:00"
  },
  "successCode": "DATA_RETRIEVED",
  "message": "Latest settings retrieved successfully",
  "timestamp": "2024-10-26T14:45:00.000Z",
  "statusCode": 200
}
```

### Response Example (No Settings Found)
```json
{
  "success": true,
  "data": null,
  "successCode": "NOT_FOUND",
  "message": "No settings found",
  "timestamp": "2024-10-26T14:45:00.000Z",
  "statusCode": 404
}
```

---

## 2. Get Settings History

**GET /api/v1/finkeda-settings/history**

Returns all historical changes to the finkeda calculator settings.

### Response Example
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "calculator_settings_id": 1,
      "previous_rupay_amount": 5.00,
      "previous_master_amount": 7.00,
      "new_rupay_amount": 5.50,
      "new_master_amount": 7.25,
      "create_date": "2024-10-26T00:00:00.000Z",
      "create_time": "14:45:00"
    },
    {
      "id": 2,
      "calculator_settings_id": 1,
      "previous_rupay_amount": 4.50,
      "previous_master_amount": 6.50,
      "new_rupay_amount": 5.00,
      "new_master_amount": 7.00,
      "create_date": "2024-10-25T00:00:00.000Z",
      "create_time": "09:30:00"
    }
  ],
  "successCode": "DATA_RETRIEVED",
  "message": "Settings history retrieved successfully",
  "timestamp": "2024-10-26T14:45:00.000Z",
  "statusCode": 200
}
```

---

## 3. Update or Create Settings

**PUT /api/v1/finkeda-settings**

Updates existing settings or creates new ones if none exist. Automatically records history for updates.

### Request Body
```json
{
  "rupay_card_charge_amount": 5.75,
  "master_card_charge_amount": 7.50
}
```

### Validation Rules
1. **rupay_card_charge_amount**: Required, must be a number
2. **master_card_charge_amount**: Required, must be a number

### Response Example (Update)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rupay_card_charge_amount": 5.75,
    "master_card_charge_amount": 7.50,
    "create_date": "2024-10-26T00:00:00.000Z",
    "create_time": "10:30:00",
    "modify_date": "2024-10-26T00:00:00.000Z",
    "modify_time": "15:20:00"
  },
  "successCode": "RESOURCE_UPDATED",
  "message": "Settings updated successfully",
  "timestamp": "2024-10-26T15:20:00.000Z",
  "statusCode": 200
}
```

### Response Example (Create)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rupay_card_charge_amount": 5.75,
    "master_card_charge_amount": 7.50,
    "create_date": "2024-10-26T00:00:00.000Z",
    "create_time": "15:20:00",
    "modify_date": null,
    "modify_time": null
  },
  "successCode": "RESOURCE_UPDATED",
  "message": "Settings updated successfully",
  "timestamp": "2024-10-26T15:20:00.000Z",
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
    "message": "Rupay card charge amount is required and must be a number",
    "errorCode": "VALIDATION_ERROR",
    "details": {
      "field": "rupay_card_charge_amount",
      "value": "invalid",
      "expected": "number"
    },
    "timestamp": "2024-10-26T15:20:00.000Z",
    "path": "/api/v1/finkeda-settings",
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
    "message": "Failed to fetch latest settings",
    "errorCode": "DATABASE_ERROR",
    "timestamp": "2024-10-26T15:20:00.000Z",
    "path": "/api/v1/finkeda-settings",
    "method": "GET"
  }
}
```

---

## Business Logic

### History Tracking
When updating existing settings:
1. The current settings are automatically saved to the history table before the update
2. The history record includes:
   - Reference to the original settings ID
   - Previous values for both charge amounts
   - New values for both charge amounts
   - Timestamp of the change

### Auto-Timestamps
- **Create operations**: Sets `create_date` and `create_time`
- **Update operations**: Sets `modify_date` and `modify_time` using SQL `CURRENT_DATE` and `CURRENT_TIME`

---

## Use Cases

### Financial Calculator Integration
- **Charge Calculation**: Used by financial calculators to determine transaction fees
- **Dynamic Pricing**: Allows real-time updates to card processing charges
- **Audit Trail**: Complete history of all charge amount changes for compliance

### Administrative Management
- **Settings Configuration**: Administrators can update charge amounts as needed
- **Change Tracking**: Full audit trail of who changed what and when
- **Historical Analysis**: Review charge amount trends over time

---

## Technical Details

### Database Tables
- **finkeda_calculator_settings**: Main settings table
- **finkeda_calculator_settings_history**: Historical changes table

### Performance Considerations
- Efficient queries using ORDER BY with LIMIT for latest settings
- Parameterized queries for SQL injection prevention
- Automatic timestamping using database functions

### Security Features
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Structured error handling with detailed logging

---

## Implementation Summary

- **Types**: `src/v1/types/finkedaSettings.ts`
- **Queries**: `src/v1/queries/finkedaSettingsQueries.ts`
- **Service**: `src/v1/services/finkedaSettingsService.ts`
- **Controller**: `src/v1/controllers/finkedaSettingsController.ts`
- **Routes**: `src/v1/routes/finkedaSettingsRoute.ts`
- **Documentation**: This file and `FINKEDA_SETTINGS_API_EXAMPLES.ts`

---

## Integration Notes

### Frontend Integration
```javascript
// Get latest settings
const response = await fetch('/api/v1/finkeda-settings');
const settings = await response.json();

// Update settings
const updateResponse = await fetch('/api/v1/finkeda-settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rupay_card_charge_amount: 6.00,
    master_card_charge_amount: 8.00
  })
});
```

### Calculator Usage
```javascript
// Use settings in calculation
const settings = await getLatestSettings();
const rupayFee = transactionAmount * (settings.rupay_card_charge_amount / 100);
const masterFee = transactionAmount * (settings.master_card_charge_amount / 100);
```
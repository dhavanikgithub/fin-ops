/**
 * Example usage of the Transaction API
 * This file demonstrates various use cases for both paginated transactions and report generation
 */

// ========================
// PAGINATED TRANSACTIONS API EXAMPLES
// ========================

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=1&limit=50',
  description: 'Get first 50 transactions with default sorting (newest first)'
};

// Example 2: Filter by transaction type and amount range
export const filterExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?transaction_type=1&min_amount=100&max_amount=5000',
  description: 'Get deposit transactions between $100 and $5000'
};

// Example 3: Date range filter
export const dateRangeExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?start_date=2025-01-01&end_date=2025-01-31&page=1',
  description: 'Get transactions from January 2025'
};

// Example 4: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?search=john&sort_by=transaction_amount&sort_order=desc',
  description: 'Search for "john" in client name, bank name, card name, or remark'
};

// Example 5: Multiple bank IDs filter
export const multipleBanksExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?bank_ids=1&bank_ids=2&bank_ids=3',
  description: 'Get transactions from specific banks'
};

// Example 6: Complex filter combination
export const complexFilterExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=2&limit=25&transaction_type=2&min_amount=500&client_ids=1&client_ids=2&search=withdraw&sort_by=create_date&sort_order=desc',
  description: 'Complex filter: page 2, 25 records, withdrawals over $500, specific clients, search "withdraw", sorted by date desc'
};

// Example 7: Sort by client name
export const sortByClientExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?sort_by=client_name&sort_order=asc',
  description: 'Get transactions sorted by client name alphabetically'
};

// Example 8: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/transactions/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};

// ========================
// TRANSACTION REPORT API EXAMPLES
// ========================

// Example 9: Generate report for all clients
export const reportAllClientsExample = {
  method: 'POST',
  url: '/api/v1/transactions/report',
  body: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    clientId: null
  },
  description: 'Generate PDF report for all clients for the year 2024'
};

// Example 10: Generate report for specific client
export const reportSpecificClientExample = {
  method: 'POST',
  url: '/api/v1/transactions/report',
  body: {
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    clientId: '5'
  },
  description: 'Generate PDF report for client ID 5 for October 2024'
};

// Example 11: Monthly report for all clients
export const monthlyReportExample = {
  method: 'POST',
  url: '/api/v1/transactions/report',
  body: {
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    clientId: null
  },
  description: 'Generate monthly report for November 2024 for all clients'
};

// Example 12: Weekly report for specific client
export const weeklyReportExample = {
  method: 'POST',
  url: '/api/v1/transactions/report',
  body: {
    startDate: '2024-11-01',
    endDate: '2024-11-07',
    clientId: '3'
  },
  description: 'Generate weekly report for client ID 3 for first week of November 2024'
};

// Example 13: Quarterly report for all clients
export const quarterlyReportExample = {
  method: 'POST',
  url: '/api/v1/transactions/report',
  body: {
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    clientId: null
  },
  description: 'Generate Q3 2024 report for all clients'
};

// ========================
// CURL COMMAND EXAMPLES
// ========================

export const curlExamples = {
  // Paginated transactions
  paginatedTransactions: `curl -X GET "http://localhost:3000/api/v1/transactions/paginated?page=1&limit=25&transaction_type=1&search=john"`,
  
  // Report for all clients
  reportAllClients: `curl -X POST http://localhost:3000/api/v1/transactions/report \\
  -H "Content-Type: application/json" \\
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "clientId": null
  }'`,
  
  // Report for specific client
  reportSpecificClient: `curl -X POST http://localhost:3000/api/v1/transactions/report \\
  -H "Content-Type: application/json" \\
  -d '{
    "startDate": "2024-10-01",
    "endDate": "2024-10-31", 
    "clientId": "5"
  }'`
};

/**
 * Expected response structures for Transaction API
 */
export const expectedResponseStructures = {
  // Paginated transactions response
  paginatedTransactions: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          transaction_type: 1,
          client_id: 1,
          widthdraw_charges: 5.00,
          transaction_amount: 1000.00,
          client_name: "John Doe",
          bank_name: "Bank of America",
          card_name: "Visa Card",
          bank_id: 1,
          card_id: 1,
          remark: "Monthly deposit",
          create_date: "2025-01-15T00:00:00.000Z",
          create_time: "14:30:00",
          modify_date: null,
          modify_time: null
        }
        // ... more transactions
      ],
      pagination: {
        current_page: 1,
        per_page: 50,
        total_count: 150,
        total_pages: 3,
        has_next_page: true,
        has_previous_page: false
      },
      filters_applied: {
        transaction_type: 1,
        min_amount: 100
      },
      search_applied: "john",
      sort_applied: {
        sort_by: "create_date",
        sort_order: "desc"
      }
    },
    code: "TRANSACTIONS_RETRIEVED",
    message: "Paginated transactions retrieved successfully"
  },

  // Transaction report response
  transactionReport: {
    success: true,
    data: {
      pdfContent: "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago..."
    },
    code: "REPORT_GENERATED_SUCCESS",
    message: "Transaction report generated successfully"
  }
};

/**
 * Response format examples for the Transaction API
 * This file demonstrates the consistent response structure across all endpoints
 */

// Success Response Examples
export const TRANSACTION_RESPONSE_EXAMPLES = {
    // GET /api/v1/transactions - Success
    GET_TRANSACTIONS_SUCCESS: {
        "success": true,
        "data": [
            {
                "id": 1,
                "transaction_type": 1,
                "client_id": 1,
                "widthdraw_charges": 5,
                "transaction_amount": 1000,
                "client_name": "John Doe",
                "bank_name": "Chase Bank",
                "card_name": "Credit Card",
                "bank_id": 1,
                "card_id": 1,
                "remark": "Monthly deposit",
                "create_date": "2024-01-01T00:00:00.000Z",
                "create_time": "10:30:00",
                "modify_date": null,
                "modify_time": null
            },
            {
                "id": 2,
                "transaction_type": 2,
                "client_id": 2,
                "widthdraw_charges": 10,
                "transaction_amount": 500,
                "client_name": "Jane Smith",
                "bank_name": "Wells Fargo",
                "card_name": null,
                "bank_id": 2,
                "card_id": null,
                "remark": "ATM withdrawal",
                "create_date": "2024-01-02T00:00:00.000Z",
                "create_time": "14:45:00",
                "modify_date": "2024-01-15T00:00:00.000Z",
                "modify_time": "09:20:00"
            }
        ],
        "successCode": "TRANSACTIONS_RETRIEVED",
        "message": "Transactions retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // GET /api/v1/transactions/:id - Success
    GET_TRANSACTION_BY_ID_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "transaction_type": 1,
            "client_id": 1,
            "widthdraw_charges": 5,
            "transaction_amount": 1000,
            "client_name": "John Doe",
            "bank_name": "Chase Bank",
            "card_name": "Credit Card",
            "bank_id": 1,
            "card_id": 1,
            "remark": "Monthly deposit",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTIONS_RETRIEVED",
        "message": "Transaction retrieved successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/transactions - Success
    CREATE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 3,
            "transaction_type": 1,
            "client_id": 3,
            "widthdraw_charges": 2,
            "transaction_amount": 2500,
            "client_name": "Rajesh Kumar",
            "bank_name": "Bank of America",
            "card_name": "Debit Card",
            "bank_id": 3,
            "card_id": 2,
            "remark": "Business deposit",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTION_CREATED",
        "message": "Transaction created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // POST /api/v1/transactions - Success (minimal data)
    CREATE_TRANSACTION_MINIMAL_SUCCESS: {
        "success": true,
        "data": {
            "id": 4,
            "transaction_type": 2,
            "client_id": 4,
            "widthdraw_charges": 0,
            "transaction_amount": 100,
            "client_name": "Anonymous Client",
            "bank_name": null,
            "card_name": null,
            "bank_id": null,
            "card_id": null,
            "remark": "",
            "create_date": "2024-10-04T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": null,
            "modify_time": null
        },
        "successCode": "TRANSACTION_CREATED",
        "message": "Transaction created successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 201
    },

    // PUT /api/v1/transactions - Success
    UPDATE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 1,
            "transaction_type": 1,
            "client_id": 1,
            "widthdraw_charges": 3,
            "transaction_amount": 1500,
            "client_name": "John Doe",
            "bank_name": "Chase Bank",
            "card_name": "Credit Card",
            "bank_id": 1,
            "card_id": 1,
            "remark": "Updated monthly deposit",
            "create_date": "2024-01-01T00:00:00.000Z",
            "create_time": "10:30:00",
            "modify_date": "2024-10-04T00:00:00.000Z",
            "modify_time": "10:30:00"
        },
        "successCode": "TRANSACTION_UPDATED",
        "message": "Transaction updated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // DELETE /api/v1/transactions - Success
    DELETE_TRANSACTION_SUCCESS: {
        "success": true,
        "data": {
            "id": 1
        },
        "successCode": "TRANSACTION_DELETED",
        "message": "Transaction deleted successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/transactions/report - Success (All Clients)
    GENERATE_REPORT_ALL_CLIENTS_SUCCESS: {
        "success": true,
        "data": {
            "pdfContent": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago..."
        },
        "successCode": "REPORT_GENERATED_SUCCESS",
        "message": "Transaction report generated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    },

    // POST /api/v1/transactions/report - Success (Specific Client)
    GENERATE_REPORT_SPECIFIC_CLIENT_SUCCESS: {
        "success": true,
        "data": {
            "pdfContent": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago..."
        },
        "successCode": "REPORT_GENERATED_SUCCESS", 
        "message": "Transaction report generated successfully",
        "timestamp": "2024-10-04T10:30:00.000Z",
        "statusCode": 200
    }
};

// Error Response Examples
export const TRANSACTION_ERROR_EXAMPLES = {
    // Validation Error - Missing required field
    VALIDATION_ERROR_MISSING_CLIENT_ID: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Client ID is required and must be a number",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "client_id",
                "value": undefined,
                "expected": "number"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - Invalid withdraw charges
    VALIDATION_ERROR_INVALID_CHARGES: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Withdraw charges must be between 0 and 100",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "widthdraw_charges",
                "value": 150,
                "expected": "number between 0 and 100"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - Invalid transaction amount
    VALIDATION_ERROR_INVALID_AMOUNT: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Transaction amount must be greater than 0",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "transaction_amount",
                "value": -100,
                "expected": "positive number"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "POST"
        }
    },

    // Validation Error - No fields to update
    VALIDATION_ERROR_NO_UPDATES: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "No fields to update",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "message": "At least one field must be provided for update"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "PUT"
        }
    },

    // Not Found Error
    NOT_FOUND_ERROR: {
        "success": false,
        "error": {
            "statusCode": 404,
            "message": "Transaction not found",
            "errorCode": "NOT_FOUND",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "PUT"
        }
    },

    // Database Error
    DATABASE_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to fetch transactions",
            "errorCode": "DATABASE_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions",
            "method": "GET"
        }
    },

    // Report Generation Errors
    REPORT_VALIDATION_ERROR_MISSING_DATES: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "Start date and end date are required",
            "errorCode": "VALIDATION_ERROR",
            "details": {
                "field": "dates",
                "value": { "startDate": null, "endDate": null },
                "expected": "Both startDate and endDate required"
            },
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions/report",
            "method": "POST"
        }
    },

    REPORT_NO_DATA_ERROR: {
        "success": false,
        "error": {
            "statusCode": 422,
            "message": "No transactions found for the specified criteria",
            "errorCode": "VALIDATION_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions/report",
            "method": "POST"
        }
    },

    REPORT_PDF_GENERATION_ERROR: {
        "success": false,
        "error": {
            "statusCode": 500,
            "message": "Failed to generate PDF report",
            "errorCode": "PDF_GENERATION_ERROR",
            "timestamp": "2024-10-04T10:30:00.000Z",
            "path": "/api/v1/transactions/report",
            "method": "POST"
        }
    }
};

// ========================
// PRACTICAL USAGE EXAMPLES
// ========================

/**
 * Frontend Integration Examples
 */
export const frontendIntegrationExamples = {
  // JavaScript fetch for paginated transactions
  fetchPaginatedTransactions: `
async function fetchTransactions(page = 1, filters = {}) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '50',
    ...filters
  });
  
  const response = await fetch(\`/api/v1/transactions/paginated?\${queryParams}\`);
  const data = await response.json();
  
  if (data.success) {
    return {
      transactions: data.data.data,
      pagination: data.data.pagination,
      hasMore: data.data.pagination.has_next_page
    };
  }
  throw new Error(data.error.message);
}

// Usage
const result = await fetchTransactions(1, {
  transaction_type: '1',
  search: 'john',
  sort_by: 'create_date'
});`,

  // JavaScript fetch for report generation
  generateReport: `
async function generateTransactionReport(startDate, endDate, clientId = null) {
  const response = await fetch('/api/v1/transactions/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      clientId
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Convert base64 to blob and download
    const pdfBlob = new Blob([
      Uint8Array.from(atob(data.data.pdfContent), c => c.charCodeAt(0))
    ], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`transaction-report-\${startDate}-to-\${endDate}.pdf\`;
    link.click();
    URL.revokeObjectURL(url);
    
    return data.data.pdfContent;
  }
  throw new Error(data.error.message);
}

// Usage
await generateTransactionReport('2024-01-01', '2024-12-31', '5');`,

  // React hook example
  reactHookExample: `
import { useState, useEffect } from 'react';

function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const result = await fetchTransactions(1, filters);
        setTransactions(result.transactions);
        setPagination(result.pagination);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadTransactions();
  }, [JSON.stringify(filters)]);

  return { transactions, loading, pagination, error };
}`
};

/**
 * PowerShell/Windows Examples
 */
export const powershellExamples = {
  // Get paginated transactions
  getPaginatedTransactions: `
# Basic pagination
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/transactions/paginated?page=1&limit=25" -Method GET

# With filters
$uri = "http://localhost:3000/api/v1/transactions/paginated?transaction_type=1&min_amount=100&search=john"
$response = Invoke-RestMethod -Uri $uri -Method GET

# Display results
$response.data.data | Format-Table id, client_name, transaction_amount, transaction_type`,

  // Generate report
  generateReport: `
# Generate report for all clients
$body = @{
    startDate = "2024-01-01"
    endDate = "2024-12-31"
    clientId = $null
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/transactions/report" -Method POST -Body $body -ContentType "application/json"

# Save PDF file
$pdfBytes = [System.Convert]::FromBase64String($response.data.pdfContent)
[System.IO.File]::WriteAllBytes("transaction-report.pdf", $pdfBytes)

Write-Host "Report saved as transaction-report.pdf"`
};

/**
 * Complete Test Scenarios
 */
export const testScenarios = {
  // Scenario 1: Dashboard data loading
  dashboardScenario: {
    description: "Load initial dashboard data with recent transactions",
    steps: [
      "1. Fetch first 10 most recent transactions",
      "2. Get transaction count for current month", 
      "3. Generate monthly report if needed"
    ],
    requests: [
      "GET /api/v1/transactions/paginated?page=1&limit=10&sort_by=create_date&sort_order=desc",
      "GET /api/v1/transactions/paginated?start_date=2024-11-01&end_date=2024-11-30&page=1&limit=1",
      "POST /api/v1/transactions/report (if report needed)"
    ]
  },

  // Scenario 2: Client-specific analysis
  clientAnalysisScenario: {
    description: "Analyze transactions for a specific client",
    steps: [
      "1. Filter transactions by client ID",
      "2. Sort by amount to see largest transactions",
      "3. Generate client-specific report"
    ],
    requests: [
      "GET /api/v1/transactions/paginated?client_ids=5&sort_by=transaction_amount&sort_order=desc",
      "POST /api/v1/transactions/report with clientId: '5'"
    ]
  },

  // Scenario 3: Infinite scroll implementation
  infiniteScrollScenario: {
    description: "Implement infinite scroll for transaction list",
    steps: [
      "1. Load initial page of transactions",
      "2. Check has_next_page flag",
      "3. Load subsequent pages as user scrolls",
      "4. Append new data to existing list"
    ],
    implementation: "Use pagination.has_next_page to determine if more data is available"
  }
};
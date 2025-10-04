/**
 * Example usage of the new paginated transactions API
 * This file demonstrates various use cases for the enhanced API
 */

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

/**
 * Expected response structure
 */
export const expectedResponseStructure = {
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
};
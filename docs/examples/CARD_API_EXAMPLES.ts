/**
 * Example usage of the new paginated cards API
 * This file demonstrates various use cases for the enhanced API
 */

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?page=1&limit=50',
  description: 'Get first 50 cards with default sorting (alphabetical by name)'
};

// Example 2: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?search=visa&sort_by=name&sort_order=asc',
  description: 'Search for "visa" in card names'
};

// Example 3: Sort by transaction count
export const sortByTransactionCountExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?sort_by=transaction_count&sort_order=desc',
  description: 'Get cards sorted by transaction count (most active first)'
};

// Example 4: Search with custom pagination
export const searchWithPaginationExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?page=2&limit=25&search=credit&sort_by=create_date&sort_order=desc',
  description: 'Search for "credit" cards with custom pagination and date sorting'
};

// Example 5: Sort by creation date
export const sortByDateExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?sort_by=create_date&sort_order=desc',
  description: 'Get newest cards first'
};

// Example 6: Search for card types
export const cardTypeSearchExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?search=master&sort_by=name&sort_order=asc',
  description: 'Search for MasterCard type cards'
};

// Example 7: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/cards/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};



/**
 * Expected response structure for cards
 */
export const expectedResponseStructure = {
  success: true,
  data: {
    data: [
      {
        id: 1,
        name: "Visa Credit Card",
        create_date: "2025-01-15T00:00:00.000Z",
        create_time: "14:30:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 25
      },
      {
        id: 2,
        name: "MasterCard Debit",
        create_date: "2025-01-10T00:00:00.000Z",
        create_time: "10:15:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 18
      }
      // ... more cards
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_count: 15,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false
    },
    search_applied: "visa",
    sort_applied: {
      sort_by: "name",
      sort_order: "asc"
    }
  },
  code: "CARDS_RETRIEVED",
  message: "Paginated cards retrieved successfully"
};

/**
 * Common search patterns for different use cases
 */
export const searchUseCase = {
  // Search by card brand
  visa: '/api/v1/cards/paginated?search=visa&sort_by=name',
  mastercard: '/api/v1/cards/paginated?search=master&sort_by=name',
  amex: '/api/v1/cards/paginated?search=american&sort_by=name',
  
  // Search by card type
  credit: '/api/v1/cards/paginated?search=credit&sort_by=transaction_count&sort_order=desc',
  debit: '/api/v1/cards/paginated?search=debit&sort_by=transaction_count&sort_order=desc',
  
  // Sort patterns
  mostActive: '/api/v1/cards/paginated?sort_by=transaction_count&sort_order=desc',
  leastActive: '/api/v1/cards/paginated?sort_by=transaction_count&sort_order=asc',
  newest: '/api/v1/cards/paginated?sort_by=create_date&sort_order=desc',
  oldest: '/api/v1/cards/paginated?sort_by=create_date&sort_order=asc',
  alphabetical: '/api/v1/cards/paginated?sort_by=name&sort_order=asc'
};
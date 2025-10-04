/**
 * Example usage of the new paginated clients API
 * This file demonstrates various use cases for the enhanced API
 */

// Example 1: Basic pagination (first page, 50 records)
export const basicPaginationExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=1&limit=50',
  description: 'Get first 50 clients with default sorting (alphabetical by name)'
};

// Example 2: Search functionality
export const searchExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?search=john&sort_by=name&sort_order=asc',
  description: 'Search for "john" in client name, email, contact, or address'
};

// Example 3: Sort by transaction count
export const sortByTransactionCountExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=transaction_count&sort_order=desc',
  description: 'Get clients sorted by transaction count (highest first)'
};

// Example 4: Search with custom pagination
export const searchWithPaginationExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=2&limit=25&search=gmail&sort_by=create_date&sort_order=desc',
  description: 'Search for "gmail" with custom pagination and date sorting'
};

// Example 5: Sort by email
export const sortByEmailExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=email&sort_order=asc',
  description: 'Get clients sorted by email address alphabetically'
};

// Example 6: Search for location
export const locationSearchExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?search=Mumbai&sort_by=name&sort_order=asc',
  description: 'Search for clients in Mumbai area'
};

// Example 7: Sort by creation date
export const sortByDateExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?sort_by=create_date&sort_order=desc',
  description: 'Get newest clients first'
};

// Example 8: Infinite scroll - next page
export const infiniteScrollExample = {
  method: 'GET',
  url: '/api/v1/clients/paginated?page=3&limit=50',
  description: 'Load page 3 for infinite scroll implementation'
};


/**
 * Expected response structure for clients
 */
export const expectedResponseStructure = {
  success: true,
  data: {
    data: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "9876543210",
        address: "123 Main Street, Mumbai",
        create_date: "2025-01-15T00:00:00.000Z",
        create_time: "14:30:00",
        modify_date: null,
        modify_time: null,
        transaction_count: 15
      }
      // ... more clients
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_count: 120,
      total_pages: 3,
      has_next_page: true,
      has_previous_page: false
    },
    search_applied: "john",
    sort_applied: {
      sort_by: "name",
      sort_order: "asc"
    }
  },
  code: "CLIENTS_RETRIEVED",
  message: "Paginated clients retrieved successfully"
};

/**
 * Filter examples for different use cases
 */
export const searchUseCase = {
  // Search by name
  byName: '/api/v1/clients/paginated?search=John&sort_by=name',
  
  // Search by email domain
  byEmailDomain: '/api/v1/clients/paginated?search=gmail.com&sort_by=email',
  
  // Search by contact (partial)
  byContact: '/api/v1/clients/paginated?search=987&sort_by=contact',
  
  // Search by location
  byLocation: '/api/v1/clients/paginated?search=Mumbai&sort_by=name',
  
  // Search with sorting by transaction count
  activeClients: '/api/v1/clients/paginated?search=&sort_by=transaction_count&sort_order=desc',
  
  // Search new clients
  newClients: '/api/v1/clients/paginated?sort_by=create_date&sort_order=desc&limit=20'
};
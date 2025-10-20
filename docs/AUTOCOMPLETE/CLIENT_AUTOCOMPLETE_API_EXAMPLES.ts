/**
 * Example responses for Client Autocomplete API
 * These examples demonstrate various scenarios and response formats
 */

// Basic request without search term
export const CLIENT_AUTOCOMPLETE_NO_SEARCH = {
  request: {
    url: '/api/v1/clients/autocomplete?limit=5',
    method: 'GET',
    query: {
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "Alice Johnson"
        },
        {
          id: 2,
          name: "Bob Smith"
        },
        {
          id: 3,
          name: "Charlie Brown"
        },
        {
          id: 4,
          name: "Diana Prince"
        },
        {
          id: 5,
          name: "Edward Wilson"
        }
      ],
      search_query: "",
      result_count: 5,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};

// Search request with results
export const CLIENT_AUTOCOMPLETE_WITH_SEARCH = {
  request: {
    url: '/api/v1/clients/autocomplete?search=john&limit=3',
    method: 'GET',
    query: {
      search: 'john',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "John Doe" // Exact match - highest priority
        },
        {
          id: 5,
          name: "Johnny Smith" // Starts with - medium priority
        },
        {
          id: 8,
          name: "Alice Johnson" // Contains - lowest priority
        }
      ],
      search_query: "john",
      result_count: 3,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};

// Search request with no results
export const CLIENT_AUTOCOMPLETE_NO_RESULTS = {
  request: {
    url: '/api/v1/clients/autocomplete?search=xyz123&limit=5',
    method: 'GET',
    query: {
      search: 'xyz123',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [],
      search_query: "xyz123",
      result_count: 0,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};

// Case-insensitive search example
export const CLIENT_AUTOCOMPLETE_CASE_INSENSITIVE = {
  request: {
    url: '/api/v1/clients/autocomplete?search=ALICE&limit=3',
    method: 'GET',
    query: {
      search: 'ALICE',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 2,
          name: "Alice Johnson"
        },
        {
          id: 15,
          name: "Alice Brown"
        }
      ],
      search_query: "ALICE",
      result_count: 2,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};

// Validation error example - limit too high
export const CLIENT_AUTOCOMPLETE_VALIDATION_ERROR = {
  request: {
    url: '/api/v1/clients/autocomplete?limit=15',
    method: 'GET',
    query: {
      limit: 15
    }
  },
  response: {
    success: false,
    error: {
      statusCode: 422,
      message: "Limit must be a number between 1 and 10",
      errorCode: "VALIDATION_ERROR",
      timestamp: "2025-10-04T07:09:21.562Z",
      path: "/api/v1/clients/autocomplete?limit=15",
      method: "GET"
    }
  }
};

// Minimum limit example
export const CLIENT_AUTOCOMPLETE_MIN_LIMIT = {
  request: {
    url: '/api/v1/clients/autocomplete?search=test&limit=1',
    method: 'GET',
    query: {
      search: 'test',
      limit: 1
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 10,
          name: "Test User"
        }
      ],
      search_query: "test",
      result_count: 1,
      limit_applied: 1
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};

// Maximum limit example
export const CLIENT_AUTOCOMPLETE_MAX_LIMIT = {
  request: {
    url: '/api/v1/clients/autocomplete?limit=10',
    method: 'GET',
    query: {
      limit: 10
    }
  },
  response: {
    success: true,
    data: {
      data: [
        { id: 1, name: "Alice Johnson" },
        { id: 2, name: "Bob Smith" },
        { id: 3, name: "Charlie Brown" },
        { id: 4, name: "Diana Prince" },
        { id: 5, name: "Edward Wilson" },
        { id: 6, name: "Frank Miller" },
        { id: 7, name: "Grace Lee" },
        { id: 8, name: "Henry Davis" },
        { id: 9, name: "Ivy Chen" },
        { id: 10, name: "Jack Wilson" }
      ],
      search_query: "",
      result_count: 10,
      limit_applied: 10
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Clients autocomplete data retrieved successfully"
  }
};
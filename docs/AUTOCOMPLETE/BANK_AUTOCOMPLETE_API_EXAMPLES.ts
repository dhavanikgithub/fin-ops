/**
 * Example responses for Bank Autocomplete API
 * These examples demonstrate various scenarios and response formats
 */

// Basic request without search term
export const BANK_AUTOCOMPLETE_NO_SEARCH = {
  request: {
    url: '/api/v1/banks/autocomplete?limit=5',
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
          name: "HDFC Bank"
        },
        {
          id: 2,
          name: "ICICI Bank"
        },
        {
          id: 3,
          name: "State Bank of India"
        },
        {
          id: 4,
          name: "Axis Bank"
        },
        {
          id: 5,
          name: "Kotak Mahindra Bank"
        }
      ],
      search_query: "",
      result_count: 5,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// Search request with priority matching
export const BANK_AUTOCOMPLETE_WITH_SEARCH = {
  request: {
    url: '/api/v1/banks/autocomplete?search=hdfc&limit=3',
    method: 'GET',
    query: {
      search: 'hdfc',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "HDFC Bank" // Starts with - highest priority for this search
        },
        {
          id: 10,
          name: "HDFC Corporate Bank" // Starts with - same priority
        },
        {
          id: 15,
          name: "Yes Bank HDFC Branch" // Contains - lower priority
        }
      ],
      search_query: "hdfc",
      result_count: 3,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// Partial search example
export const BANK_AUTOCOMPLETE_PARTIAL_SEARCH = {
  request: {
    url: '/api/v1/banks/autocomplete?search=SBI&limit=5',
    method: 'GET',
    query: {
      search: 'SBI',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 3,
          name: "State Bank of India"
        }
      ],
      search_query: "SBI",
      result_count: 1,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// Case-insensitive search example
export const BANK_AUTOCOMPLETE_CASE_INSENSITIVE = {
  request: {
    url: '/api/v1/banks/autocomplete?search=AXIS&limit=3',
    method: 'GET',
    query: {
      search: 'AXIS',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 4,
          name: "Axis Bank"
        },
        {
          id: 12,
          name: "Axis Corporate Bank"
        }
      ],
      search_query: "AXIS",
      result_count: 2,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// No results found
export const BANK_AUTOCOMPLETE_NO_RESULTS = {
  request: {
    url: '/api/v1/banks/autocomplete?search=nonexistent&limit=5',
    method: 'GET',
    query: {
      search: 'nonexistent',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [],
      search_query: "nonexistent",
      result_count: 0,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// Validation error - limit too high
export const BANK_AUTOCOMPLETE_VALIDATION_ERROR = {
  request: {
    url: '/api/v1/banks/autocomplete?limit=15',
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
      path: "/api/v1/banks/autocomplete?limit=15",
      method: "GET"
    }
  }
};

// Single character search
export const BANK_AUTOCOMPLETE_SINGLE_CHAR = {
  request: {
    url: '/api/v1/banks/autocomplete?search=H&limit=5',
    method: 'GET',
    query: {
      search: 'H',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "HDFC Bank"
        },
        {
          id: 10,
          name: "HDFC Corporate Bank"
        }
      ],
      search_query: "H",
      result_count: 2,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};

// Default limit example (when limit not specified)
export const BANK_AUTOCOMPLETE_DEFAULT_LIMIT = {
  request: {
    url: '/api/v1/banks/autocomplete?search=bank',
    method: 'GET',
    query: {
      search: 'bank'
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "HDFC Bank"
        },
        {
          id: 2,
          name: "ICICI Bank"
        },
        {
          id: 3,
          name: "State Bank of India"
        },
        {
          id: 4,
          name: "Axis Bank"
        },
        {
          id: 5,
          name: "Kotak Mahindra Bank"
        }
      ],
      search_query: "bank",
      result_count: 5,
      limit_applied: 5 // Default limit applied
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Banks autocomplete data retrieved successfully"
  }
};
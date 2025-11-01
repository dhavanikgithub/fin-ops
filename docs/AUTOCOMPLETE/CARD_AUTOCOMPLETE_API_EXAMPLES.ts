/**
 * Example responses for Card Autocomplete API
 * These examples demonstrate various scenarios and response formats
 */

// Basic request without search term
export const CARD_AUTOCOMPLETE_NO_SEARCH = {
  request: {
    url: '/api/v1/cards/autocomplete?limit=5',
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
          name: "Visa Credit Card"
        },
        {
          id: 2,
          name: "MasterCard Debit"
        },
        {
          id: 3,
          name: "American Express Gold"
        },
        {
          id: 4,
          name: "Rupay Platinum"
        },
        {
          id: 5,
          name: "Discover Card"
        }
      ],
      search_query: "",
      result_count: 5,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Search request with priority matching
export const CARD_AUTOCOMPLETE_WITH_SEARCH = {
  request: {
    url: '/api/v1/cards/autocomplete?search=visa&limit=3',
    method: 'GET',
    query: {
      search: 'visa',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "Visa Credit Card" // Starts with - highest priority
        },
        {
          id: 8,
          name: "Visa Debit Card" // Starts with - same priority
        },
        {
          id: 12,
          name: "HDFC Visa Signature" // Contains - lower priority
        }
      ],
      search_query: "visa",
      result_count: 3,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Exact match example
export const CARD_AUTOCOMPLETE_EXACT_MATCH = {
  request: {
    url: '/api/v1/cards/autocomplete?search=Rupay&limit=5',
    method: 'GET',
    query: {
      search: 'Rupay',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 6,
          name: "Rupay" // Exact match - highest priority
        },
        {
          id: 4,
          name: "Rupay Platinum" // Starts with - medium priority
        },
        {
          id: 15,
          name: "HDFC Rupay Select" // Contains - lowest priority
        }
      ],
      search_query: "Rupay",
      result_count: 3,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Partial search example
export const CARD_AUTOCOMPLETE_PARTIAL_SEARCH = {
  request: {
    url: '/api/v1/cards/autocomplete?search=master&limit=3',
    method: 'GET',
    query: {
      search: 'master',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 2,
          name: "MasterCard Debit"
        },
        {
          id: 9,
          name: "MasterCard Credit"
        },
        {
          id: 14,
          name: "MasterCard World Elite"
        }
      ],
      search_query: "master",
      result_count: 3,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Case-insensitive search example
export const CARD_AUTOCOMPLETE_CASE_INSENSITIVE = {
  request: {
    url: '/api/v1/cards/autocomplete?search=AMEX&limit=3',
    method: 'GET',
    query: {
      search: 'AMEX',
      limit: 3
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 11,
          name: "American Express Platinum"
        }
      ],
      search_query: "AMEX",
      result_count: 1,
      limit_applied: 3
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// No results found
export const CARD_AUTOCOMPLETE_NO_RESULTS = {
  request: {
    url: '/api/v1/cards/autocomplete?search=bitcoin&limit=5',
    method: 'GET',
    query: {
      search: 'bitcoin',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [],
      search_query: "bitcoin",
      result_count: 0,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Validation error - invalid limit
export const CARD_AUTOCOMPLETE_VALIDATION_ERROR = {
  request: {
    url: '/api/v1/cards/autocomplete?limit=0',
    method: 'GET',
    query: {
      limit: 0
    }
  },
  response: {
    success: false,
    error: {
      statusCode: 422,
      message: "Limit must be a number between 1 and 10",
      errorCode: "VALIDATION_ERROR",
      timestamp: "2025-10-04T07:09:21.562Z",
      path: "/api/v1/cards/autocomplete?limit=0",
      method: "GET"
    }
  }
};

// Maximum limit example
export const CARD_AUTOCOMPLETE_MAX_LIMIT = {
  request: {
    url: '/api/v1/cards/autocomplete?limit=10',
    method: 'GET',
    query: {
      limit: 10
    }
  },
  response: {
    success: true,
    data: {
      data: [
        { id: 1, name: "Visa Credit Card" },
        { id: 2, name: "MasterCard Debit" },
        { id: 3, name: "American Express Gold" },
        { id: 4, name: "Rupay Platinum" },
        { id: 5, name: "Discover Card" },
        { id: 6, name: "Diners Club" },
        { id: 7, name: "JCB Card" },
        { id: 8, name: "Visa Debit Card" },
        { id: 9, name: "MasterCard Credit" },
        { id: 10, name: "American Express Platinum" }
      ],
      search_query: "",
      result_count: 10,
      limit_applied: 10
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Short search term example
export const CARD_AUTOCOMPLETE_SHORT_TERM = {
  request: {
    url: '/api/v1/cards/autocomplete?search=vi&limit=5',
    method: 'GET',
    query: {
      search: 'vi',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "Visa Credit Card"
        },
        {
          id: 8,
          name: "Visa Debit Card"
        }
      ],
      search_query: "vi",
      result_count: 2,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};

// Special characters in search
export const CARD_AUTOCOMPLETE_SPECIAL_CHARS = {
  request: {
    url: '/api/v1/cards/autocomplete?search=card&limit=5',
    method: 'GET',
    query: {
      search: 'card',
      limit: 5
    }
  },
  response: {
    success: true,
    data: {
      data: [
        {
          id: 1,
          name: "Visa Credit Card"
        },
        {
          id: 5,
          name: "Discover Card"
        },
        {
          id: 7,
          name: "JCB Card"
        },
        {
          id: 8,
          name: "Visa Debit Card"
        },
        {
          id: 9,
          name: "MasterCard Credit"
        }
      ],
      search_query: "card",
      result_count: 5,
      limit_applied: 5
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:09:16.007Z",
    statusCode: 200,
    message: "Cards autocomplete data retrieved successfully"
  }
};
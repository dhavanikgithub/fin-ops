/**
 * Example responses for Report Preview API
 * These examples demonstrate various scenarios for transaction export estimation
 */

// Basic report preview without filters
export const REPORT_PREVIEW_NO_FILTERS = {
  request: {
    url: '/api/v1/transactions/report-preview?format=CSV',
    method: 'GET',
    query: {
      format: 'CSV'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 248,
      estimated_size: "~120 KB",
      estimated_size_bytes: 122880,
      format: "CSV",
      filters_applied: {},
      selected_fields: [
        "client_name",
        "bank_name", 
        "card_name",
        "transaction_amount",
        "transaction_type",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 110,
        field_overhead: 7,
        format_overhead: 25,
        compression_factor: 0.8
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Report preview with date range filter
export const REPORT_PREVIEW_DATE_FILTER = {
  request: {
    url: '/api/v1/transactions/report-preview?start_date=2025-09-01&end_date=2025-09-30&format=Excel',
    method: 'GET',
    query: {
      start_date: '2025-09-01',
      end_date: '2025-09-30',
      format: 'Excel'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 86,
      estimated_size: "~45 KB",
      estimated_size_bytes: 46080,
      format: "Excel",
      filters_applied: {
        start_date: "2025-09-01",
        end_date: "2025-09-30"
      },
      selected_fields: [
        "client_name",
        "bank_name",
        "card_name", 
        "transaction_amount",
        "transaction_type",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 110,
        field_overhead: 62,
        format_overhead: 1024,
        compression_factor: 0.6
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Report preview with multiple filters
export const REPORT_PREVIEW_MULTIPLE_FILTERS = {
  request: {
    url: '/api/v1/transactions/report-preview?transaction_type=1&min_amount=100&max_amount=5000&client_ids=1&client_ids=2&format=JSON',
    method: 'GET',
    query: {
      transaction_type: 1,
      min_amount: 100,
      max_amount: 5000,
      client_ids: [1, 2],
      format: 'JSON'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 45,
      estimated_size: "~28 KB",
      estimated_size_bytes: 28672,
      format: "JSON",
      filters_applied: {
        transaction_type: 1,
        min_amount: 100,
        max_amount: 5000,
        client_ids: [1, 2]
      },
      selected_fields: [
        "client_name",
        "bank_name",
        "card_name",
        "transaction_amount", 
        "transaction_type",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 110,
        field_overhead: 68,
        format_overhead: 50,
        compression_factor: 0.9
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Report preview with search filter
export const REPORT_PREVIEW_WITH_SEARCH = {
  request: {
    url: '/api/v1/transactions/report-preview?search=HDFC&format=PDF',
    method: 'GET',
    query: {
      search: 'HDFC',
      format: 'PDF'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 12,
      estimated_size: "~8.5 KB",
      estimated_size_bytes: 8704,
      format: "PDF",
      filters_applied: {},
      search_applied: "HDFC",
      selected_fields: [
        "client_name",
        "bank_name",
        "card_name",
        "transaction_amount",
        "transaction_type",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 110,
        field_overhead: 120,
        format_overhead: 5000,
        compression_factor: 0.95
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Report preview with custom fields
export const REPORT_PREVIEW_CUSTOM_FIELDS = {
  request: {
    url: '/api/v1/transactions/report-preview?fields=client_name&fields=transaction_amount&fields=create_date&format=CSV',
    method: 'GET',
    query: {
      fields: ['client_name', 'transaction_amount', 'create_date'],
      format: 'CSV'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 248,
      estimated_size: "~65 KB",
      estimated_size_bytes: 66560,
      format: "CSV",
      filters_applied: {},
      selected_fields: [
        "client_name",
        "transaction_amount",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 57,
        field_overhead: 4,
        format_overhead: 40,
        compression_factor: 0.8
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Report preview with no results
export const REPORT_PREVIEW_NO_RESULTS = {
  request: {
    url: '/api/v1/transactions/report-preview?search=nonexistent&format=CSV',
    method: 'GET',
    query: {
      search: 'nonexistent',
      format: 'CSV'
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 0,
      estimated_size: "~25 B",
      estimated_size_bytes: 25,
      format: "CSV",
      filters_applied: {},
      search_applied: "nonexistent",
      selected_fields: [
        "client_name",
        "bank_name",
        "card_name",
        "transaction_amount",
        "transaction_type",
        "create_date"
      ],
      preview_calculation: {
        base_size_per_row: 110,
        field_overhead: 7,
        format_overhead: 25,
        compression_factor: 0.8
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Large dataset example
export const REPORT_PREVIEW_LARGE_DATASET = {
  request: {
    url: '/api/v1/transactions/report-preview?format=Excel&fields=client_name&fields=bank_name&fields=card_name&fields=transaction_amount&fields=transaction_type&fields=create_date&fields=remark&fields=widthdraw_charges',
    method: 'GET',
    query: {
      format: 'Excel',
      fields: [
        'client_name', 'bank_name', 'card_name', 'transaction_amount',
        'transaction_type', 'create_date', 'remark', 'widthdraw_charges'
      ]
    }
  },
  response: {
    success: true,
    data: {
      estimated_rows: 1250,
      estimated_size: "~2.1 MB",
      estimated_size_bytes: 2202112,
      format: "Excel",
      filters_applied: {},
      selected_fields: [
        "client_name",
        "bank_name",
        "card_name",
        "transaction_amount",
        "transaction_type",
        "create_date",
        "remark",
        "widthdraw_charges"
      ],
      preview_calculation: {
        base_size_per_row: 174,
        field_overhead: 66,
        format_overhead: 1024,
        compression_factor: 0.6
      }
    },
    successCode: "DATA_RETRIEVED",
    timestamp: "2025-10-04T07:15:30.123Z",
    statusCode: 200,
    message: "Report preview generated successfully"
  }
};

// Validation error examples
export const REPORT_PREVIEW_VALIDATION_ERROR_FORMAT = {
  request: {
    url: '/api/v1/transactions/report-preview?format=XML',
    method: 'GET',
    query: {
      format: 'XML'
    }
  },
  response: {
    success: false,
    error: {
      statusCode: 422,
      message: "Format must be one of: CSV, Excel, JSON, PDF",
      errorCode: "VALIDATION_ERROR",
      timestamp: "2025-10-04T07:15:30.123Z",
      path: "/api/v1/transactions/report-preview?format=XML",
      method: "GET"
    }
  }
};

export const REPORT_PREVIEW_VALIDATION_ERROR_FIELDS = {
  request: {
    url: '/api/v1/transactions/report-preview?fields=invalid_field',
    method: 'GET',
    query: {
      fields: ['invalid_field']
    }
  },
  response: {
    success: false,
    error: {
      statusCode: 422,
      message: "Invalid fields: invalid_field. Valid fields are: client_name, bank_name, card_name, transaction_amount, transaction_type, create_date, create_time, remark, widthdraw_charges",
      errorCode: "VALIDATION_ERROR",
      timestamp: "2025-10-04T07:15:30.123Z", 
      path: "/api/v1/transactions/report-preview?fields=invalid_field",
      method: "GET"
    }
  }
};

export const REPORT_PREVIEW_VALIDATION_ERROR_AMOUNT_RANGE = {
  request: {
    url: '/api/v1/transactions/report-preview?min_amount=1000&max_amount=500',
    method: 'GET',
    query: {
      min_amount: 1000,
      max_amount: 500
    }
  },
  response: {
    success: false,
    error: {
      statusCode: 422,
      message: "Minimum amount cannot be greater than maximum amount",
      errorCode: "VALIDATION_ERROR",
      timestamp: "2025-10-04T07:15:30.123Z",
      path: "/api/v1/transactions/report-preview?min_amount=1000&max_amount=500",
      method: "GET"
    }
  }
};
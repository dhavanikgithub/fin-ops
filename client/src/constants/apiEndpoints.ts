/**
 * Centralized API Endpoints Configuration
 * All API endpoint strings are defined here for better maintainability
 */

// Base API configuration
export const API_CONFIG = {
    BASE_URL: '/api/v1',
    BASE_URL_V2: '/api/v2',
    VERSION: 'v1',
    VERSION_V2: 'v2'
} as const;

// Transaction Endpoints
export const TRANSACTION_ENDPOINTS = {
    PAGINATED: `${API_CONFIG.BASE_URL}/transactions/paginated`,
    CREATE: `${API_CONFIG.BASE_URL}/transactions`,
    EDIT: `${API_CONFIG.BASE_URL}/transactions`,
    DELETE: `${API_CONFIG.BASE_URL}/transactions`,
    REPORT: `${API_CONFIG.BASE_URL}/transactions/report`,
    EXPORT: `${API_CONFIG.BASE_URL}/reports/export`,
    REPORT_PREVIEW: `${API_CONFIG.BASE_URL}/reports/report-preview`,
} as const;

// Bank Endpoints
export const BANK_ENDPOINTS = {
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL}/banks/autocomplete`,
    PAGINATED: `${API_CONFIG.BASE_URL}/banks/paginated`,
    CREATE: `${API_CONFIG.BASE_URL}/banks`,
    UPDATE: `${API_CONFIG.BASE_URL}/banks`,
    DELETE: `${API_CONFIG.BASE_URL}/banks`,
    GET_BY_ID: `${API_CONFIG.BASE_URL}/banks`,
} as const;

// Card Endpoints
export const CARD_ENDPOINTS = {
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL}/cards/autocomplete`,
    PAGINATED: `${API_CONFIG.BASE_URL}/cards/paginated`,
    CREATE: `${API_CONFIG.BASE_URL}/cards`,
    UPDATE: `${API_CONFIG.BASE_URL}/cards`,
    DELETE: `${API_CONFIG.BASE_URL}/cards`,
    GET_BY_ID: `${API_CONFIG.BASE_URL}/cards`,
} as const;

// Client Endpoints
export const CLIENT_ENDPOINTS = {
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL}/clients/autocomplete`,
    PAGINATED: `${API_CONFIG.BASE_URL}/clients/paginated`,
    CREATE: `${API_CONFIG.BASE_URL}/clients`,
    UPDATE: `${API_CONFIG.BASE_URL}/clients`,
    DELETE: `${API_CONFIG.BASE_URL}/clients`,
    GET_BY_ID: `${API_CONFIG.BASE_URL}/clients`,
    GET_BY_NAME: `${API_CONFIG.BASE_URL}/clients/name`,
} as const;

// Health Check Endpoints
export const HEALTH_ENDPOINTS = {
    HEALTH: `${API_CONFIG.BASE_URL}/health`,
} as const;

// Finkeda Settings Endpoints
export const FINKEDA_SETTINGS_ENDPOINTS = {
    GET_LATEST: `${API_CONFIG.BASE_URL}/finkeda-settings`,
    UPDATE: `${API_CONFIG.BASE_URL}/finkeda-settings`,
    HISTORY: `${API_CONFIG.BASE_URL}/finkeda-settings/history`,
} as const;

// ===== V2 API ENDPOINTS (Profiler Feature) =====

// Profiler Client Endpoints (V2)
export const PROFILER_CLIENT_ENDPOINTS = {
    BASE: `${API_CONFIG.BASE_URL_V2}/profiler/clients`,
    PAGINATED: `${API_CONFIG.BASE_URL_V2}/profiler/clients/paginated`,
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL_V2}/profiler/clients/autocomplete`,
    GET_BY_ID: (id: number) => `${API_CONFIG.BASE_URL_V2}/profiler/clients/${id}`,
    CREATE: `${API_CONFIG.BASE_URL_V2}/profiler/clients`,
    UPDATE: `${API_CONFIG.BASE_URL_V2}/profiler/clients`,
    DELETE: `${API_CONFIG.BASE_URL_V2}/profiler/clients`,
} as const;

// Profiler Bank Endpoints (V2)
export const PROFILER_BANK_ENDPOINTS = {
    BASE: `${API_CONFIG.BASE_URL_V2}/profiler/banks`,
    PAGINATED: `${API_CONFIG.BASE_URL_V2}/profiler/banks/paginated`,
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL_V2}/profiler/banks/autocomplete`,
    GET_BY_ID: (id: number) => `${API_CONFIG.BASE_URL_V2}/profiler/banks/${id}`,
    CREATE: `${API_CONFIG.BASE_URL_V2}/profiler/banks`,
    UPDATE: `${API_CONFIG.BASE_URL_V2}/profiler/banks`,
    DELETE: `${API_CONFIG.BASE_URL_V2}/profiler/banks`,
} as const;

// Profiler Profile Endpoints (V2)
export const PROFILER_PROFILE_ENDPOINTS = {
    BASE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles`,
    PAGINATED: `${API_CONFIG.BASE_URL_V2}/profiler/profiles/paginated`,
    DASHBOARD: `${API_CONFIG.BASE_URL_V2}/profiler/profiles/dashboard`,
    AUTOCOMPLETE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles/autocomplete`,
    GET_BY_ID: (id: number) => `${API_CONFIG.BASE_URL_V2}/profiler/profiles/${id}`,
    GET_BY_CLIENT: (clientId: number) => `${API_CONFIG.BASE_URL_V2}/profiler/profiles/client/${clientId}`,
    CREATE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles`,
    UPDATE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles`,
    MARK_DONE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles/mark-done`,
    DELETE: `${API_CONFIG.BASE_URL_V2}/profiler/profiles`,
} as const;

// Profiler Transaction Endpoints (V2)
export const PROFILER_TRANSACTION_ENDPOINTS = {
    BASE: `${API_CONFIG.BASE_URL_V2}/profiler/transactions`,
    PAGINATED: `${API_CONFIG.BASE_URL_V2}/profiler/transactions/paginated`,
    GET_BY_ID: (id: number) => `${API_CONFIG.BASE_URL_V2}/profiler/transactions/${id}`,
    GET_BY_PROFILE: (profileId: number) => `${API_CONFIG.BASE_URL_V2}/profiler/transactions/profile/${profileId}`,
    GET_SUMMARY: (profileId: number) => `${API_CONFIG.BASE_URL_V2}/profiler/transactions/profile/${profileId}/summary`,
    EXPORT_PDF: (profileId: number) => `${API_CONFIG.BASE_URL_V2}/profiler/transactions/profile/${profileId}/export-pdf`,
    CREATE_DEPOSIT: `${API_CONFIG.BASE_URL_V2}/profiler/transactions/deposit`,
    CREATE_WITHDRAW: `${API_CONFIG.BASE_URL_V2}/profiler/transactions/withdraw`,
    DELETE: `${API_CONFIG.BASE_URL_V2}/profiler/transactions`,
} as const;

// Export all endpoints as a single object for convenience
export const API_ENDPOINTS = {
    TRANSACTION: TRANSACTION_ENDPOINTS,
    BANK: BANK_ENDPOINTS,
    CARD: CARD_ENDPOINTS,
    CLIENT: CLIENT_ENDPOINTS,
    HEALTH: HEALTH_ENDPOINTS,
    FINKEDA_SETTINGS: FINKEDA_SETTINGS_ENDPOINTS,
    // V2 Profiler Endpoints
    PROFILER_CLIENT: PROFILER_CLIENT_ENDPOINTS,
    PROFILER_BANK: PROFILER_BANK_ENDPOINTS,
    PROFILER_PROFILE: PROFILER_PROFILE_ENDPOINTS,
    PROFILER_TRANSACTION: PROFILER_TRANSACTION_ENDPOINTS,
} as const;

// Type definitions for endpoint parameters
export type EndpointParams = {
    id?: number;
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
};

// Helper function to build query strings
export const buildQueryString = (params: Record<string, any>): string => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(item => queryParams.append(key, item.toString()));
            } else {
                queryParams.append(key, value.toString());
            }
        }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
};

// Helper function to build complete URLs with query parameters
export const buildEndpointUrl = (endpoint: string, params?: Record<string, any>): string => {
    if (!params) return endpoint;
    const queryString = buildQueryString(params);
    return `${endpoint}${queryString}`;
};
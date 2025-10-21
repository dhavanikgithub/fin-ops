/**
 * Centralized API Endpoints Configuration
 * All API endpoint strings are defined here for better maintainability
 */

// Base API configuration
export const API_CONFIG = {
    BASE_URL: '/api/v1',
    VERSION: 'v1'
} as const;

// Transaction Endpoints
export const TRANSACTION_ENDPOINTS = {
    PAGINATED: `${API_CONFIG.BASE_URL}/transactions/paginated`,
    CREATE: `${API_CONFIG.BASE_URL}/transactions`,
    EDIT: `${API_CONFIG.BASE_URL}/transactions`,
    DELETE: `${API_CONFIG.BASE_URL}/transactions`,
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


// Export all endpoints as a single object for convenience
export const API_ENDPOINTS = {
    TRANSACTION: TRANSACTION_ENDPOINTS,
    BANK: BANK_ENDPOINTS,
    CARD: CARD_ENDPOINTS,
    CLIENT: CLIENT_ENDPOINTS
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
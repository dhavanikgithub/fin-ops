import { FilterValues } from '../components/TransactionFilterModal';
import { TransactionFilters } from '../services/transactionService';

/**
 * Convert UI filter values to API transaction filters
 */
export const convertUIFiltersToAPI = (uiFilters: FilterValues): TransactionFilters => {
    const apiFilters: TransactionFilters = {};

    // Convert transaction types
    if (uiFilters.types.length > 0) {
        // Assuming: 'deposit' = 1, 'withdraw' = 0
        const typeMap: { [key: string]: number } = {
            'deposit': 1,
            'withdraw': 0
        };
        
        if (uiFilters.types.length === 1) {
            apiFilters.transaction_type = typeMap[uiFilters.types[0]];
        }
        // If both types are selected, don't set transaction_type filter
    }

    // Convert amount filters
    if (uiFilters.minAmount) {
        apiFilters.min_amount = parseFloat(uiFilters.minAmount);
    }
    if (uiFilters.maxAmount) {
        apiFilters.max_amount = parseFloat(uiFilters.maxAmount);
    }

    // Convert date filters
    if (uiFilters.startDate) {
        apiFilters.start_date = uiFilters.startDate;
    }
    if (uiFilters.endDate) {
        apiFilters.end_date = uiFilters.endDate;
    }

    // For now, we'll store the string values for banks, cards, and clients
    // In a real implementation, you would need to convert these to IDs
    // by fetching from the API or maintaining a lookup table
    
    // Note: These would need to be converted to ID arrays in a real implementation
    if (uiFilters.banks.length > 0) {
        apiFilters.bank_ids = uiFilters.banks.map((item) => item.value); // Assuming item has a 'value' property with the ID
    }
    if (uiFilters.cards.length > 0) {
        apiFilters.card_ids = uiFilters.cards.map((item) => item.value); // Assuming item has a 'value' property with the ID
    }
    if (uiFilters.clients.length > 0) {
        apiFilters.client_ids = uiFilters.clients.map((item) => item.value); // Assuming item has a 'value' property with the ID
    }

    return apiFilters;
};

/**
 * Convert API filters back to UI filter format
 */
export const convertAPIFiltersToUI = (apiFilters: TransactionFilters): FilterValues => {
    const uiFilters: FilterValues = {
        types: [],
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        banks: [],
        cards: [],
        clients: []
    };

    // Convert transaction type
    if (apiFilters.transaction_type !== undefined) {
        const typeMap: { [key: number]: string } = {
            0: 'withdraw',
            1: 'deposit'
        };
        
        const type = typeMap[apiFilters.transaction_type];
        if (type) {
            uiFilters.types = [type];
        }
    }

    // Convert amounts
    if (apiFilters.min_amount !== undefined) {
        uiFilters.minAmount = apiFilters.min_amount.toString();
    }
    if (apiFilters.max_amount !== undefined) {
        uiFilters.maxAmount = apiFilters.max_amount.toString();
    }

    // Convert dates
    if (apiFilters.start_date) {
        uiFilters.startDate = apiFilters.start_date;
    }
    if (apiFilters.end_date) {
        uiFilters.endDate = apiFilters.end_date;
    }

    return uiFilters;
};

/**
 * Check if two filter objects are equal
 */
export const areFiltersEqual = (filters1: FilterValues, filters2: FilterValues): boolean => {
    return (
        JSON.stringify(filters1.types.sort()) === JSON.stringify(filters2.types.sort()) &&
        filters1.minAmount === filters2.minAmount &&
        filters1.maxAmount === filters2.maxAmount &&
        filters1.startDate === filters2.startDate &&
        filters1.endDate === filters2.endDate &&
        JSON.stringify(filters1.banks.sort()) === JSON.stringify(filters2.banks.sort()) &&
        JSON.stringify(filters1.cards.sort()) === JSON.stringify(filters2.cards.sort()) &&
        JSON.stringify(filters1.clients.sort()) === JSON.stringify(filters2.clients.sort())
    );
};

/**
 * Check if filters are empty/default
 */
export const areFiltersEmpty = (filters: FilterValues): boolean => {
    return (
        filters.types.length === 0 &&
        !filters.minAmount &&
        !filters.maxAmount &&
        !filters.startDate &&
        !filters.endDate &&
        filters.banks.length === 0 &&
        filters.cards.length === 0 &&
        filters.clients.length === 0
    );
};

/**
 * Get count of active filters
 */
export const getActiveFilterCount = (filters: FilterValues): number => {
    let count = 0;
    
    if (filters.types.length > 0) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.banks.length > 0) count++;
    if (filters.cards.length > 0) count++;
    if (filters.clients.length > 0) count++;
    
    return count;
};
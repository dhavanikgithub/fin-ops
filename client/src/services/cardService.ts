import api from './api';
import { CARD_ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';

// Card data structure based on API documentation
export interface Card {
    id: number;
    name: string;
    create_date: string;
    create_time: string;
    modify_date: string | null;
    modify_time: string | null;
    transaction_count: number;
}

// Autocomplete interfaces
export interface CardAutocompleteItem {
    id: number;
    name: string;
}

export interface CardAutocompleteResponse {
    success: boolean;
    data: {
        data: CardAutocompleteItem[];
        search_query: string;
        result_count: number;
        limit_applied: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface CardAutocompleteFilters {
    search?: string;
    limit?: number;
}

// Paginated cards interfaces
export interface CardFilters {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: 'name' | 'create_date' | 'transaction_count';
    sort_order?: 'asc' | 'desc';
}

export interface CardPaginatedResponse {
    success: boolean;
    data: {
        data: Card[];
        pagination: {
            current_page: number;
            per_page: number;
            total_count: number;
            total_pages: number;
            has_next_page: boolean;
            has_previous_page: boolean;
        };
        search_applied: string | null;
        sort_applied: {
            sort_by: string;
            sort_order: string;
        };
    };
    code: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

// CRUD operation interfaces
export interface CreateCardRequest {
    name: string;
}

export interface UpdateCardRequest {
    id: number;
    name: string;
}

export interface DeleteCardRequest {
    id: number;
}

export interface CardResponse {
    success: boolean;
    data: Card;
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export interface DeleteCardResponse {
    success: boolean;
    data: {
        id: number;
    };
    successCode: string;
    timestamp: string;
    statusCode: number;
    message: string;
}

export const cardService = {
    // Get paginated cards with filters and sorting
    getPaginatedCards: async (filters: CardFilters = {}): Promise<CardPaginatedResponse> => {
        const url = buildEndpointUrl(CARD_ENDPOINTS.PAGINATED, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get card autocomplete suggestions
    getCardAutocomplete: async (filters: CardAutocompleteFilters = {}): Promise<CardAutocompleteResponse> => {
        const url = buildEndpointUrl(CARD_ENDPOINTS.AUTOCOMPLETE, filters);
        const response = await api.get(url);
        return response.data;
    },

    // Get card by ID
    getCardById: async (id: number): Promise<CardResponse> => {
        const response = await api.get(`${CARD_ENDPOINTS.GET_BY_ID}/${id}`);
        return response.data;
    },

    // Create a new card
    createCard: async (cardData: CreateCardRequest): Promise<CardResponse> => {
        const response = await api.post(CARD_ENDPOINTS.CREATE, cardData);
        return response.data;
    },

    // Update an existing card
    updateCard: async (cardData: UpdateCardRequest): Promise<CardResponse> => {
        const response = await api.put(CARD_ENDPOINTS.UPDATE, cardData);
        return response.data;
    },

    // Delete a card
    deleteCard: async (cardData: DeleteCardRequest): Promise<DeleteCardResponse> => {
        const response = await api.delete(CARD_ENDPOINTS.DELETE, { data: cardData });
        return response.data;
    },
};

export default cardService;
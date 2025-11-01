export interface Card {
  id: number;
  name: string;
  create_date?: Date | null;
  create_time?: string | null;
  modify_date?: Date | null;
  modify_time?: string | null;
  transaction_count?: number;
}

export interface CardInput {
  name: string;
}

export interface CardUpdateInput extends CardInput {
  id: number;
}

export interface DeleteCardInput {
  id: number;
}

export interface CardSearch {
  search?: string; // Search in card name
}

export interface CardSort {
  sort_by?: 'name' | 'create_date' | 'transaction_count';
  sort_order?: 'asc' | 'desc';
}

export interface CardPagination {
  page?: number; // Page number (starting from 1)
  limit?: number; // Number of records per page (default 50)
}

export interface GetCardsInput extends CardSearch, CardSort, CardPagination {}

export interface PaginatedCardResponse {
  data: Card[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
  search_applied?: string;
  sort_applied: {
    sort_by: string;
    sort_order: string;
  };
}

export interface CardAutocompleteInput {
  search: string;
  limit?: number; // Default 5, max 10
}

export interface CardAutocompleteItem {
  id: number;
  name: string;
}

export interface CardAutocompleteResponse {
  data: CardAutocompleteItem[];
  search_query: string;
  result_count: number;
  limit_applied: number;
}
export interface Client {
  id?: number;
  name: string;
  email?: string | null;
  contact?: string | null;
  address?: string | null;
  create_date?: Date | null;
  create_time?: string | null;
  modify_date?: Date | null;
  modify_time?: string | null;
  transaction_count?: number;
}

export interface ClientInput {
  name: string;
  email?: string | null | undefined;
  contact?: string | null | undefined;
  address?: string | null | undefined;
}

export interface ClientUpdateInput extends ClientInput {
  id: number;
}

export interface DeleteClientInput {
  id: number;
}

export interface ClientSearch {
  search?: string; // Search in client name, email, contact, address
}

export interface ClientSort {
  sort_by?: 'name' | 'email' | 'contact' | 'create_date' | 'transaction_count';
  sort_order?: 'asc' | 'desc';
}

export interface ClientPagination {
  page?: number; // Page number (starting from 1)
  limit?: number; // Number of records per page (default 50)
}

export interface GetClientsInput extends ClientSearch, ClientSort, ClientPagination {}

export interface PaginatedClientResponse {
  data: Client[];
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

export interface ClientAutocompleteInput {
    search: string;
    limit?: number; // Default 5, max 10
}

export interface ClientAutocompleteItem {
    id: number;
    name: string;
}

export interface ClientAutocompleteResponse {
    data: ClientAutocompleteItem[];
    search_query: string;
    result_count: number;
    limit_applied: number;
}// Validation functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidContact(contact: string): boolean {
  const contactRegex = /^[6-9]\d{9}$/;
  return contactRegex.test(contact);
}
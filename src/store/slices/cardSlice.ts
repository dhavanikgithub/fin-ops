import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from '../../services/cardService';
import { 
    fetchPaginatedCards, 
    createCard, 
    updateCard, 
    deleteCard, 
    fetchCardById 
} from '../actions/cardActions';

// Card state interface
export interface CardState {
    cards: Card[];
    pagination: {
        current_page: number;
        per_page: number;
        total_count: number;
        total_pages: number;
        has_next_page: boolean;
        has_previous_page: boolean;
    };
    searchQuery: string;
    sortBy: 'name' | 'create_date' | 'transaction_count';
    sortOrder: 'asc' | 'desc';
    loading: boolean;
    error: string | null;
    
    // Loading states for individual operations
    creating: boolean;
    updating: number[]; // Array of card IDs being updated
    deleting: number[]; // Array of card IDs being deleted
    
    // Edit form state
    editingCard: Card | null;
    showEditForm: boolean;
}

// Initial state
const initialState: CardState = {
    cards: [],
    pagination: {
        current_page: 1,
        per_page: 50,
        total_count: 0,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
    },
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    loading: false,
    error: null,
    
    creating: false,
    updating: [],
    deleting: [],
    
    editingCard: null,
    showEditForm: false,
};

// Card slice
export const cardSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {
        // Set search query
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        
        // Set sorting
        setSorting: (state, action: PayloadAction<{ sortBy: 'name' | 'create_date' | 'transaction_count'; sortOrder: 'asc' | 'desc' }>) => {
            state.sortBy = action.payload.sortBy;
            state.sortOrder = action.payload.sortOrder;
        },
        
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        
        // Edit form management
        setEditingCard: (state, action: PayloadAction<Card | null>) => {
            state.editingCard = action.payload;
            state.showEditForm = action.payload !== null;
        },
        
        closeEditForm: (state) => {
            state.editingCard = null;
            state.showEditForm = false;
        },
        
        // Operation tracking
        addUpdatingCard: (state, action: PayloadAction<number>) => {
            if (!state.updating.includes(action.payload)) {
                state.updating.push(action.payload);
            }
        },
        
        removeUpdatingCard: (state, action: PayloadAction<number>) => {
            state.updating = state.updating.filter(id => id !== action.payload);
        },
        
        addDeletingCard: (state, action: PayloadAction<number>) => {
            if (!state.deleting.includes(action.payload)) {
                state.deleting.push(action.payload);
            }
        },
        
        removeDeletingCard: (state, action: PayloadAction<number>) => {
            state.deleting = state.deleting.filter(id => id !== action.payload);
        },
        
        // Update card in list after successful operation
        updateCardInList: (state, action: PayloadAction<Card>) => {
            const index = state.cards.findIndex(card => card.id === action.payload.id);
            if (index !== -1) {
                state.cards[index] = action.payload;
            }
        },
        
        // Remove card from list after successful deletion
        removeCardFromList: (state, action: PayloadAction<number>) => {
            state.cards = state.cards.filter(card => card.id !== action.payload);
            // Update pagination if needed
            if (state.pagination.total_count > 0) {
                state.pagination.total_count -= 1;
            }
        },
        
        // Add card to list after successful creation
        addCardToList: (state, action: PayloadAction<Card>) => {
            // Add to beginning of list if sorting by name ascending or create_date descending
            if ((state.sortBy === 'name' && state.sortOrder === 'asc') || 
                (state.sortBy === 'create_date' && state.sortOrder === 'desc')) {
                state.cards.unshift(action.payload);
            } else {
                state.cards.push(action.payload);
            }
            // Update pagination
            state.pagination.total_count += 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch paginated cards
        builder
            .addCase(fetchPaginatedCards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPaginatedCards.fulfilled, (state, action) => {
                state.loading = false;
                state.cards = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_applied || '';
                state.sortBy = action.payload.data.sort_applied.sort_by as 'name' | 'create_date' | 'transaction_count';
                state.sortOrder = action.payload.data.sort_applied.sort_order as 'asc' | 'desc';
            })
            .addCase(fetchPaginatedCards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch cards';
            })
            
            // Create card
            .addCase(createCard.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createCard.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createCard.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload as string;
            })
            
            // Update card
            .addCase(updateCard.fulfilled, (state) => {
                // Close edit form on successful update
                state.editingCard = null;
                state.showEditForm = false;
            })
            .addCase(updateCard.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            
            // Delete card
            .addCase(deleteCard.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            
            // Fetch card by ID
            .addCase(fetchCardById.fulfilled, (state, action) => {
                // Update card in list if it exists
                const card = action.payload.data;
                const index = state.cards.findIndex(c => c.id === card.id);
                if (index !== -1) {
                    state.cards[index] = card;
                }
            })
            .addCase(fetchCardById.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const {
    setSearchQuery,
    setSorting,
    clearError,
    setEditingCard,
    closeEditForm,
    addUpdatingCard,
    removeUpdatingCard,
    addDeletingCard,
    removeDeletingCard,
    updateCardInList,
    removeCardFromList,
    addCardToList,
} = cardSlice.actions;

// Export reducer
export default cardSlice.reducer;
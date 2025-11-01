import { createAsyncThunk } from '@reduxjs/toolkit';
import cardService, { 
    CardFilters, 
    CreateCardRequest, 
    UpdateCardRequest, 
    DeleteCardRequest,
    Card,
    CardAutocompleteFilters,
    CardAutocompleteResponse
} from '../../services/cardService';
import { 
    addUpdatingCard, 
    removeUpdatingCard, 
    addDeletingCard, 
    removeDeletingCard,
    updateCardInList,
    removeCardFromList,
    addCardToList
} from '../slices/cardSlice';

// Fetch paginated cards
export const fetchPaginatedCards = createAsyncThunk(
    'cards/fetchPaginated',
    async (filters: CardFilters = {}) => {
        const response = await cardService.getPaginatedCards(filters);
        return response;
    }
);

// Create card
export const createCard = createAsyncThunk(
    'cards/create',
    async (cardData: CreateCardRequest, { dispatch, rejectWithValue }) => {
        try {
            const response = await cardService.createCard(cardData);
            
            // Add the new card to the list
            dispatch(addCardToList(response.data));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create card');
        }
    }
);

// Update card
export const updateCard = createAsyncThunk(
    'cards/update',
    async (cardData: UpdateCardRequest, { dispatch, rejectWithValue }) => {
        try {
            // Add to updating list
            dispatch(addUpdatingCard(cardData.id));
            
            const response = await cardService.updateCard(cardData);
            
            // Update the card in the list
            dispatch(updateCardInList(response.data));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to update card');
        } finally {
            // Remove from updating list
            dispatch(removeUpdatingCard(cardData.id));
        }
    }
);

// Delete card
export const deleteCard = createAsyncThunk(
    'cards/delete',
    async (cardData: DeleteCardRequest, { dispatch, rejectWithValue }) => {
        try {
            // Add to deleting list
            dispatch(addDeletingCard(cardData.id));
            
            const response = await cardService.deleteCard(cardData);
            
            // Remove the card from the list
            dispatch(removeCardFromList(cardData.id));
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete card');
        } finally {
            // Remove from deleting list
            dispatch(removeDeletingCard(cardData.id));
        }
    }
);

// Get card by ID
export const fetchCardById = createAsyncThunk(
    'cards/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await cardService.getCardById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch card');
        }
    }
);

// Get card autocomplete
export const fetchCardAutocomplete = createAsyncThunk<
    CardAutocompleteResponse['data'],
    CardAutocompleteFilters | undefined,
    { rejectValue: string }
>(
    'cardAutocomplete/fetch',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await cardService.getCardAutocomplete(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch card autocomplete data'
            );
        }
    }
);
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bank } from '../../services/bankService';
import { 
    fetchPaginatedBanks, 
    createBank, 
    updateBank, 
    deleteBank, 
    fetchBankById 
} from '../actions/bankActions';

// Bank state interface
export interface BankState {
    banks: Bank[];
    pagination: {
        current_page: number;
        page_size: number;
        total_records: number;
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
    updating: number[]; // Array of bank IDs being updated
    deleting: number[]; // Array of bank IDs being deleted
    
    // Edit form state
    editingBank: Bank | null;
    showEditForm: boolean;
}

// Initial state
const initialState: BankState = {
    banks: [],
    pagination: {
        current_page: 1,
        page_size: 50,
        total_records: 0,
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
    
    editingBank: null,
    showEditForm: false,
};

// Bank slice
export const bankSlice = createSlice({
    name: 'banks',
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
        setEditingBank: (state, action: PayloadAction<Bank | null>) => {
            state.editingBank = action.payload;
            state.showEditForm = action.payload !== null;
        },
        
        closeEditForm: (state) => {
            state.editingBank = null;
            state.showEditForm = false;
        },
        
        // Operation tracking
        addUpdatingBank: (state, action: PayloadAction<number>) => {
            if (!state.updating.includes(action.payload)) {
                state.updating.push(action.payload);
            }
        },
        
        removeUpdatingBank: (state, action: PayloadAction<number>) => {
            state.updating = state.updating.filter(id => id !== action.payload);
        },
        
        addDeletingBank: (state, action: PayloadAction<number>) => {
            if (!state.deleting.includes(action.payload)) {
                state.deleting.push(action.payload);
            }
        },
        
        removeDeletingBank: (state, action: PayloadAction<number>) => {
            state.deleting = state.deleting.filter(id => id !== action.payload);
        },
        
        // Update bank in list after successful operation
        updateBankInList: (state, action: PayloadAction<Bank>) => {
            const index = state.banks.findIndex(bank => bank.id === action.payload.id);
            if (index !== -1) {
                state.banks[index] = action.payload;
            }
        },
        
        // Remove bank from list after successful deletion
        removeBankFromList: (state, action: PayloadAction<number>) => {
            state.banks = state.banks.filter(bank => bank.id !== action.payload);
            // Update pagination if needed
            if (state.pagination.total_records > 0) {
                state.pagination.total_records -= 1;
            }
        },
        
        // Add bank to list after successful creation
        addBankToList: (state, action: PayloadAction<Bank>) => {
            // Add to beginning of list if sorting by name ascending or create_date descending
            if ((state.sortBy === 'name' && state.sortOrder === 'asc') || 
                (state.sortBy === 'create_date' && state.sortOrder === 'desc')) {
                state.banks.unshift(action.payload);
            } else {
                state.banks.push(action.payload);
            }
            // Update pagination
            state.pagination.total_records += 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch paginated banks
        builder
            .addCase(fetchPaginatedBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPaginatedBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = action.payload.data.data;
                state.pagination = action.payload.data.pagination;
                state.searchQuery = action.payload.data.search_query || '';
                state.sortBy = action.payload.data.sort_by as 'name' | 'create_date' | 'transaction_count';
                state.sortOrder = action.payload.data.sort_order as 'asc' | 'desc';
            })
            .addCase(fetchPaginatedBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch banks';
            })
            
            // Create bank
            .addCase(createBank.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createBank.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createBank.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload as string;
            })
            
            // Update bank
            .addCase(updateBank.fulfilled, (state) => {
                // Close edit form on successful update
                state.editingBank = null;
                state.showEditForm = false;
            })
            .addCase(updateBank.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            
            // Delete bank
            .addCase(deleteBank.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            
            // Fetch bank by ID
            .addCase(fetchBankById.fulfilled, (state, action) => {
                // Update bank in list if it exists
                const bank = action.payload.data;
                const index = state.banks.findIndex(b => b.id === bank.id);
                if (index !== -1) {
                    state.banks[index] = bank;
                }
            })
            .addCase(fetchBankById.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const {
    setSearchQuery,
    setSorting,
    clearError,
    setEditingBank,
    closeEditForm,
    addUpdatingBank,
    removeUpdatingBank,
    addDeletingBank,
    removeDeletingBank,
    updateBankInList,
    removeBankFromList,
    addBankToList,
} = bankSlice.actions;

// Export reducer
export default bankSlice.reducer;
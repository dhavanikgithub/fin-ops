import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';
import bankAutocompleteReducer from './slices/bankAutocompleteSlice';
import cardAutocompleteReducer from './slices/cardAutocompleteSlice';
import clientAutocompleteReducer from './slices/clientAutocompleteSlice';

export const store = configureStore({
    reducer: {
        transactions: transactionReducer,
        bankAutocomplete: bankAutocompleteReducer,
        cardAutocomplete: cardAutocompleteReducer,
        clientAutocomplete: clientAutocompleteReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
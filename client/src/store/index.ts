import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';
import bankAutocompleteReducer from './slices/bankAutocompleteSlice';
import cardAutocompleteReducer from './slices/cardAutocompleteSlice';
import clientAutocompleteReducer from './slices/clientAutocompleteSlice';
import clientReducer from './slices/clientSlice';
import bankReducer from './slices/bankSlice';
import cardReducer from './slices/cardSlice';

// Profiler reducers
import profilerClientReducer from './slices/profilerClientSlice';
import profilerClientAutocompleteReducer from './slices/profilerClientAutocompleteSlice';
import profilerBankReducer from './slices/profilerBankSlice';
import profilerBankAutocompleteReducer from './slices/profilerBankAutocompleteSlice';
import profilerProfileReducer from './slices/profilerProfileSlice';
import profilerProfileAutocompleteReducer from './slices/profilerProfileAutocompleteSlice';
import profilerTransactionReducer from './slices/profilerTransactionSlice';

export const store = configureStore({
    reducer: {
        transactions: transactionReducer,
        bankAutocomplete: bankAutocompleteReducer,
        cardAutocomplete: cardAutocompleteReducer,
        clientAutocomplete: clientAutocompleteReducer,
        clients: clientReducer,
        banks: bankReducer,
        cards: cardReducer,
        // Profiler reducers
        profilerClients: profilerClientReducer,
        profilerClientAutocomplete: profilerClientAutocompleteReducer,
        profilerBanks: profilerBankReducer,
        profilerBankAutocomplete: profilerBankAutocompleteReducer,
        profilerProfiles: profilerProfileReducer,
        profilerProfileAutocomplete: profilerProfileAutocompleteReducer,
        profilerTransactions: profilerTransactionReducer,
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
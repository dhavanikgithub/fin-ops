'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { X, RotateCcw, Filter, Banknote, CreditCard, User, Plus, Check } from 'lucide-react';
import './TransactionFilterModal.scss';
import ReactDatePicker from '../../components/DatePicker/ReactDatePicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBankAutocomplete } from '../../store/actions/bankActions';
import { clearBankAutocomplete } from '../../store/slices/bankAutocompleteSlice';
import { fetchCardAutocomplete } from '../../store/actions/cardActions';
import { clearCardAutocomplete } from '../../store/slices/cardAutocompleteSlice';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../../utils/transactionUtils';
import logger from '@/utils/logger';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterValues) => void;
    activeFilters?: FilterValues;
}

export interface FilterValues {
    types: string[];
    minAmount: string;
    maxAmount: string;
    startDate: string;
    endDate: string;
    banks: Array<{ label: string; value: number }>;
    cards: Array<{ label: string; value: number }>;
    clients: Array<{ label: string; value: number }>;
}


// Error Fallback Component for Filter Modal
const FilterModalErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void; onClose: () => void }> = ({ error, resetErrorBoundary, onClose }) => {
    return (
        <div className="filter-modal-overlay" onClick={onClose}>
            <div className="filter-modal" onClick={e => e.stopPropagation()}>
                <div className="filter-modal__header">
                    <h2 className="filter-modal__title">Filter Error</h2>
                    <button className="filter-modal__close" onClick={onClose}>
                        <X size={16} />
                        Close
                    </button>
                </div>
                <div className="filter-modal__body">
                    <div className="filter-modal__error-section">
                        <span className="filter-modal__error">
                            Something went wrong while preparing the filter. Please try again.
                        </span>
                        {process.env.NODE_ENV === 'development' && (
                            <details style={{ marginTop: 12 }}>
                                <summary>Technical Details (Development)</summary>
                                <pre style={{ fontSize: 12, color: '#b91c1c', margin: 0 }}>{error.message}\n{error.stack}</pre>
                            </details>
                        )}
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button className="filter-modal__apply" onClick={resetErrorBoundary}>Try Again</button>
                            <button className="filter-modal__reset" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Error Fallback for Bank Tokens
const BankTokensErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi filter-modal__input--error">
                <div className="filter-modal__token filter-modal__token--error">
                    <Banknote size={14} />
                    <span>Bank search unavailable</span>
                    <button
                        type="button"
                        className="filter-modal__token-retry"
                        onClick={resetErrorBoundary}
                        title="Retry bank search"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="filter-modal__error-hint" title={`Bank Error: ${error.message}`}>
                        ⚠️
                    </div>
                )}
            </div>
        </div>
    );
};

// Error Fallback for Card Tokens
const CardTokensErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi filter-modal__input--error">
                <div className="filter-modal__token filter-modal__token--error">
                    <CreditCard size={14} />
                    <span>Card search unavailable</span>
                    <button
                        type="button"
                        className="filter-modal__token-retry"
                        onClick={resetErrorBoundary}
                        title="Retry card search"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="filter-modal__error-hint" title={`Card Error: ${error.message}`}>
                        ⚠️
                    </div>
                )}
            </div>
        </div>
    );
};

// Error Fallback for Client Tokens
const ClientTokensErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi filter-modal__input--error">
                <div className="filter-modal__token filter-modal__token--error">
                    <User size={14} />
                    <span>Client search unavailable</span>
                    <button
                        type="button"
                        className="filter-modal__token-retry"
                        onClick={resetErrorBoundary}
                        title="Retry client search"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="filter-modal__error-hint" title={`Client Error: ${error.message}`}>
                        ⚠️
                    </div>
                )}
            </div>
        </div>
    );
};

// Bank Tokens Component (moved outside to prevent re-creation on each render)
const BankTokensContent: React.FC<{
    filters: FilterValues;
    bankSearch: string;
    setBankSearch: (value: string) => void;
    bankHighlightedIndex: number;
    setBankHighlightedIndex: (index: number) => void;
    handleBankKeyDown: (e: React.KeyboardEvent) => void;
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    bankAutocompleteItems: any[];
    bankLoading: boolean;
}> = ({
    filters,
    bankSearch,
    setBankSearch,
    bankHighlightedIndex,
    setBankHighlightedIndex,
    handleBankKeyDown,
    handleRemoveToken,
    setFilters,
    dispatch,
    bankAutocompleteItems,
    bankLoading
}) => {
    // Filter out banks that are already selected
    const selectedBankIds = filters.banks.map(bank => bank.value);
    const availableBanks = bankAutocompleteItems.filter(
        bank => !selectedBankIds.includes(bank.id)
    );

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.banks.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <Banknote size={14} />
                            <span>{item.label}</span>
                            <button
                                type="button"
                                className="filter-modal__token-remove"
                                onClick={() => handleRemoveToken('banks', item)}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="filter-modal__token-input"
                            placeholder="Search bank..."
                            value={bankSearch}
                            onChange={e => setBankSearch(e.target.value)}
                            onKeyDown={handleBankKeyDown}
                            autoComplete="off"
                        />
                        {bankSearch && (
                            <div className="filter-modal__dropdown">
                                {bankLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading banks...
                                    </div>
                                ) : availableBanks.length > 0 ? (
                                    availableBanks.map((bank, index) => (
                                        <div
                                            key={bank.id}
                                            className={`filter-modal__dropdown-item ${index === bankHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    banks: [...prev.banks, { label: bank.name, value: bank.id }]
                                                }));
                                                setBankSearch('');
                                                setBankHighlightedIndex(0);
                                                dispatch(clearBankAutocomplete());
                                            }}
                                            onMouseEnter={() => setBankHighlightedIndex(index)}
                                        >
                                            {bank.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                        No banks found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error("Error occurred while rendering bank tokens:", error);
        throw error;
    }
};

// Card Tokens Component (moved outside to prevent re-creation on each render)
const CardTokensContent: React.FC<{
    filters: FilterValues;
    cardSearch: string;
    setCardSearch: (value: string) => void;
    cardHighlightedIndex: number;
    setCardHighlightedIndex: (index: number) => void;
    handleCardKeyDown: (e: React.KeyboardEvent) => void;
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    cardAutocompleteItems: any[];
    cardLoading: boolean;
}> = ({
    filters,
    cardSearch,
    setCardSearch,
    cardHighlightedIndex,
    setCardHighlightedIndex,
    handleCardKeyDown,
    handleRemoveToken,
    setFilters,
    dispatch,
    cardAutocompleteItems,
    cardLoading
}) => {
    // Filter out cards that are already selected
    const selectedCardIds = filters.cards.map(card => card.value);
    const availableCards = cardAutocompleteItems.filter(
        card => !selectedCardIds.includes(card.id)
    );

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.cards.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <CreditCard size={14} />
                            <span>{item.label}</span>
                            <button
                                type="button"
                                className="filter-modal__token-remove"
                                onClick={() => handleRemoveToken('cards', item)}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="filter-modal__token-input"
                            placeholder="Search card..."
                            value={cardSearch}
                            onChange={e => setCardSearch(e.target.value)}
                            onKeyDown={handleCardKeyDown}
                            autoComplete="off"
                        />
                        {cardSearch && (
                            <div className="filter-modal__dropdown">
                                {cardLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading cards...
                                    </div>
                                ) : availableCards.length > 0 ? (
                                    availableCards.map((card, index) => (
                                        <div
                                            key={card.id}
                                            className={`filter-modal__dropdown-item ${index === cardHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    cards: [...prev.cards, { label: card.name, value: card.id }]
                                                }));
                                                setCardSearch('');
                                                setCardHighlightedIndex(0);
                                                dispatch(clearCardAutocomplete());
                                            }}
                                            onMouseEnter={() => setCardHighlightedIndex(index)}
                                        >
                                            {card.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                        No cards found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error("Error occurred while rendering card tokens:", error);
        throw error;
    }
};

// Client Tokens Component (moved outside to prevent re-creation on each render)
const ClientTokensContent: React.FC<{
    filters: FilterValues;
    clientSearch: string;
    setClientSearch: (value: string) => void;
    clientHighlightedIndex: number;
    setClientHighlightedIndex: (index: number) => void;
    handleClientKeyDown: (e: React.KeyboardEvent) => void;
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    clientAutocompleteItems: any[];
    clientLoading: boolean;
}> = ({
    filters,
    clientSearch,
    setClientSearch,
    clientHighlightedIndex,
    setClientHighlightedIndex,
    handleClientKeyDown,
    handleRemoveToken,
    setFilters,
    dispatch,
    clientAutocompleteItems,
    clientLoading
}) => {
    // Filter out clients that are already selected
    const selectedClientIds = filters.clients.map(client => client.value);
    const availableClients = clientAutocompleteItems.filter(
        client => !selectedClientIds.includes(client.id)
    );

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.clients.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <User size={14} />
                            <span>{item.label}</span>
                            <button
                                type="button"
                                className="filter-modal__token-remove"
                                onClick={() => handleRemoveToken('clients', item)}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="filter-modal__token-input"
                            placeholder="Search client..."
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                            onKeyDown={handleClientKeyDown}
                            autoComplete="off"
                        />
                        {clientSearch && (
                            <div className="filter-modal__dropdown">
                                {clientLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading clients...
                                    </div>
                                ) : availableClients.length > 0 ? (
                                    availableClients.map((client, index) => (
                                        <div
                                            key={client.id}
                                            className={`filter-modal__dropdown-item ${index === clientHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    clients: [...prev.clients, { label: client.name, value: client.id }]
                                                }));
                                                setClientSearch('');
                                                setClientHighlightedIndex(0);
                                                dispatch(clearClientAutocomplete());
                                            }}
                                            onMouseEnter={() => setClientHighlightedIndex(index)}
                                        >
                                            {client.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                        No clients found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error("Error occurred while rendering client tokens:", error);
        throw error;
    }
};

const TransactionFilterModalContent: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters, activeFilters }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);

    const [cardSearch, setCardSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [bankHighlightedIndex, setBankHighlightedIndex] = useState(0);
    const [cardHighlightedIndex, setCardHighlightedIndex] = useState(0);
    const [clientHighlightedIndex, setClientHighlightedIndex] = useState(0);

    // Initialize filters as a ref to avoid re-renders on modal open
    const initialFilters: FilterValues = {
        types: [],
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        banks: [],
        cards: [],
        clients: [],
    };

    const [filters, setFilters] = useState<FilterValues>(activeFilters || initialFilters);

    // Update filters when activeFilters prop changes or modal opens
    useEffect(() => {
        if (isOpen && activeFilters) {
            setFilters(activeFilters);
        }
    }, [isOpen, activeFilters]);

    // Debounced timers as refs to persist across renders
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    // Memoized debounced search functions to prevent recreation on every render
    const debouncedBankSearch = useCallback((searchTerm: string) => {
        if (bankSearchDebounceTimer.current) {
            clearTimeout(bankSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchBankAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearBankAutocomplete());
            }
        }, 300);

        bankSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Memoized debounced card search
    const debouncedCardSearch = useCallback((searchTerm: string) => {
        if (cardSearchDebounceTimer.current) {
            clearTimeout(cardSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchCardAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearCardAutocomplete());
            }
        }, 300);

        cardSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Memoized debounced client search
    const debouncedClientSearch = useCallback((searchTerm: string) => {
        if (clientSearchDebounceTimer.current) {
            clearTimeout(clientSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearClientAutocomplete());
            }
        }, 300);

        clientSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Only cleanup timers when component unmounts or modal closes
    useEffect(() => {
        if (!isOpen) {
            // Clear search states when modal closes
            setBankSearch('');
            setCardSearch('');
            setClientSearch('');
            setBankHighlightedIndex(0);
            setCardHighlightedIndex(0);
            setClientHighlightedIndex(0);
        }

        return () => {
            if (bankSearchDebounceTimer.current) {
                clearTimeout(bankSearchDebounceTimer.current);
            }
            if (cardSearchDebounceTimer.current) {
                clearTimeout(cardSearchDebounceTimer.current);
            }
            if (clientSearchDebounceTimer.current) {
                clearTimeout(clientSearchDebounceTimer.current);
            }
        };
    }, [isOpen]);

    // Only trigger search when search terms actually change and have content
    useEffect(() => {
        if (bankSearch.trim()) {
            debouncedBankSearch(bankSearch);
        } else if (bankSearch === '') {
            dispatch(clearBankAutocomplete());
        }
    }, [bankSearch, debouncedBankSearch, dispatch]);

    useEffect(() => {
        if (cardSearch.trim()) {
            debouncedCardSearch(cardSearch);
        } else if (cardSearch === '') {
            dispatch(clearCardAutocomplete());
        }
    }, [cardSearch, debouncedCardSearch, dispatch]);

    useEffect(() => {
        if (clientSearch.trim()) {
            debouncedClientSearch(clientSearch);
        } else if (clientSearch === '') {
            dispatch(clearClientAutocomplete());
        }
    }, [clientSearch, debouncedClientSearch, dispatch]);

    // Only reset highlighted indices when items actually change and have content
    useEffect(() => {
        if (bankAutocompleteItems.length > 0) {
            setBankHighlightedIndex(0);
        }
    }, [bankAutocompleteItems.length]);

    useEffect(() => {
        if (cardAutocompleteItems.length > 0) {
            setCardHighlightedIndex(0);
        }
    }, [cardAutocompleteItems.length]);

    useEffect(() => {
        if (clientAutocompleteItems.length > 0) {
            setClientHighlightedIndex(0);
        }
    }, [clientAutocompleteItems.length]);

    const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
        setFilters(prev => ({
            ...prev,
            [field]: date ? date.toISOString().split('T')[0] : ''
        }));
    };

    const handleTypeToggle = (type: string) => {
        setFilters(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleRemoveToken = (category: keyof FilterValues, item: { label: string; value: number }) => {
        if (Array.isArray(filters[category])) {
            setFilters(prev => ({
                ...prev,
                [category]: (prev[category] as Array<{ label: string; value: number }>).filter(filterItem => filterItem.value !== item.value)
            }));
        }
    };

    const handleInputChange = (field: keyof FilterValues, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReset = () => {
        setFilters(initialFilters);
        setBankSearch('');
        setCardSearch('');
        setClientSearch('');
        setBankHighlightedIndex(0);
        setCardHighlightedIndex(0);
        setClientHighlightedIndex(0);
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    // Keyboard navigation handlers
    const handleBankKeyDown = (e: React.KeyboardEvent) => {
        const availableBanks = bankAutocompleteItems.filter(
            bank => !filters.banks.map(b => b.value).includes(bank.id)
        );
        if (!bankSearch || availableBanks.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setBankHighlightedIndex(prev =>
                    prev < availableBanks.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setBankHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : availableBanks.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (availableBanks.length > 0) {
                    const selectedBank = availableBanks[bankHighlightedIndex];
                    setFilters(prev => ({
                        ...prev,
                        banks: [...prev.banks, { label: selectedBank.name, value: selectedBank.id }]
                    }));
                    setBankSearch('');
                    setBankHighlightedIndex(0);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setBankSearch('');
                setBankHighlightedIndex(0);
                break;
        }
    };

    const handleCardKeyDown = (e: React.KeyboardEvent) => {
        const availableCards = cardAutocompleteItems.filter(
            card => !filters.cards.map(c => c.value).includes(card.id)
        );
        if (!cardSearch || availableCards.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setCardHighlightedIndex(prev =>
                    prev < availableCards.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setCardHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : availableCards.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (availableCards.length > 0) {
                    const selectedCard = availableCards[cardHighlightedIndex];
                    setFilters(prev => ({
                        ...prev,
                        cards: [...prev.cards, { label: selectedCard.name, value: selectedCard.id }]
                    }));
                    setCardSearch('');
                    setCardHighlightedIndex(0);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setCardSearch('');
                setCardHighlightedIndex(0);
                break;
        }
    };

    const handleClientKeyDown = (e: React.KeyboardEvent) => {
        const availableClients = clientAutocompleteItems.filter(
            client => !filters.clients.map(c => c.value).includes(client.id)
        );
        if (!clientSearch || availableClients.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setClientHighlightedIndex(prev =>
                    prev < availableClients.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setClientHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : availableClients.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (availableClients.length > 0) {
                    const selectedClient = availableClients[clientHighlightedIndex];
                    setFilters(prev => ({
                        ...prev,
                        clients: [...prev.clients, { label: selectedClient.name, value: selectedClient.id }]
                    }));
                    setClientSearch('');
                    setClientHighlightedIndex(0);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setClientSearch('');
                setClientHighlightedIndex(0);
                break;
        }
    };

    const renderBankTokens = () => {
        return (
            <ErrorBoundary
                FallbackComponent={BankTokensErrorFallback}
                onError={(error, errorInfo) => {
                    logger.error('Bank tokens error boundary triggered:', {
                        error: error.message,
                        stack: error.stack,
                        errorInfo,
                        timestamp: new Date().toISOString()
                    });
                }}
            >
                <BankTokensContent
                    filters={filters}
                    bankSearch={bankSearch}
                    setBankSearch={setBankSearch}
                    bankHighlightedIndex={bankHighlightedIndex}
                    setBankHighlightedIndex={setBankHighlightedIndex}
                    handleBankKeyDown={handleBankKeyDown}
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    bankAutocompleteItems={bankAutocompleteItems}
                    bankLoading={bankLoading}
                />
            </ErrorBoundary>
        );
    };

    const renderCardTokens = () => {
        return (
            <ErrorBoundary
                FallbackComponent={CardTokensErrorFallback}
                onError={(error, errorInfo) => {
                    logger.error('Card tokens error boundary triggered:', {
                        error: error.message,
                        stack: error.stack,
                        errorInfo,
                        timestamp: new Date().toISOString()
                    });
                }}
            >
                <CardTokensContent
                    filters={filters}
                    cardSearch={cardSearch}
                    setCardSearch={setCardSearch}
                    cardHighlightedIndex={cardHighlightedIndex}
                    setCardHighlightedIndex={setCardHighlightedIndex}
                    handleCardKeyDown={handleCardKeyDown}
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    cardAutocompleteItems={cardAutocompleteItems}
                    cardLoading={cardLoading}
                />
            </ErrorBoundary>
        );
    };

    const renderClientTokens = () => {
        return (
            <ErrorBoundary
                FallbackComponent={ClientTokensErrorFallback}
                onError={(error, errorInfo) => {
                    logger.error('Client tokens error boundary triggered:', {
                        error: error.message,
                        stack: error.stack,
                        errorInfo,
                        timestamp: new Date().toISOString()
                    });
                }}
            >
                <ClientTokensContent
                    filters={filters}
                    clientSearch={clientSearch}
                    setClientSearch={setClientSearch}
                    clientHighlightedIndex={clientHighlightedIndex}
                    setClientHighlightedIndex={setClientHighlightedIndex}
                    handleClientKeyDown={handleClientKeyDown}
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    clientAutocompleteItems={clientAutocompleteItems}
                    clientLoading={clientLoading}
                />
            </ErrorBoundary>
        );
    };

    if (!isOpen) return null;
    try{
        return (
            <div className="filter-modal-overlay" onClick={onClose}>
                <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="filter-modal__header">
                        <h2 className="filter-modal__title">Filter Transactions</h2>
                        <button className="filter-modal__close" onClick={onClose}>
                            <X size={16} />
                            Close
                        </button>
                    </div>
    
                    <div className="filter-modal__body">
                        <div className="filter-modal__section">
    
                            <div className="filter-modal__row">
                                <label className="filter-modal__label">Type</label>
                                <div className="filter-modal__pills">
                                    <label className="filter-modal__pill-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filters.types.includes(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT])}
                                            onChange={() => handleTypeToggle(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT])}
                                        />
                                        <span className="filter-modal__custom-checkbox">
                                            {filters.types.includes(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT]) && <Check size={14} />}
                                        </span>
                                        <span>Deposit</span>
                                    </label>
                                    <label className="filter-modal__pill-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filters.types.includes(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.WITHDRAW])}
                                            onChange={() => handleTypeToggle(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.WITHDRAW])}
                                        />
                                        <span className="filter-modal__custom-checkbox">
                                            {filters.types.includes(TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.WITHDRAW]) && <Check size={14} />}
                                        </span>
                                        <span>Withdraw</span>
                                    </label>
                                </div>
                            </div>
    
                            <div className="filter-modal__row">
                                <label className="filter-modal__label">Amount</label>
                                <div className="filter-modal__row-split">
                                    <input
                                        type="number"
                                        className="filter-modal__input"
                                        placeholder="Min amount"
                                        value={filters.minAmount}
                                        onChange={(e) => handleInputChange('minAmount', e.target.value)}
                                        onFocus={e => e.target.select()}
                                    />
                                    <input
                                        type="number"
                                        className="filter-modal__input"
                                        placeholder="Max amount"
                                        value={filters.maxAmount}
                                        onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                            </div>
    
                            <div className="filter-modal__row">
                                <label className="filter-modal__label">Date</label>
                                <div className="filter-modal__row-split">
                                    <ReactDatePicker
                                        value={filters.startDate}
                                        onChange={(date) => handleDateChange('startDate')(date as Date | null)}
                                        placeholder="Start date"
                                        className="filter-modal__input"
                                        maxDateToday={true}
                                        options={{
                                            mode: 'single',
                                            format: 'd-m-Y',
                                            showIcon: true,
                                            iconPosition: 'right',
                                            closeOnSelect: true,
                                            allowInput: false,
                                            blockFutureDates: true,
                                            enableMonthDropdown: true,
                                            enableYearDropdown: true,
                                            iconClickOpens: true,
                                            onSelect: (date) => {
                                                logger.log('Start date selected:', date);
                                            }
                                        }}
                                    />
                                    <ReactDatePicker
                                        value={filters.endDate}
                                        onChange={(date) => handleDateChange('endDate')(date as Date | null)}
                                        placeholder="End date"
                                        className="filter-modal__input"
                                        maxDateToday={true}
                                        options={{
                                            mode: 'single',
                                            format: 'd-m-Y',
                                            showIcon: true,
                                            iconPosition: 'right',
                                            closeOnSelect: true,
                                            allowInput: false,
                                            blockFutureDates: true,
                                            enableMonthDropdown: true,
                                            enableYearDropdown: true,
                                            iconClickOpens: true,
                                            onSelect: (date) => {
                                                logger.log('End date selected:', date);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
    
                        <div className="filter-modal__section">
                            <div className="filter-modal__row filter-modal__row--align-start">
                                <label className="filter-modal__label">Bank</label>
                                {renderBankTokens()}
                            </div>
    
                            <div className="filter-modal__row filter-modal__row--align-start">
                                <label className="filter-modal__label">Card</label>
                                {renderCardTokens()}
                            </div>
    
                            <div className="filter-modal__row filter-modal__row--align-start">
                                <label className="filter-modal__label">Client</label>
                                {renderClientTokens()}
                            </div>
                        </div>
                    </div>
    
                    <div className="filter-modal__footer">
                        <button className="filter-modal__clear" onClick={handleReset}>
                            Clear current filters
                        </button>
                        <div className="filter-modal__actions">
                            <button className="filter-modal__reset" onClick={handleReset}>
                                <RotateCcw size={16} />
                                Reset
                            </button>
                            <button className="filter-modal__apply" onClick={handleApply}>
                                <Filter size={16} />
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    catch(err){
        logger.error("Error occurred while rendering filter modal content:", err);
        showBoundary(err);
    }
};

// Main wrapper component with ErrorBoundary
const TransactionFilterModal: React.FC<FilterModalProps> = (props) => {
    if (!props.isOpen) return null;
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <FilterModalErrorFallback {...fallbackProps} onClose={props.onClose} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Transaction Filter Modal Error Boundary caught an error:', error, errorInfo);
            }}
            onReset={() => {
                logger.log('Transaction Filter Modal Error Boundary reset');
            }}
        >
            <TransactionFilterModalContent {...props} />
        </ErrorBoundary>
    );
};

export default TransactionFilterModal;
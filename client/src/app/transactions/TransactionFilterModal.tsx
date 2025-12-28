'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { X, RotateCcw, Filter, Banknote, CreditCard, User, Plus, Check } from 'lucide-react';
import './TransactionFilterModal.scss';
import ReactDatePicker from '../../components/DatePicker/ReactDatePicker';
import { AutocompleteInput, AutocompleteOption, NumericInput, PillToggleGroup, Button } from '@/components/FormInputs';
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
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<X size={16} />}
                        onClick={onClose}
                        className="filter-modal__close"
                    >
                        Close
                    </Button>
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
                            <Button variant="primary" onClick={resetErrorBoundary} className="filter-modal__apply">Try Again</Button>
                            <Button variant="secondary" onClick={onClose} className="filter-modal__reset">Close</Button>
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
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<RotateCcw size={12} />}
                        onClick={resetErrorBoundary}
                        title="Retry bank search"
                        type="button"
                        className="filter-modal__token-retry"
                    />
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
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<RotateCcw size={12} />}
                        onClick={resetErrorBoundary}
                        title="Retry card search"
                        type="button"
                        className="filter-modal__token-retry"
                    />
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
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<RotateCcw size={12} />}
                        onClick={resetErrorBoundary}
                        title="Retry client search"
                        type="button"
                        className="filter-modal__token-retry"
                    />
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
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    bankAutocompleteItems: any[];
    bankLoading: boolean;
    handleBankSearch: (searchTerm: string) => void;
}> = ({
    filters,
    handleRemoveToken,
    setFilters,
    dispatch,
    bankAutocompleteItems,
    bankLoading,
    handleBankSearch
}) => {
    // Filter out banks that are already selected
    const selectedBankIds = filters.banks.map(bank => bank.value);
    const availableBanks = bankAutocompleteItems.filter(
        bank => !selectedBankIds.includes(bank.id)
    );

    const handleBankChange = (bank: AutocompleteOption | null) => {
        if (bank) {
            setFilters(prev => ({
                ...prev,
                banks: [...prev.banks, { label: bank.name, value: bank.id }]
            }));
            dispatch(clearBankAutocomplete());
        }
    };

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.banks.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <Banknote size={14} />
                            <span>{item.label}</span>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<X size={12} />}
                                onClick={() => handleRemoveToken('banks', item)}
                                type="button"
                                className="filter-modal__token-remove"
                            />
                        </div>
                    ))}
                    <div className="filter-modal__add-token">
                        <AutocompleteInput
                            value={null}
                            onChange={handleBankChange}
                            options={availableBanks}
                            loading={bankLoading}
                            placeholder="Search bank..."
                            icon={<Plus size={14} />}
                            onSearch={handleBankSearch}
                            className="filter-modal__token-autocomplete"
                        />
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
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    cardAutocompleteItems: any[];
    cardLoading: boolean;
    handleCardSearch: (searchTerm: string) => void;
}> = ({
    filters,
    handleRemoveToken,
    setFilters,
    dispatch,
    cardAutocompleteItems,
    cardLoading,
    handleCardSearch
}) => {
    // Filter out cards that are already selected
    const selectedCardIds = filters.cards.map(card => card.value);
    const availableCards = cardAutocompleteItems.filter(
        card => !selectedCardIds.includes(card.id)
    );

    const handleCardChange = (card: AutocompleteOption | null) => {
        if (card) {
            setFilters(prev => ({
                ...prev,
                cards: [...prev.cards, { label: card.name, value: card.id }]
            }));
            dispatch(clearCardAutocomplete());
        }
    };

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.cards.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <CreditCard size={14} />
                            <span>{item.label}</span>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<X size={12} />}
                                onClick={() => handleRemoveToken('cards', item)}
                                type="button"
                                className="filter-modal__token-remove"
                            />
                        </div>
                    ))}
                    <div className="filter-modal__add-token">
                        <AutocompleteInput
                            value={null}
                            onChange={handleCardChange}
                            options={availableCards}
                            loading={cardLoading}
                            placeholder="Search card..."
                            icon={<Plus size={14} />}
                            onSearch={handleCardSearch}
                            className="filter-modal__token-autocomplete"
                        />
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
    handleRemoveToken: (category: keyof FilterValues, item: { label: string; value: number }) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
    dispatch: any;
    clientAutocompleteItems: any[];
    clientLoading: boolean;
    handleClientSearch: (searchTerm: string) => void;
}> = ({
    filters,
    handleRemoveToken,
    setFilters,
    dispatch,
    clientAutocompleteItems,
    clientLoading,
    handleClientSearch
}) => {
    // Filter out clients that are already selected
    const selectedClientIds = filters.clients.map(client => client.value);
    const availableClients = clientAutocompleteItems.filter(
        client => !selectedClientIds.includes(client.id)
    );

    const handleClientChange = (client: AutocompleteOption | null) => {
        if (client) {
            setFilters(prev => ({
                ...prev,
                clients: [...prev.clients, { label: client.name, value: client.id }]
            }));
            dispatch(clearClientAutocomplete());
        }
    };

    try {
        return (
            <div className="filter-modal__multi">
                <div className="filter-modal__input filter-modal__input--multi">
                    {filters.clients.map((item) => (
                        <div key={item.value} className="filter-modal__token">
                            <User size={14} />
                            <span>{item.label}</span>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<X size={12} />}
                                onClick={() => handleRemoveToken('clients', item)}
                                type="button"
                                className="filter-modal__token-remove"
                            />
                        </div>
                    ))}
                    <div className="filter-modal__add-token">
                        <AutocompleteInput
                            value={null}
                            onChange={handleClientChange}
                            options={availableClients}
                            loading={clientLoading}
                            placeholder="Search client..."
                            icon={<Plus size={14} />}
                            onSearch={handleClientSearch}
                            className="filter-modal__token-autocomplete"
                        />
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

    // Search handlers for autocomplete
    const handleBankSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchBankAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearBankAutocomplete());
        }
    }, [dispatch]);

    const handleCardSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchCardAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearCardAutocomplete());
        }
    }, [dispatch]);

    const handleClientSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearClientAutocomplete());
        }
    }, [dispatch]);

    // Cleanup autocomplete when modal closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearBankAutocomplete());
            dispatch(clearCardAutocomplete());
            dispatch(clearClientAutocomplete());
        }
    }, [isOpen, dispatch]);

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
        dispatch(clearBankAutocomplete());
        dispatch(clearCardAutocomplete());
        dispatch(clearClientAutocomplete());
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
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
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    bankAutocompleteItems={bankAutocompleteItems}
                    bankLoading={bankLoading}
                    handleBankSearch={handleBankSearch}
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
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    cardAutocompleteItems={cardAutocompleteItems}
                    cardLoading={cardLoading}
                    handleCardSearch={handleCardSearch}
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
                    handleRemoveToken={handleRemoveToken}
                    setFilters={setFilters}
                    dispatch={dispatch}
                    clientAutocompleteItems={clientAutocompleteItems}
                    clientLoading={clientLoading}
                    handleClientSearch={handleClientSearch}
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
                        <Button
                            variant="ghost"
                            size="small"
                            icon={<X size={16} />}
                            onClick={onClose}
                            className="filter-modal__close"
                        >
                            Close
                        </Button>
                    </div>
    
                    <div className="filter-modal__body">
                        <div className="filter-modal__section">
    
                            <div className="filter-modal__row">
                                <label className="filter-modal__label">Type</label>
                                <PillToggleGroup
                                    type="checkbox"
                                    value={filters.types}
                                    onChange={(value) => setFilters(prev => ({ ...prev, types: value as string[] }))}
                                    options={[
                                        { label: 'Deposit', value: TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT] },
                                        { label: 'Withdraw', value: TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.WITHDRAW] }
                                    ]}
                                />
                            </div>
    
                            <div className="filter-modal__row">
                                <label className="filter-modal__label">Amount</label>
                                <div className="filter-modal__row-split">
                                    <NumericInput
                                        value={filters.minAmount ? parseFloat(filters.minAmount) : 0}
                                        onChange={(value) => handleInputChange('minAmount', value.toString())}
                                        placeholder="Min amount"
                                        min={0}
                                    />
                                    <NumericInput
                                        value={filters.maxAmount ? parseFloat(filters.maxAmount) : 0}
                                        onChange={(value) => handleInputChange('maxAmount', value.toString())}
                                        placeholder="Max amount"
                                        min={0}
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
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="filter-modal__clear"
                        >
                            Clear current filters
                        </Button>
                        <div className="filter-modal__actions">
                            <Button
                                variant="secondary"
                                icon={<RotateCcw size={16} />}
                                onClick={handleReset}
                                className="filter-modal__reset"
                            >
                                Reset
                            </Button>
                            <Button
                                variant="primary"
                                icon={<Filter size={16} />}
                                onClick={handleApply}
                                className="filter-modal__apply"
                            >
                                Apply Filters
                            </Button>
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
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCcw, Filter, Banknote, CreditCard, User, Plus, Check } from 'lucide-react';
import '../styles/TransactionFilterModal.scss';
import ReactDatePicker from './DatePicker/ReactDatePicker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBankAutocomplete } from '../store/actions/bankActions';
import { clearBankAutocomplete } from '../store/slices/bankAutocompleteSlice';
import { fetchCardAutocomplete } from '../store/actions/cardActions';
import { clearCardAutocomplete } from '../store/slices/cardAutocompleteSlice';
import { fetchClientAutocomplete } from '../store/actions/clientActions';
import { clearClientAutocomplete } from '../store/slices/clientAutocompleteSlice';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../utils/transactionUtils';


interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterValues) => void;
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


const TransactionFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
    const dispatch = useAppDispatch();
    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);


    const [cardSearch, setCardSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        types: [],
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        banks: [],
        cards: [],
        clients: [],
    });

    const [newTokenInputs, setNewTokenInputs] = useState({
        banks: '',
        cards: '',
        clients: ''
    });

    // Debounced bank search
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    
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

    // Debounced card search
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    
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

    // Debounced client search
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    
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

    // Effect to fetch initial bank data when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchBankAutocomplete({ limit: 5 }));
            dispatch(fetchCardAutocomplete({ limit: 5 }));
            dispatch(fetchClientAutocomplete({ limit: 5 }));
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
    }, [isOpen, dispatch]);

    // Effect to handle bank search changes
    useEffect(() => {
        debouncedBankSearch(bankSearch);
    }, [bankSearch, debouncedBankSearch]);

    // Effect to handle card search changes
    useEffect(() => {
        debouncedCardSearch(cardSearch);
    }, [cardSearch, debouncedCardSearch]);

    // Effect to handle client search changes
    useEffect(() => {
        debouncedClientSearch(clientSearch);
    }, [clientSearch, debouncedClientSearch]);

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
        setFilters({
            types: [],
            minAmount: '',
            maxAmount: '',
            startDate: '',
            endDate: '',
            banks: [],
            cards: [],
            clients: [],
        });
        setNewTokenInputs({
            banks: '',
            cards: '',
            clients: ''
        });
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    
    const renderBankTokens = () => {
        // Filter out banks that are already selected
        const selectedBankIds = filters.banks.map(bank => bank.value);
        const availableBanks = bankAutocompleteItems.filter(
            bank => !selectedBankIds.includes(bank.id)
        );
        
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
                            autoComplete="off"
                        />
                        {bankSearch && (
                            <div className="filter-modal__dropdown">
                                {bankLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading banks...
                                    </div>
                                ) : availableBanks.length > 0 ? (
                                    availableBanks.map(bank => (
                                        <div
                                            key={bank.id}
                                            className="filter-modal__dropdown-item"
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    banks: [...prev.banks, { label: bank.name, value: bank.id }]
                                                }));
                                                setBankSearch('');
                                                dispatch(clearBankAutocomplete());
                                            }}
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
    };

    const renderCardTokens = () => {
        // Filter out cards that are already selected
        const selectedCardIds = filters.cards.map(card => card.value);
        const availableCards = cardAutocompleteItems.filter(
            card => !selectedCardIds.includes(card.id)
        );
        
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
                            autoComplete="off"
                        />
                        {cardSearch && (
                            <div className="filter-modal__dropdown">
                                {cardLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading cards...
                                    </div>
                                ) : availableCards.length > 0 ? (
                                    availableCards.map(card => (
                                        <div
                                            key={card.id}
                                            className="filter-modal__dropdown-item"
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    cards: [...prev.cards, { label: card.name, value: card.id }]
                                                }));
                                                setCardSearch('');
                                                dispatch(clearCardAutocomplete());
                                            }}
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
    };

    const renderClientTokens = () => {
        // Filter out clients that are already selected
        const selectedClientIds = filters.clients.map(client => client.value);
        const availableClients = clientAutocompleteItems.filter(
            client => !selectedClientIds.includes(client.id)
        );
        
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
                            autoComplete="off"
                        />
                        {clientSearch && (
                            <div className="filter-modal__dropdown">
                                {clientLoading ? (
                                    <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                        Loading clients...
                                    </div>
                                ) : availableClients.length > 0 ? (
                                    availableClients.map(client => (
                                        <div
                                            key={client.id}
                                            className="filter-modal__dropdown-item"
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    clients: [...prev.clients, { label: client.name, value: client.id }]
                                                }));
                                                setClientSearch('');
                                                dispatch(clearClientAutocomplete());
                                            }}
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
    };

    if (!isOpen) return null;

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
                                />
                                <input
                                    type="number"
                                    className="filter-modal__input"
                                    placeholder="Max amount"
                                    value={filters.maxAmount}
                                    onChange={(e) => handleInputChange('maxAmount', e.target.value)}
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
                                            console.log('Start date selected:', date);
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
                                            console.log('End date selected:', date);
                                        }
                                    }}
                                />
                                {/* <input
                                    type="date"
                                    className="filter-modal__input"
                                    placeholder="Start date"
                                    value={filters.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                /> */}
                                {/* <input
                                    type="date"
                                    className="filter-modal__input"
                                    placeholder="End date"
                                    value={filters.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                /> */}
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
};

export default TransactionFilterModal;
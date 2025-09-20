'use client';
import React, { useState } from 'react';
import { X, RotateCcw, Filter, Banknote, CreditCard, User, Plus, Check } from 'lucide-react';
import '../styles/TransactionFilterModal.scss';
import ReactDatePicker from './DatePicker/ReactDatePicker';


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
    banks: string[];
    cards: string[];
    clients: string[];
}


const TransactionFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
    const allBanks = ['HDFC Bank', 'Axis Bank', 'ICICI Bank', 'State Bank of India', 'Kotak Bank']; // Example
    const allCards = ['VISA', 'Mastercard', 'RuPay', 'Amex'];
    const allClients = ['Alice Cooper', 'Rahul S.3', 'Maria Gomez', 'John Doe'];


    const [cardSearch, setCardSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        types: ['deposit', 'withdraw'],
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        banks: ['HDFC Bank', 'Axis Bank'],
        cards: ['VISA', 'Mastercard'],
        clients: ['Alice Cooper', 'Rahul S.3'],
    });

    const [newTokenInputs, setNewTokenInputs] = useState({
        banks: '',
        cards: '',
        clients: ''
    });

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

    const handleRemoveToken = (category: keyof FilterValues, value: string) => {
        if (Array.isArray(filters[category])) {
            setFilters(prev => ({
                ...prev,
                [category]: (prev[category] as string[]).filter(item => item !== value)
            }));
        }
    };

    const handleAddToken = (category: 'banks' | 'cards' | 'clients') => {
        const value = newTokenInputs[category].trim();
        if (value && !filters[category].includes(value)) {
            setFilters(prev => ({
                ...prev,
                [category]: [...prev[category], value]
            }));
            setNewTokenInputs(prev => ({
                ...prev,
                [category]: ''
            }));
        }
    };

    const handleInputChange = (field: keyof FilterValues, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewTokenInputChange = (category: 'banks' | 'cards' | 'clients', value: string) => {
        setNewTokenInputs(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent, category: 'banks' | 'cards' | 'clients') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddToken(category);
        }
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

    const renderTokens = (
        items: string[],
        category: 'banks' | 'cards' | 'clients',
        icon: React.ReactNode,
        placeholder: string
    ) => (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi">
                {items.map((item) => (
                    <div key={item} className="filter-modal__token">
                        {icon}
                        <span>{item}</span>
                        <button
                            type="button"
                            className="filter-modal__token-remove"
                            onClick={() => handleRemoveToken(category, item)}
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <div className="filter-modal__add-token">
                    <input
                        type="text"
                        className="filter-modal__token-input"
                        placeholder={placeholder}
                        value={newTokenInputs[category]}
                        onChange={(e) => handleNewTokenInputChange(category, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, category)}
                    />
                    <button
                        type="button"
                        className="filter-modal__add-button"
                        onClick={() => handleAddToken(category)}
                        disabled={!newTokenInputs[category].trim()}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );



    const filteredBankOptions = allBanks.filter(
        b => b.toLowerCase().includes(bankSearch.toLowerCase()) && !filters.banks.includes(b)
    );
    const filteredCardOptions = allCards.filter(
        c => c.toLowerCase().includes(cardSearch.toLowerCase()) && !filters.cards.includes(c)
    );
    const filteredClientOptions = allClients.filter(
        c => c.toLowerCase().includes(clientSearch.toLowerCase()) && !filters.clients.includes(c)
    );

    const renderBankTokens = () => (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi">
                {filters.banks.map((item) => (
                    <div key={item} className="filter-modal__token">
                        <Banknote size={14} />
                        <span>{item}</span>
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
                    {bankSearch && filteredBankOptions.length > 0 && (
                        <div className="filter-modal__dropdown">
                            {filteredBankOptions.map(bank => (
                                <div
                                    key={bank}
                                    className="filter-modal__dropdown-item"
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            banks: [...prev.banks, bank]
                                        }));
                                        setBankSearch('');
                                    }}
                                >
                                    {bank}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCardTokens = () => (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi">
                {filters.cards.map((item) => (
                    <div key={item} className="filter-modal__token">
                        <CreditCard size={14} />
                        <span>{item}</span>
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
                    {cardSearch && filteredCardOptions.length > 0 && (
                        <div className="filter-modal__dropdown">
                            {filteredCardOptions.map(card => (
                                <div
                                    key={card}
                                    className="filter-modal__dropdown-item"
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            cards: [...prev.cards, card]
                                        }));
                                        setCardSearch('');
                                    }}
                                >
                                    {card}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderClientTokens = () => (
        <div className="filter-modal__multi">
            <div className="filter-modal__input filter-modal__input--multi">
                {filters.clients.map((item) => (
                    <div key={item} className="filter-modal__token">
                        <User size={14} />
                        <span>{item}</span>
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
                    {clientSearch && filteredClientOptions.length > 0 && (
                        <div className="filter-modal__dropdown">
                            {filteredClientOptions.map(client => (
                                <div
                                    key={client}
                                    className="filter-modal__dropdown-item"
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            clients: [...prev.clients, client]
                                        }));
                                        setClientSearch('');
                                    }}
                                >
                                    {client}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

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
                                        checked={filters.types.includes('deposit')}
                                        onChange={() => handleTypeToggle('deposit')}
                                    />
                                    <span className="filter-modal__custom-checkbox">
                                        {filters.types.includes('deposit') && <Check size={14} />}
                                    </span>
                                    <span>Deposit</span>
                                </label>
                                <label className="filter-modal__pill-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.types.includes('withdraw')}
                                        onChange={() => handleTypeToggle('withdraw')}
                                    />
                                    <span className="filter-modal__custom-checkbox">
                                        {filters.types.includes('withdraw') && <Check size={14} />}
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
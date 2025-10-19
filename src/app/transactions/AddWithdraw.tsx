'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUpCircle, X, Save, User, Building2, CreditCard, IndianRupee, Percent, StickyNote, ArrowLeft, CheckCircle2, Banknote } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBankAutocomplete } from '../../store/actions/bankActions';
import { clearBankAutocomplete } from '../../store/slices/bankAutocompleteSlice';
import { fetchCardAutocomplete } from '../../store/actions/cardActions';
import { clearCardAutocomplete } from '../../store/slices/cardAutocompleteSlice';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import './AddWithdraw.scss';

interface AddWithdrawScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

const AddWithdrawScreen: React.FC<AddWithdrawScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const dispatch = useAppDispatch();
    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);

    const [formData, setFormData] = useState({
        client: '',
        clientId: null as number | null,
        bank: '',
        bankId: null as number | null,
        card: '',
        cardId: null as number | null,
        amount: '',
        chargesPct: '0',
        notes: ''
    });

    // Autocomplete states
    const [clientSearch, setClientSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [cardSearch, setCardSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [showCardDropdown, setShowCardDropdown] = useState(false);

    // Debounced search timers
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced client search
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

    // Debounced bank search
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

    // Effects to handle search changes
    useEffect(() => {
        if (showClientDropdown) {
            debouncedClientSearch(clientSearch);
        }
    }, [clientSearch, debouncedClientSearch, showClientDropdown]);

    useEffect(() => {
        if (showBankDropdown) {
            debouncedBankSearch(bankSearch);
        }
    }, [bankSearch, debouncedBankSearch, showBankDropdown]);

    useEffect(() => {
        if (showCardDropdown) {
            debouncedCardSearch(cardSearch);
        }
    }, [cardSearch, debouncedCardSearch, showCardDropdown]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clientSearchDebounceTimer.current) {
                clearTimeout(clientSearchDebounceTimer.current);
            }
            if (bankSearchDebounceTimer.current) {
                clearTimeout(bankSearchDebounceTimer.current);
            }
            if (cardSearchDebounceTimer.current) {
                clearTimeout(cardSearchDebounceTimer.current);
            }
        };
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClientSelect = (client: { id: number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            client: client.name,
            clientId: client.id
        }));
        setClientSearch('');
        setShowClientDropdown(false);
    };

    const handleBankSelect = (bank: { id: number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            bank: bank.name,
            bankId: bank.id
        }));
        setBankSearch('');
        setShowBankDropdown(false);
    };

    const handleCardSelect = (card: { id: number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            card: card.name,
            cardId: card.id
        }));
        setCardSearch('');
        setShowCardDropdown(false);
    };

    const handleClientRemove = () => {
        setFormData(prev => ({
            ...prev,
            client: '',
            clientId: null
        }));
        setShowClientDropdown(true);
        setClientSearch('');
    };

    const handleBankRemove = () => {
        setFormData(prev => ({
            ...prev,
            bank: '',
            bankId: null
        }));
        setShowBankDropdown(true);
        setBankSearch('');
    };

    const handleCardRemove = () => {
        setFormData(prev => ({
            ...prev,
            card: '',
            cardId: null
        }));
        setShowCardDropdown(true);
        setCardSearch('');
    };

    const handleSaveWithdraw = () => {
        console.log('Saving withdraw:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled withdraw creation');
        onCancel();
    };

    const handleBackToTransactions = () => {
        console.log('Back to transactions');
        onBackToTransactions();
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <ArrowUpCircle size={16} className="main__header-icon--destructive" />
                    <h1>New Withdraw</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="main__button" onClick={handleSaveWithdraw}>
                        <Save size={16} />
                        Save Withdraw
                    </button>
                </div>

            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Withdraw Details</h2>
                            {/* <div className="main__tag main__tag--destructive">
                                <ArrowUpCircle size={16} />
                                Withdraw
                            </div> */}
                        </div>
                        <div className="main__badge main__badge--outline">
                            Keep it simple
                        </div>
                    </div>

                    <div className="aw__form">
                        <div className="aw__field">
                            <label className="aw__label">
                                <User size={16} />
                                Select Client
                            </label>
                            <div className="aw__autocomplete">
                                <div className="aw__autocomplete-input">
                                    {formData.client && !showClientDropdown && (
                                        <div className="aw__token">
                                            <User size={14} />
                                            <span>{formData.client}</span>
                                            <button
                                                type="button"
                                                className="aw__token-remove"
                                                onClick={handleClientRemove}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {(!formData.client || showClientDropdown) && (
                                        <div className="aw__search" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="aw__input"
                                                placeholder="Search client..."
                                                value={showClientDropdown ? clientSearch : formData.client}
                                                onChange={e => {
                                                    if (showClientDropdown) {
                                                        setClientSearch(e.target.value);
                                                    } else {
                                                        handleInputChange('client', e.target.value);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    setShowClientDropdown(true);
                                                    setClientSearch(formData.client || '');
                                                }}
                                                onBlur={() => setTimeout(() => {
                                                    setShowClientDropdown(false);
                                                    setClientSearch('');
                                                }, 200)}
                                                autoComplete="off"
                                            />
                                            {showClientDropdown && clientSearch && (
                                                <div className="aw__dropdown">
                                                    {clientLoading ? (
                                                        <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                            Loading...
                                                        </div>
                                                    ) : clientAutocompleteItems.length > 0 ? (
                                                        clientAutocompleteItems.map(client => (
                                                            <div
                                                                key={client.id}
                                                                className="aw__dropdown-item"
                                                                onClick={() => handleClientSelect(client)}
                                                            >
                                                                {client.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="aw__dropdown-item aw__dropdown-item--no-results">
                                                            No clients found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="aw__hint">Search existing clients to withdraw funds.</span>
                        </div>

                        <div className="aw__dual">
                            <div className="aw__field">
                                <label className="aw__label">
                                    <Building2 size={16} />
                                    From Bank
                                </label>
                                <div className="aw__autocomplete">
                                    <div className="aw__autocomplete-input">
                                        {formData.bank && !showBankDropdown && (
                                            <div className="aw__token">
                                                <Banknote size={14} />
                                                <span>{formData.bank}</span>
                                                <button
                                                    type="button"
                                                    className="aw__token-remove"
                                                    onClick={handleBankRemove}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        {(!formData.bank || showBankDropdown) && (
                                            <div className="aw__search" style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className="aw__input"
                                                    placeholder="Search bank..."
                                                    value={showBankDropdown ? bankSearch : formData.bank}
                                                    onChange={e => {
                                                        if (showBankDropdown) {
                                                            setBankSearch(e.target.value);
                                                        } else {
                                                            handleInputChange('bank', e.target.value);
                                                        }
                                                    }}
                                                    onFocus={() => {
                                                        setShowBankDropdown(true);
                                                        setBankSearch(formData.bank || '');
                                                    }}
                                                    onBlur={() => setTimeout(() => {
                                                        setShowBankDropdown(false);
                                                        setBankSearch('');
                                                    }, 200)}
                                                    autoComplete="off"
                                                />
                                                {showBankDropdown && bankSearch && (
                                                    <div className="aw__dropdown">
                                                        {bankLoading ? (
                                                            <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                                Loading...
                                                            </div>
                                                        ) : bankAutocompleteItems.length > 0 ? (
                                                            bankAutocompleteItems.map(bank => (
                                                                <div
                                                                    key={bank.id}
                                                                    className="aw__dropdown-item"
                                                                    onClick={() => handleBankSelect(bank)}
                                                                >
                                                                    {bank.name}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="aw__dropdown-item aw__dropdown-item--no-results">
                                                                No banks found
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="aw__hint">Source account for withdrawal.</span>
                            </div>

                            <div className="aw__field">
                                <label className="aw__label">
                                    <CreditCard size={16} />
                                    Card
                                </label>
                                <div className="aw__autocomplete">
                                    <div className="aw__autocomplete-input">
                                        {formData.card && !showCardDropdown && (
                                            <div className="aw__token">
                                                <CreditCard size={14} />
                                                <span>{formData.card}</span>
                                                <button
                                                    type="button"
                                                    className="aw__token-remove"
                                                    onClick={handleCardRemove}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        {(!formData.card || showCardDropdown) && (
                                            <div className="aw__search" style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className="aw__input"
                                                    placeholder="Search card..."
                                                    value={showCardDropdown ? cardSearch : formData.card}
                                                    onChange={e => {
                                                        if (showCardDropdown) {
                                                            setCardSearch(e.target.value);
                                                        } else {
                                                            handleInputChange('card', e.target.value);
                                                        }
                                                    }}
                                                    onFocus={() => {
                                                        setShowCardDropdown(true);
                                                        setCardSearch(formData.card || '');
                                                    }}
                                                    onBlur={() => setTimeout(() => {
                                                        setShowCardDropdown(false);
                                                        setCardSearch('');
                                                    }, 200)}
                                                    autoComplete="off"
                                                />
                                                {showCardDropdown && cardSearch && (
                                                    <div className="aw__dropdown">
                                                        {cardLoading ? (
                                                            <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                                Loading...
                                                            </div>
                                                        ) : cardAutocompleteItems.length > 0 ? (
                                                            cardAutocompleteItems.map(card => (
                                                                <div
                                                                    key={card.id}
                                                                    className="aw__dropdown-item"
                                                                    onClick={() => handleCardSelect(card)}
                                                                >
                                                                    {card.name}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="aw__dropdown-item aw__dropdown-item--no-results">
                                                                No cards found
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="aw__hint">Linked card for transaction (optional).</span>
                            </div>
                        </div>

                        <div className="aw__dual">
                            <div className="aw__field">
                                <label className="aw__label">
                                    <IndianRupee size={16} />
                                    Withdraw Amount
                                </label>
                                <input
                                    type="text"
                                    className="aw__input"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    placeholder="₹ 0.00"
                                />
                                <span className="aw__hint">Enter the amount to withdraw.</span>
                            </div>

                            <div className="aw__field">
                                <label className="aw__label">
                                    <Percent size={16} />
                                    Charges (%)
                                </label>
                                <input
                                    type="text"
                                    className="aw__input"
                                    value={formData.chargesPct}
                                    onChange={(e) => handleInputChange('chargesPct', e.target.value)}
                                    placeholder="0"
                                />
                                <span className="aw__hint">Enter fee percentage to apply.</span>
                            </div>
                        </div>

                        <div className="aw__field">
                            <label className="aw__label">
                                <StickyNote size={16} />
                                Notes
                            </label>
                            <textarea
                                className="aw__textarea"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Optional notes for this withdrawal..."
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="main__footer-actions">
                        <button className="main__icon-button" onClick={handleBackToTransactions}>
                            <ArrowLeft size={16} />
                            Back to Transactions
                        </button>
                        <button className="main__button" onClick={handleSaveWithdraw}>
                            <CheckCircle2 size={16} />
                            Confirm & Add Withdraw
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddWithdrawScreen;

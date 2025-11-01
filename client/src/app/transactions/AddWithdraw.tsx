'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUpCircle, X, Save, User, Building2, CreditCard, IndianRupee, Percent, StickyNote, ArrowLeft, CheckCircle2, Banknote, AlertTriangle } from 'lucide-react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBankAutocomplete } from '../../store/actions/bankActions';
import { clearBankAutocomplete } from '../../store/slices/bankAutocompleteSlice';
import { fetchCardAutocomplete } from '../../store/actions/cardActions';
import { clearCardAutocomplete } from '../../store/slices/cardAutocompleteSlice';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { createTransaction } from '../../store/actions/transactionActions';
import './AddWithdraw.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface AddWithdrawScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

// Error Fallback Component for Add Withdraw
const AddWithdrawErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
}> = ({ error, resetErrorBoundary, onCancel }) => {
    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} className="main__header-icon--error" />
                    <h1>Add Withdraw Error</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={onCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="aw__error-boundary">
                        <div className="aw__error-boundary-content">
                            <AlertTriangle size={48} className="aw__error-boundary-icon" />
                            <h3 className="aw__error-boundary-title">Something went wrong</h3>
                            <p className="aw__error-boundary-message">
                                We encountered an unexpected error while preparing the withdraw form. 
                                Your data is safe, and you can try again.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="aw__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="aw__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="aw__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={onCancel}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddWithdrawScreenContent: React.FC<AddWithdrawScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);
    const { loading: transactionLoading, error: transactionError } = useAppSelector(state => state.transactions);

    // Form validation errors (Expected Errors)
    const [formErrors, setFormErrors] = useState<{
        client?: string;
        amount?: string;
        charges?: string;
        general?: string;
    }>({});

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
    const [clientHighlightedIndex, setClientHighlightedIndex] = useState(0);
    const [bankHighlightedIndex, setBankHighlightedIndex] = useState(0);
    const [cardHighlightedIndex, setCardHighlightedIndex] = useState(0);

    // Debounced search timers
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced client search with error handling
    const debouncedClientSearch = useCallback(async (searchTerm: string) => {
        if (clientSearchDebounceTimer.current) {
            clearTimeout(clientSearchDebounceTimer.current);
        }

        const timer = setTimeout(async () => {
            try {
                if (searchTerm.trim()) {
                    await dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
                } else {
                    dispatch(clearClientAutocomplete());
                }
            } catch (error) {
                logger.error('Failed to search clients:', error);
                toast.error('Failed to search clients. Please try again.');
            }
        }, 300);

        clientSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Debounced bank search with error handling
    const debouncedBankSearch = useCallback(async (searchTerm: string) => {
        if (bankSearchDebounceTimer.current) {
            clearTimeout(bankSearchDebounceTimer.current);
        }

        const timer = setTimeout(async () => {
            try {
                if (searchTerm.trim()) {
                    await dispatch(fetchBankAutocomplete({ search: searchTerm, limit: 5 }));
                } else {
                    dispatch(clearBankAutocomplete());
                }
            } catch (error) {
                logger.error('Failed to search banks:', error);
                toast.error('Failed to search banks. Please try again.');
            }
        }, 300);

        bankSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Debounced card search with error handling
    const debouncedCardSearch = useCallback(async (searchTerm: string) => {
        if (cardSearchDebounceTimer.current) {
            clearTimeout(cardSearchDebounceTimer.current);
        }

        const timer = setTimeout(async () => {
            try {
                if (searchTerm.trim()) {
                    await dispatch(fetchCardAutocomplete({ search: searchTerm, limit: 5 }));
                } else {
                    dispatch(clearCardAutocomplete());
                }
            } catch (error) {
                logger.error('Failed to search cards:', error);
                toast.error('Failed to search cards. Please try again.');
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

    // Reset highlighted indices when items change
    useEffect(() => {
        setClientHighlightedIndex(0);
    }, [clientAutocompleteItems]);

    useEffect(() => {
        setBankHighlightedIndex(0);
    }, [bankAutocompleteItems]);

    useEffect(() => {
        setCardHighlightedIndex(0);
    }, [cardAutocompleteItems]);

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
        
        // Clear field-specific errors when user starts typing
        if (formErrors[field as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleClientSelect = (client: { id: number; name: string }) => {
        try {
            setFormData(prev => ({
                ...prev,
                client: client.name,
                clientId: client.id
            }));
            setClientSearch('');
            setShowClientDropdown(false);
            setClientHighlightedIndex(0);
            // Clear client error when valid client is selected
            setFormErrors(prev => ({ ...prev, client: undefined }));
        } catch (error) {
            logger.error('Error selecting client:', error);
            showBoundary(error);
        }
    };

    const handleBankSelect = (bank: { id: number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            bank: bank.name,
            bankId: bank.id
        }));
        setBankSearch('');
        setShowBankDropdown(false);
        setBankHighlightedIndex(0);
    };

    const handleCardSelect = (card: { id: number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            card: card.name,
            cardId: card.id
        }));
        setCardSearch('');
        setShowCardDropdown(false);
        setCardHighlightedIndex(0);
    };

    const handleClientRemove = () => {
        setFormData(prev => ({
            ...prev,
            client: '',
            clientId: null
        }));
        setShowClientDropdown(true);
        setClientSearch('');
        setClientHighlightedIndex(0);
    };

    const handleBankRemove = () => {
        setFormData(prev => ({
            ...prev,
            bank: '',
            bankId: null
        }));
        setShowBankDropdown(true);
        setBankSearch('');
        setBankHighlightedIndex(0);
    };

    const handleCardRemove = () => {
        setFormData(prev => ({
            ...prev,
            card: '',
            cardId: null
        }));
        setShowCardDropdown(true);
        setCardSearch('');
        setCardHighlightedIndex(0);
    };

    // Keyboard navigation handlers
    const handleClientKeyDown = (e: React.KeyboardEvent) => {
        if (!showClientDropdown || clientAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setClientHighlightedIndex(prev => 
                    prev < clientAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setClientHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : clientAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (clientAutocompleteItems.length > 0) {
                    handleClientSelect(clientAutocompleteItems[clientHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowClientDropdown(false);
                setClientSearch('');
                setClientHighlightedIndex(0);
                break;
        }
    };

    const handleBankKeyDown = (e: React.KeyboardEvent) => {
        if (!showBankDropdown || bankAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setBankHighlightedIndex(prev => 
                    prev < bankAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setBankHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : bankAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (bankAutocompleteItems.length > 0) {
                    handleBankSelect(bankAutocompleteItems[bankHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowBankDropdown(false);
                setBankSearch('');
                setBankHighlightedIndex(0);
                break;
        }
    };

    const handleCardKeyDown = (e: React.KeyboardEvent) => {
        if (!showCardDropdown || cardAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setCardHighlightedIndex(prev => 
                    prev < cardAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setCardHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : cardAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (cardAutocompleteItems.length > 0) {
                    handleCardSelect(cardAutocompleteItems[cardHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowCardDropdown(false);
                setCardSearch('');
                setCardHighlightedIndex(0);
                break;
        }
    };

    // Form validation function (Expected Error Handling)
    const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
        const errors: { [key: string]: string } = {};

        // Client validation
        if (!formData.clientId || !formData.client) {
            errors.client = 'Please select a client';
        }

        // Amount validation
        if (!formData.amount) {
            errors.amount = 'Please enter an amount';
        } else {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                errors.amount = 'Please enter a valid amount greater than 0';
            } else if (amount > 10000000) { // 10 million limit
                errors.amount = 'Amount cannot exceed ₹10,000,000';
            }
        }

        // Charges validation
        if (formData.chargesPct) {
            const charges = parseFloat(formData.chargesPct);
            if (isNaN(charges) || charges < 0) {
                errors.charges = 'Charges must be a valid percentage (0 or greater)';
            } else if (charges > 100) {
                errors.charges = 'Charges cannot exceed 100%';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const handleSaveWithdraw = async () => {
        try {
            // Clear previous errors
            setFormErrors({});

            // Validate form (Expected Error Handling)
            const validation = validateForm();
            if (!validation.isValid) {
                setFormErrors(validation.errors);
                toast.error('Please fix the form errors and try again');
                return;
            }

            logger.log('Creating withdraw with data:', formData);

            const chargesAmount = parseFloat(formData.chargesPct) || 0;
            const transactionAmount = parseFloat(formData.amount);

            const transactionData = {
                client_id: formData.clientId!,
                transaction_type: 1, // 1 for withdraw
                widthdraw_charges: chargesAmount,
                transaction_amount: transactionAmount,
                bank_id: formData.bankId || undefined,
                card_id: formData.cardId || undefined,
                remark: formData.notes || undefined
            };

            const result = await dispatch(createTransaction(transactionData));
            
            if (createTransaction.fulfilled.match(result)) {
                logger.log('Withdraw created successfully:', result.payload);
                toast.success('Withdraw created successfully');
                onBackToTransactions();
            } else if (createTransaction.rejected.match(result)) {
                // Handle expected API errors
                const errorMessage = result.payload || 'Failed to create withdraw';
                setFormErrors({ general: errorMessage });
                toast.error(errorMessage);
            }
        } catch (error) {
            // Handle unexpected errors
            logger.error('Unexpected error creating withdraw:', error);
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        logger.log('Cancelled withdraw creation');
        onCancel();
    };

    const handleBackToTransactions = () => {
        logger.log('Back to transactions');
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
                    <button className="main__button" onClick={handleSaveWithdraw} disabled={transactionLoading}>
                        <Save size={16} />
                        {transactionLoading ? 'Saving...' : 'Save Withdraw'}
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
                                                    setClientHighlightedIndex(0);
                                                }, 200)}
                                                onKeyDown={handleClientKeyDown}
                                                autoComplete="off"
                                            />
                                            {showClientDropdown && clientSearch && (
                                                <div className="aw__dropdown">
                                                    {clientLoading ? (
                                                        <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                            Loading...
                                                        </div>
                                                    ) : clientAutocompleteItems.length > 0 ? (
                                                        clientAutocompleteItems.map((client, index) => (
                                                            <div
                                                                key={client.id}
                                                                className={`aw__dropdown-item ${index === clientHighlightedIndex ? 'aw__dropdown-item--highlighted' : ''}`}
                                                                onClick={() => handleClientSelect(client)}
                                                                onMouseEnter={() => setClientHighlightedIndex(index)}
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
                            {formErrors.client && (
                                <span className="aw__error">{formErrors.client}</span>
                            )}
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
                                                        setBankHighlightedIndex(0);
                                                    }, 200)}
                                                    onKeyDown={handleBankKeyDown}
                                                    autoComplete="off"
                                                />
                                                {showBankDropdown && bankSearch && (
                                                    <div className="aw__dropdown">
                                                        {bankLoading ? (
                                                            <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                                Loading...
                                                            </div>
                                                        ) : bankAutocompleteItems.length > 0 ? (
                                                            bankAutocompleteItems.map((bank, index) => (
                                                                <div
                                                                    key={bank.id}
                                                                    className={`aw__dropdown-item ${index === bankHighlightedIndex ? 'aw__dropdown-item--highlighted' : ''}`}
                                                                    onClick={() => handleBankSelect(bank)}
                                                                    onMouseEnter={() => setBankHighlightedIndex(index)}
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
                                                        setCardHighlightedIndex(0);
                                                    }, 200)}
                                                    onKeyDown={handleCardKeyDown}
                                                    autoComplete="off"
                                                />
                                                {showCardDropdown && cardSearch && (
                                                    <div className="aw__dropdown">
                                                        {cardLoading ? (
                                                            <div className="aw__dropdown-item aw__dropdown-item--loading">
                                                                Loading...
                                                            </div>
                                                        ) : cardAutocompleteItems.length > 0 ? (
                                                            cardAutocompleteItems.map((card, index) => (
                                                                <div
                                                                    key={card.id}
                                                                    className={`aw__dropdown-item ${index === cardHighlightedIndex ? 'aw__dropdown-item--highlighted' : ''}`}
                                                                    onClick={() => handleCardSelect(card)}
                                                                    onMouseEnter={() => setCardHighlightedIndex(index)}
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
                                    className={`aw__input ${formErrors.amount ? 'aw__input--error' : ''}`}
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    onFocus={e => e.target.select()}
                                    placeholder="₹ 0.00"
                                />
                                {formErrors.amount && (
                                    <span className="aw__error">{formErrors.amount}</span>
                                )}
                                <span className="aw__hint">Enter the amount to withdraw.</span>
                            </div>

                            <div className="aw__field">
                                <label className="aw__label">
                                    <Percent size={16} />
                                    Charges (%)
                                </label>
                                <input
                                    type="text"
                                    className={`aw__input ${formErrors.charges ? 'aw__input--error' : ''}`}
                                    value={formData.chargesPct}
                                    onChange={(e) => handleInputChange('chargesPct', e.target.value)}
                                    onFocus={e => e.target.select()}
                                    placeholder="0"
                                />
                                {formErrors.charges && (
                                    <span className="aw__error">{formErrors.charges}</span>
                                )}
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
                                onFocus={e => e.target.select()}
                                placeholder="Optional notes for this withdrawal..."
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* General Error Display */}
                    {formErrors.general && (
                        <div className="aw__error-section">
                            <span className="aw__error">{formErrors.general}</span>
                            <button 
                                type="button"
                                className="aw__retry"
                                onClick={() => setFormErrors(prev => ({ ...prev, general: undefined }))}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <div className="main__footer-actions">
                        <button className="main__icon-button" onClick={handleBackToTransactions}>
                            <ArrowLeft size={16} />
                            Back to Transactions
                        </button>
                        <button className="main__button" onClick={handleSaveWithdraw} disabled={transactionLoading}>
                            <CheckCircle2 size={16} />
                            {transactionLoading ? 'Creating...' : 'Confirm & Add Withdraw'}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Main wrapper component with ErrorBoundary
const AddWithdrawScreen: React.FC<AddWithdrawScreenProps> = ({ onCancel, onBackToTransactions }) => {
    return (
        <ErrorBoundary
            FallbackComponent={(props) => (
                <AddWithdrawErrorFallback {...props} onCancel={onCancel} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Add Withdraw Error Boundary caught an error:', error, errorInfo);
                toast.error('Add withdraw form encountered an error');
            }}
            onReset={() => {
                logger.log('Add Withdraw Error Boundary reset');
            }}
        >
            <AddWithdrawScreenContent 
                onCancel={onCancel}
                onBackToTransactions={onBackToTransactions}
            />
        </ErrorBoundary>
    );
};

export default AddWithdrawScreen;

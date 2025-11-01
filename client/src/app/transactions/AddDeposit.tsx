'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownCircle, X, Save, User, IndianRupee, StickyNote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { createTransaction } from '../../store/actions/transactionActions';
import './AddDeposit.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface AddDepositScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

const AddDepositScreen: React.FC<AddDepositScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const dispatch = useAppDispatch();
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);
    const { loading: transactionLoading, error: transactionError } = useAppSelector(state => state.transactions);

    const [formData, setFormData] = useState({
        client: '',
        clientId: null as number | null,
        amount: '',
        notes: ''
    });

    // Client autocomplete states
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

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

    // Effect to handle client search changes
    useEffect(() => {
        if (showClientDropdown) {
            debouncedClientSearch(clientSearch);
        }
    }, [clientSearch, debouncedClientSearch, showClientDropdown]);

    // Reset highlighted index when items change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [clientAutocompleteItems]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clientSearchDebounceTimer.current) {
                clearTimeout(clientSearchDebounceTimer.current);
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
        setHighlightedIndex(0);
    };

    const handleClientRemove = () => {
        setFormData(prev => ({
            ...prev,
            client: '',
            clientId: null
        }));
        setShowClientDropdown(true);
        setClientSearch('');
        setHighlightedIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showClientDropdown || clientAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < clientAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : clientAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (clientAutocompleteItems.length > 0) {
                    handleClientSelect(clientAutocompleteItems[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowClientDropdown(false);
                setClientSearch('');
                setHighlightedIndex(0);
                break;
        }
    };

    const handleSaveDeposit = async () => {
        // Validate required fields
        if (!formData.clientId) {
            alert('Please select a client');
            return;
        }
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const transactionData = {
                client_id: formData.clientId,
                transaction_type: 0, // 0 for deposit
                widthdraw_charges: 0, // No charges for deposits
                transaction_amount: parseFloat(formData.amount),
                remark: formData.notes || undefined
            };

            const result = await dispatch(createTransaction(transactionData));
            
            if (createTransaction.fulfilled.match(result)) {
                logger.log('Deposit created successfully:', result.payload);
                toast.success('Deposit created.');
                // Navigate back to transactions list
                onBackToTransactions();
            } else {
                logger.error('Failed to create deposit:', result.payload);
                toast.error('Failed to create deposit.');
            }
        } catch (error) {
            logger.error('Error creating deposit:', error);
            toast.error('Failed to create deposit.');
        }
    };

    const handleCancel = () => {
        logger.log('Cancelled deposit creation');
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
                    <ArrowDownCircle size={16} className="main__header-icon--success" />
                    <h1>New Deposit</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="main__button" onClick={handleSaveDeposit} disabled={transactionLoading}>
                        <Save size={16} />
                        {transactionLoading ? 'Saving...' : 'Save Deposit'}
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Deposit Details</h2>
                            {/* <div className="main__tag main__tag--success">
                                <ArrowDownCircle size={16} />
                                Deposit
                            </div> */}
                        </div>
                        <p className="main__subtitle">Only the essentials to record a deposit.</p>
                        
                    </div>

                    <div className="ad__form">
                        <div className="ad__field">
                            <label className="ad__label">
                                <User size={16} />
                                Select Client
                            </label>
                            <div className="ad__client-autocomplete">
                                <div className="ad__client-input">
                                    {formData.client && !showClientDropdown && (
                                        <div className="ad__client-token">
                                            <User size={14} />
                                            <span>{formData.client}</span>
                                            <button
                                                type="button"
                                                className="ad__client-remove"
                                                onClick={handleClientRemove}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {(!formData.client || showClientDropdown) && (
                                        <div className="ad__client-search" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="ad__input"
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
                                                    setHighlightedIndex(0);
                                                }, 200)}
                                                onKeyDown={handleKeyDown}
                                                autoComplete="off"
                                            />
                                            {showClientDropdown && clientSearch && (
                                                <div className="ad__client-dropdown">
                                                    {clientLoading ? (
                                                        <div className="ad__client-option ad__client-option--loading">
                                                            Loading...
                                                        </div>
                                                    ) : clientAutocompleteItems.length > 0 ? (
                                                        clientAutocompleteItems.map((client, index) => (
                                                            <div
                                                                key={client.id}
                                                                className={`ad__client-option ${index === highlightedIndex ? 'ad__client-option--highlighted' : ''}`}
                                                                onClick={() => handleClientSelect(client)}
                                                                onMouseEnter={() => setHighlightedIndex(index)}
                                                            >
                                                                {client.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="ad__client-option ad__client-option--no-results">
                                                            No clients found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="ad__hint">Choose an existing client.</span>
                        </div>

                        <div className="ad__field">
                            <label className="ad__label">
                                <IndianRupee size={16} />
                                Deposit Amount (₹)
                            </label>
                            <input
                                type="text"
                                className="ad__input"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                onFocus={e => e.target.select()}
                                placeholder="0.00"
                            />
                            <span className="ad__hint">Amount received from client.</span>
                        </div>

                        <div className="ad__field">
                            <label className="ad__label">
                                <StickyNote size={16} />
                                Notes
                            </label>
                            <textarea
                                className="ad__textarea"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                onFocus={e => e.target.select()}
                                placeholder="Reference, purpose, or any internal notes..."
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="main__footer-actions">
                        <button className="main__icon-button" onClick={handleBackToTransactions}>
                            <ArrowLeft size={16} />
                            Back to Transactions
                        </button>
                        <button className="main__button" onClick={handleSaveDeposit} disabled={transactionLoading}>
                            <CheckCircle2 size={16} />
                            {transactionLoading ? 'Creating...' : 'Confirm & Add Deposit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDepositScreen;

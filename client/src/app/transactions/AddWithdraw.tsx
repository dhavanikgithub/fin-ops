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
import { AutocompleteInput, NumericInput, TextArea, AutocompleteOption } from '@/components/FormInputs';
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
        client: null as AutocompleteOption | null,
        bank: null as AutocompleteOption | null,
        card: null as AutocompleteOption | null,
        amount: 0,
        chargesPct: 0,
        notes: ''
    });

    // Debounced search timers
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Search handlers with debouncing
    const handleClientSearch = useCallback((searchTerm: string) => {
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

    const handleBankSearch = useCallback((searchTerm: string) => {
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

    const handleCardSearch = useCallback((searchTerm: string) => {
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

    // Form field change handlers
    const handleClientChange = (client: AutocompleteOption | null) => {
        setFormData(prev => ({ ...prev, client }));
        if (client && formErrors.client) {
            setFormErrors(prev => ({ ...prev, client: undefined }));
        }
    };

    const handleBankChange = (bank: AutocompleteOption | null) => {
        setFormData(prev => ({ ...prev, bank }));
    };

    const handleCardChange = (card: AutocompleteOption | null) => {
        setFormData(prev => ({ ...prev, card }));
    };

    const handleAmountChange = (amount: number) => {
        setFormData(prev => ({ ...prev, amount }));
        if (formErrors.amount) {
            setFormErrors(prev => ({ ...prev, amount: undefined }));
        }
    };

    const handleChargesChange = (chargesPct: number) => {
        setFormData(prev => ({ ...prev, chargesPct }));
        if (formErrors.charges) {
            setFormErrors(prev => ({ ...prev, charges: undefined }));
        }
    };

    const handleNotesChange = (notes: string) => {
        setFormData(prev => ({ ...prev, notes }));
    };

    // Form validation function (Expected Error Handling)
    const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
        const errors: { [key: string]: string } = {};

        // Client validation
        if (!formData.client) {
            errors.client = 'Please select a client';
        }

        // Amount validation
        if (formData.amount <= 0) {
            errors.amount = 'Please enter a valid amount greater than 0';
        } else if (formData.amount > 10000000) { // 10 million limit
            errors.amount = 'Amount cannot exceed ₹10,000,000';
        }

        // Charges validation
        if (formData.chargesPct < 0) {
            errors.charges = 'Charges must be a valid percentage (0 or greater)';
        } else if (formData.chargesPct > 100) {
            errors.charges = 'Charges cannot exceed 100%';
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

            const transactionData = {
                client_id: formData.client!.id,
                transaction_type: 1, // 1 for withdraw
                widthdraw_charges: formData.chargesPct,
                transaction_amount: formData.amount,
                bank_id: formData.bank?.id || undefined,
                card_id: formData.card?.id || undefined,
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
                        <AutocompleteInput
                            value={formData.client}
                            onChange={handleClientChange}
                            options={clientAutocompleteItems}
                            loading={clientLoading}
                            label="Select Client"
                            placeholder="Search client..."
                            icon={<User size={16} />}
                            onSearch={handleClientSearch}
                            error={formErrors.client}
                            hint="Search existing clients to withdraw funds."
                            className="aw__field"
                        />

                        <div className="aw__dual">
                            <AutocompleteInput
                                value={formData.bank}
                                onChange={handleBankChange}
                                options={bankAutocompleteItems}
                                loading={bankLoading}
                                label="From Bank"
                                placeholder="Search bank..."
                                icon={<Building2 size={16} />}
                                onSearch={handleBankSearch}
                                hint="Source account for withdrawal."
                                className="aw__field"
                            />

                            <AutocompleteInput
                                value={formData.card}
                                onChange={handleCardChange}
                                options={cardAutocompleteItems}
                                loading={cardLoading}
                                label="Card"
                                placeholder="Search card..."
                                icon={<CreditCard size={16} />}
                                onSearch={handleCardSearch}
                                hint="Linked card for transaction (optional)."
                                className="aw__field"
                            />
                        </div>

                        <div className="aw__dual">
                            <NumericInput
                                value={formData.amount}
                                onChange={handleAmountChange}
                                label="Withdraw Amount"
                                placeholder="₹ 0.00"
                                icon={<IndianRupee size={16} />}
                                min={0}
                                max={10000000}
                                showClearButton={true}
                                error={formErrors.amount}
                                hint="Enter the amount to withdraw."
                                className="aw__field"
                            />

                            <NumericInput
                                value={formData.chargesPct}
                                onChange={handleChargesChange}
                                label="Charges (%)"
                                placeholder="0"
                                icon={<Percent size={16} />}
                                min={0}
                                max={100}
                                showClearButton={true}
                                error={formErrors.charges}
                                hint="Enter fee percentage to apply."
                                className="aw__field"
                            />
                        </div>

                        <TextArea
                            value={formData.notes}
                            onChange={handleNotesChange}
                            label="Notes"
                            placeholder="Optional notes for this withdrawal..."
                            icon={<StickyNote size={16} />}
                            rows={5}
                            className="aw__field"
                        />
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

'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownCircle, X, Save, User, IndianRupee, StickyNote, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { createTransaction } from '../../store/actions/transactionActions';
import { AutocompleteInput, NumericInput, TextArea, AutocompleteOption } from '@/components/FormInputs';
import './AddDeposit.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface AddDepositScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

// Error Fallback Component for Add Deposit
const AddDepositErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
}> = ({ error, resetErrorBoundary, onCancel }) => {
    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} className="main__header-icon--error" />
                    <h1>Add Deposit Error</h1>
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
                    <div className="ad__error-boundary">
                        <div className="ad__error-boundary-content">
                            <AlertTriangle size={48} className="ad__error-boundary-icon" />
                            <h3 className="ad__error-boundary-title">Something went wrong</h3>
                            <p className="ad__error-boundary-message">
                                We encountered an unexpected error while preparing the deposit form. 
                                Your data is safe, and you can try again.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="ad__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="ad__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="ad__error-boundary-actions">
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

const AddDepositScreenContent: React.FC<AddDepositScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);
    const { loading: transactionLoading, error: transactionError } = useAppSelector(state => state.transactions);

    // Form validation errors (Expected Errors)
    const [formErrors, setFormErrors] = useState<{
        client?: string;
        amount?: string;
        general?: string;
    }>({});

    const [formData, setFormData] = useState({
        client: null as AutocompleteOption | null,
        amount: 0,
        notes: ''
    });

    // Debounced client search timer
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced client search with error handling
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
                // Handle expected API errors for client search
                logger.error('Failed to search clients:', error);
                toast.error('Failed to search clients. Please try again.');
            }
        }, 300);

        clientSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clientSearchDebounceTimer.current) {
                clearTimeout(clientSearchDebounceTimer.current);
            }
        };
    }, []);

    const handleClientChange = (client: AutocompleteOption | null) => {
        setFormData(prev => ({ ...prev, client }));
        // Clear client error when valid client is selected
        if (client && formErrors.client) {
            setFormErrors(prev => ({ ...prev, client: undefined }));
        }
    };

    const handleAmountChange = (amount: number) => {
        setFormData(prev => ({ ...prev, amount }));
        // Clear amount error when user changes value
        if (formErrors.amount) {
            setFormErrors(prev => ({ ...prev, amount: undefined }));
        }
    };

    const handleNotesChange = (notes: string) => {
        setFormData(prev => ({ ...prev, notes }));
    };

    // Form validation function (Expected Error Handling)
    const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
        const errors: { [key: string]: string } = {};

        if (!formData.client) {
            errors.client = 'Please select a client';
        }

        if (formData.amount <= 0) {
            errors.amount = 'Please enter a valid amount greater than 0';
        } else if (formData.amount > 10000000) { // 10 million limit
            errors.amount = 'Amount cannot exceed ₹10,000,000';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const handleSaveDeposit = async () => {
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

            logger.log('Creating deposit with data:', formData);

            const transactionData = {
                client_id: formData.client!.id,
                transaction_type: 0, // 0 for deposit
                widthdraw_charges: 0, // No charges for deposits
                transaction_amount: formData.amount,
                remark: formData.notes || undefined
            };

            const result = await dispatch(createTransaction(transactionData));
            
            if (createTransaction.fulfilled.match(result)) {
                logger.log('Deposit created successfully:', result.payload);
                toast.success('Deposit created successfully');
                // Navigate back to transactions list
                onBackToTransactions();
            } else if (createTransaction.rejected.match(result)) {
                // Handle expected API errors
                const errorMessage = result.payload || 'Failed to create deposit';
                setFormErrors({ general: errorMessage });
                toast.error(errorMessage);
            }
        } catch (error) {
            // Handle unexpected errors
            logger.error('Unexpected error creating deposit:', error);
            showBoundary(error);
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
                            hint="Choose an existing client."
                            className="ad__field"
                        />

                        <NumericInput
                            value={formData.amount}
                            onChange={handleAmountChange}
                            label="Deposit Amount (₹)"
                            placeholder="0.00"
                            icon={<IndianRupee size={16} />}
                            min={0}
                            max={10000000}
                            showClearButton={true}
                            error={formErrors.amount}
                            hint="Amount received from client."
                            className="ad__field"
                        />

                        <TextArea
                            value={formData.notes}
                            onChange={handleNotesChange}
                            label="Notes"
                            placeholder="Reference, purpose, or any internal notes..."
                            icon={<StickyNote size={16} />}
                            rows={5}
                            className="ad__field"
                        />
                    </div>

                    {/* General Error Display */}
                    {formErrors.general && (
                        <div className="ad__error-section">
                            <span className="ad__error">{formErrors.general}</span>
                            <button 
                                type="button"
                                className="ad__retry"
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

// Main wrapper component with ErrorBoundary
const AddDepositScreen: React.FC<AddDepositScreenProps> = ({ onCancel, onBackToTransactions }) => {
    return (
        <ErrorBoundary
            FallbackComponent={(props) => (
                <AddDepositErrorFallback {...props} onCancel={onCancel} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Add Deposit Error Boundary caught an error:', error, errorInfo);
                toast.error('Add deposit form encountered an error');
            }}
            onReset={() => {
                logger.log('Add Deposit Error Boundary reset');
            }}
        >
            <AddDepositScreenContent 
                onCancel={onCancel}
                onBackToTransactions={onBackToTransactions}
            />
        </ErrorBoundary>
    );
};

export default AddDepositScreen;

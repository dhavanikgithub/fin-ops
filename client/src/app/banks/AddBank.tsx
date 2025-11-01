'use client';
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Building2, X, Save, Calendar, LayoutDashboard, IndianRupee, StickyNote, ArrowLeft, CheckCircle2, Loader, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBank } from '../../store/actions/bankActions';
import { clearError } from '../../store/slices/bankSlice';
import './AddBank.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface AddBankScreenProps {
    onCancel: () => void;
    onBackToBanks: () => void;
}

export interface BankFormData {
    bankName: string;
    notes: string;
}

interface AddBankErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
    onBackToBanks: () => void;
}

const AddBankErrorFallback: React.FC<AddBankErrorFallbackProps> = ({ 
    error, 
    resetErrorBoundary, 
    onCancel, 
    onBackToBanks 
}) => {
    return (
        <div className="add-bank-error-boundary">
            <header className="main__header">
                <div className="main__header-left">
                    <Building2 size={16} />
                    <h1>Add New Bank</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={onBackToBanks}>
                        <ArrowLeft size={16} />
                        Back to Banks
                    </button>
                </div>
            </header>
            
            <div className="error-boundary__content">
                <div className="error-boundary__icon">
                    <Building2 size={48} />
                </div>
                <h2 className="error-boundary__title">Add Bank Form Error</h2>
                <p className="error-boundary__message">
                    We encountered an issue with the add bank form. Your data is safe and you can try again.
                </p>
                <div className="error-boundary__actions">
                    <button className="error-boundary__button" onClick={resetErrorBoundary}>
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                    <button className="error-boundary__button error-boundary__button--secondary" onClick={onBackToBanks}>
                        <ArrowLeft size={16} />
                        Back to Banks
                    </button>
                    <button 
                        className="error-boundary__button error-boundary__button--secondary"
                        onClick={() => window.location.href = '/'}
                    >
                        <Home size={16} />
                        Go to Dashboard
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="error-boundary__details">
                        <summary>Technical Details (Development)</summary>
                        <pre className="error-boundary__error-text">
                            {error.message}
                            {error.stack && '\n\nStack trace:\n' + error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

const AddBankContent: React.FC<AddBankScreenProps> = ({ onCancel, onBackToBanks }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { creating, error } = useAppSelector(state => state.banks);
    
    const [formData, setFormData] = useState<BankFormData>({
        bankName: '',
        notes: ''
    });
    
    const [creationAttempted, setCreationAttempted] = useState(false);

    // Clear error when component mounts
    useEffect(() => {
        try {
            if (error) {
                dispatch(clearError());
            }
        } catch (err) {
            logger.error('Error clearing bank error state:', err);
            showBoundary(err);
        }
    }, [dispatch, error, showBoundary]);

    // Handle successful creation
    useEffect(() => {
        try {
            if (creationAttempted && !creating && !error) {
                // Success! Navigate back to banks
                toast.success('Bank created successfully!');
                logger.info('Bank created successfully, navigating back to banks');
                onBackToBanks();
            }
        } catch (err) {
            logger.error('Error handling successful bank creation:', err);
            showBoundary(err);
        }
    }, [creating, error, creationAttempted, onBackToBanks, showBoundary]);

    const handleInputChange = (field: keyof BankFormData, value: string) => {
        try {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            logger.debug(`Updated ${field} field`, { field, valueLength: value.length });
        } catch (err) {
            logger.error('Error updating form data:', err);
            toast.error('Failed to update form field');
            showBoundary(err);
        }
    };

    const handleSaveBank = async () => {
        try {
            if (!formData.bankName.trim()) {
                toast.error('Bank name is required');
                return;
            }

            setCreationAttempted(true);
            logger.info('Attempting to create bank:', { bankName: formData.bankName.trim() });
            
            await dispatch(createBank({
                name: formData.bankName.trim()
            }));
            // Success handling is done in the useEffect above
        } catch (error) {
            logger.error('Failed to create bank:', error);
            toast.error('Failed to create bank. Please try again.');
            setCreationAttempted(false);
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        try {
            if (creating) {
                toast.error('Cannot cancel while creating bank');
                return;
            }
            logger.debug('Cancelling add bank form');
            onCancel();
        } catch (err) {
            logger.error('Error cancelling add bank form:', err);
            showBoundary(err);
        }
    };

    const handleBackToBanks = () => {
        try {
            if (creating) {
                toast.error('Cannot navigate while creating bank');
                return;
            }
            logger.debug('Navigating back to banks list');
            onBackToBanks();
        } catch (err) {
            logger.error('Error navigating back to banks:', err);
            showBoundary(err);
        }
    };

    const isFormValid = formData.bankName.trim().length > 0;
    const isDisabled = creating;

    try {
        return (
            <div className="main">
                <header className="main__header">
                    <div className="main__header-left">
                        <Building2 size={16} />
                        <h1>Add New Bank</h1>
                    </div>
                    <div className="main__header-right">
                        <button 
                            className="main__icon-button" 
                            onClick={handleBackToBanks}
                            disabled={isDisabled}
                        >
                            <ArrowLeft size={16} />
                            Back to Banks
                        </button>
                        <button 
                            className={`main__button ${!isFormValid ? 'main__button--disabled' : ''}`}
                            onClick={handleSaveBank}
                            disabled={isDisabled || !isFormValid}
                        >
                            {creating ? (
                                <>
                                    <Loader className="spinner" size={16} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Bank
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="main__content">
                    <div className="main__view">
                        <div className="main__view-header">
                            <div className="main__title-row">
                                <h2 className="main__title">Bank Details</h2>
                            </div>
                            <p className="main__subtitle">Keep it minimal: name and note only.</p>
                        </div>

                        <div className="ab__form">
                            

                            <div className="ab__field">
                                <label className="ab__label">
                                    <Building2 size={16} />
                                    Bank Name *
                                </label>
                                <input
                                    type="text"
                                    className={`ab__input ${!isFormValid && creationAttempted ? 'ab__input--error' : ''}`}
                                    value={formData.bankName}
                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    onFocus={e => e.target.select()}
                                    placeholder="Enter bank name"
                                    disabled={isDisabled}
                                />
                                <span className="ab__hint">Example: HDFC Bank, Axis Bank, etc.</span>
                                {!isFormValid && creationAttempted && (
                                    <span className="ab__error">Bank name is required</span>
                                )}
                            </div>

                            <div className="ab__field">
                                <label className="ab__label">
                                    <StickyNote size={16} />
                                    Notes (Optional)
                                </label>
                                <textarea
                                    className="ab__textarea"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    onFocus={e => e.target.select()}
                                    placeholder="Any additional notes about this bank..."
                                    rows={4}
                                    disabled={isDisabled}
                                />
                            </div>

                            {error && (
                                <div className="ab__error-message">
                                    <X size={16} />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="main__footer-actions">
                            <button 
                                className="main__icon-button" 
                                onClick={handleCancel}
                                disabled={isDisabled}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button 
                                className={`main__button ${!isFormValid ? 'main__button--disabled' : ''}`}
                                onClick={handleSaveBank}
                                disabled={isDisabled || !isFormValid}
                            >
                                {creating ? (
                                    <>
                                        <Loader className="spinner" size={16} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Create Bank
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering add bank form:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const AddBankScreen: React.FC<AddBankScreenProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <AddBankErrorFallback 
                    {...fallbackProps} 
                    onCancel={props.onCancel}
                    onBackToBanks={props.onBackToBanks}
                />
            )}
            onError={(error, errorInfo) => {
                logger.error('Add bank error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <AddBankContent {...props} />
        </ErrorBoundary>
    );
};

export default AddBankScreen;
'use client';
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Building2, X, Save, Calendar, LayoutDashboard, IndianRupee, StickyNote, ArrowLeft, CheckCircle2, Loader, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { TextInput, TextArea, Button } from '@/components/FormInputs';
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

// Error Fallback Component for Add Bank Screen
const AddBankErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
    onBackToBanks: () => void;
}> = ({ error, resetErrorBoundary, onCancel, onBackToBanks }) => {
    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Add Bank</h1>
                </div>
                <div className="main__header-right">
                    <Button 
                        variant="secondary"
                        icon={<X size={16} />}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="ab__error-boundary">
                        <div className="ab__error-boundary-content">
                            <AlertTriangle size={64} className="ab__error-boundary-icon" />
                            <h2 className="ab__error-boundary-title">Something went wrong</h2>
                            <p className="ab__error-boundary-message">
                                We encountered an unexpected error while setting up the bank creation form. 
                                Don&apos;t worry, no data has been lost. You can try again or go back to the banks list.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="ab__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="ab__error-boundary-stack">
                                        {error.message}
                                        {error.stack && '\n\nStack trace:\n' + error.stack}
                                    </pre>
                                </details>
                            )}
                            <div className="ab__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<ArrowLeft size={16} />}
                                    onClick={onBackToBanks}
                                >
                                    Back to Banks
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/'}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const AddBankContent: React.FC<AddBankScreenProps> = ({ onCancel, onBackToBanks }) => {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useAppDispatch();
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
    }, [dispatch, error]);

    // Handle successful creation
    useEffect(() => {
        try {
            if (creationAttempted && !creating && !error) {
                // Success! Navigate back to banks
                toast.success('Bank created');
                logger.info('Bank created successfully, navigating back to banks');
                onBackToBanks();
            }
        } catch (err) {
            logger.error('Error handling successful bank creation:', err);
            showBoundary(err);
        }
    }, [creating, error, creationAttempted, onBackToBanks]);

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
            <>
                <header className="main__header">
                    <div className="main__header-left">
                        <Building2 size={16} />
                        <h1>Add New Bank</h1>
                    </div>
                    <div className="main__header-right">
                        <Button 
                            variant="secondary"
                            icon={<ArrowLeft size={16} />}
                            onClick={handleBackToBanks}
                            disabled={isDisabled}
                        >
                            Back to Banks
                        </Button>
                        <Button 
                            variant="primary"
                            icon={creating ? undefined : <Save size={16} />}
                            onClick={handleSaveBank}
                            disabled={isDisabled || !isFormValid}
                            loading={creating}
                        >
                            {creating ? 'Saving...' : 'Save Bank'}
                        </Button>
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
                                <TextInput
                                    value={formData.bankName}
                                    onChange={(value) => handleInputChange('bankName', value)}
                                    placeholder="Enter bank name"
                                    disabled={isDisabled}
                                    error={!isFormValid && creationAttempted ? 'Bank name is required' : undefined}
                                />
                                <span className="ab__hint">Example: HDFC Bank, Axis Bank, etc.</span>
                            </div>

                            <div className="ab__field">
                                <label className="ab__label">
                                    <StickyNote size={16} />
                                    Notes (Optional)
                                </label>
                                <TextArea
                                    value={formData.notes}
                                    onChange={(value) => handleInputChange('notes', value)}
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
                            <Button 
                                variant="secondary"
                                icon={<X size={16} />}
                                onClick={handleCancel}
                                disabled={isDisabled}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary"
                                icon={creating ? undefined : <CheckCircle2 size={16} />}
                                onClick={handleSaveBank}
                                disabled={isDisabled || !isFormValid}
                                loading={creating}
                            >
                                {creating ? 'Creating...' : 'Create Bank'}
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    } catch (error) {
        logger.error('Error rendering add bank form:', error);
        showBoundary(error);
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
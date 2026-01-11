'use client';
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { CreditCard, X, Save, LayoutDashboard, StickyNote, ArrowLeft, CheckCircle2, Loader, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { TextInput, TextArea, Button } from '@/components/FormInputs';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCard } from '../../store/actions/cardActions';
import { clearError } from '../../store/slices/cardSlice';
import './AddCard.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface AddCardScreenProps {
    onCancel: () => void;
    onBackToCards: () => void;
}

export interface CardFormData {
    cardName: string;
    notes: string;
}

// Error Fallback Component for Add Card Screen
const AddCardErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
    onBackToCards: () => void;
}> = ({ error, resetErrorBoundary, onCancel, onBackToCards }) => {
    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Add Card</h1>
                </div>
                <div className="main__header-right">
                    <Button
                        variant="secondary"
                        icon={<X size={16} />}
                        onClick={onCancel}
                        className="main__icon-button"
                    >
                        Cancel
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="ac__error-boundary">
                        <div className="ac__error-boundary-content">
                            <AlertTriangle size={64} className="ac__error-boundary-icon" />
                            <h2 className="ac__error-boundary-title">Something went wrong</h2>
                            <p className="ac__error-boundary-message">
                                We encountered an unexpected error while setting up the card creation form. 
                                Don't worry, no data has been lost. You can try again or go back to the cards list.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="ac__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="ac__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="ac__error-boundary-actions">
                                <Button
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                    className="main__button"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<ArrowLeft size={16} />}
                                    onClick={onBackToCards}
                                    className="main__icon-button"
                                >
                                    Back to Cards
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/'}
                                    className="main__icon-button"
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

const AddCardScreenContent: React.FC<AddCardScreenProps> = ({ onCancel, onBackToCards }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { creating, error } = useAppSelector(state => state.cards);
    
    const [formData, setFormData] = useState<CardFormData>({
        cardName: '',
        notes: ''
    });
    
    const [creationAttempted, setCreationAttempted] = useState(false);

    // Clear error when component mounts
    useEffect(() => {
        try {
            if (error) {
                dispatch(clearError());
            }
        } catch (error) {
            logger.error('Error clearing previous errors:', error);
            showBoundary(error);
        }
    }, [dispatch, error, showBoundary]);

    // Handle successful creation
    useEffect(() => {
        try {
            if (creationAttempted && !creating && !error) {
                // Success! Navigate back to cards
                toast.success('Card created successfully!');
                logger.info('Card created successfully');
                onBackToCards();
            }
        } catch (error) {
            logger.error('Error in creation success handler:', error);
            showBoundary(error);
        }
    }, [creating, error, creationAttempted, onBackToCards, showBoundary]);

    const handleInputChange = (field: keyof CardFormData, value: string) => {
        try {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        } catch (error) {
            logger.error('Error updating form field:', error);
            toast.error('Failed to update form. Please try again.');
        }
    };

    const handleSaveCard = async () => {
        try {
            if (!formData.cardName.trim()) {
                toast.error('Card name is required');
                return;
            }

            setCreationAttempted(true);
            
            await dispatch(createCard({
                name: formData.cardName.trim()
            })).unwrap();
            // Success handling is done in the useEffect above
        } catch (error) {
            logger.error('Failed to create card:', error);
            toast.error('Failed to create card. Please try again.');
            setCreationAttempted(false);
        }
    };

    const handleCancel = () => {
        try {
            if (creating) return; // Prevent cancellation during creation
            logger.log('Cancelled card creation');
            onCancel();
        } catch (error) {
            logger.error('Error cancelling card creation:', error);
            showBoundary(error);
        }
    };

    const handleBackToCards = () => {
        try {
            if (creating) return; // Prevent navigation during creation
            logger.log('Back to cards');
            onBackToCards();
        } catch (error) {
            logger.error('Error navigating back to cards:', error);
            showBoundary(error);
        }
    };

    const isFormValid = formData.cardName.trim().length > 0;
    const isDisabled = creating;

    try {
        return (
            <>
                <header className="main__header">
                    <div className="main__header-left">
                        <CreditCard size={16} />
                        <h1>Add New Card</h1>
                    </div>
                    <div className="main__header-right">
                        <Button 
                            variant="secondary"
                            icon={<ArrowLeft size={16} />}
                            onClick={handleBackToCards}
                            disabled={isDisabled}
                            className="main__icon-button"
                        >
                            Back to Cards
                        </Button>
                        <Button 
                            variant="primary"
                            icon={creating ? undefined : <Save size={16} />}
                            onClick={handleSaveCard}
                            disabled={isDisabled || !isFormValid}
                            loading={creating}
                            className="main__button"
                        >
                            {creating ? 'Saving...' : 'Save Card'}
                        </Button>
                    </div>
                </header>

                <div className="main__content">
                    <div className="main__view">
                        <div className="main__view-header">
                            <div className="main__title-row">
                                <h2 className="main__title">Card Details</h2>
                            </div>
                            <p className="main__subtitle">Keep it minimal: name and note only.</p>
                        </div>

                        <div className="ac__form">
                            <div className="ac__field">
                                <label className="ac__label">
                                    <CreditCard size={16} />
                                    Card Name *
                                </label>
                                <TextInput
                                    value={formData.cardName}
                                    onChange={(value) => handleInputChange('cardName', value)}
                                    placeholder="Enter card name"
                                    disabled={isDisabled}
                                    error={!isFormValid && creationAttempted ? 'Card name is required' : undefined}
                                />
                                <span className="ac__hint">Example: Visa Credit Card, MasterCard Debit, etc.</span>
                            </div>

                            <div className="ac__field">
                                <label className="ac__label">
                                    <StickyNote size={16} />
                                    Notes (Optional)
                                </label>
                                <TextArea
                                    value={formData.notes}
                                    onChange={(value) => handleInputChange('notes', value)}
                                    placeholder="Any additional notes about this card..."
                                    rows={4}
                                    disabled={isDisabled}
                                />
                            </div>

                            {error && (
                                <div className="ac__error-message">
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
                                className="main__icon-button"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary"
                                icon={creating ? undefined : <CheckCircle2 size={16} />}
                                onClick={handleSaveCard}
                                disabled={isDisabled || !isFormValid}
                                loading={creating}
                                className="main__button"
                            >
                                {creating ? 'Creating...' : 'Create Card'}
                            </Button>
                        </div>
                    </div>

                    <div className="ac__side">
                        <div className="ac__side-title">Card Preview</div>
                        <div className="ac__summary">
                            <div className="ac__kpi">
                                <div className="ac__kpi-label">Name</div>
                                <div className="ac__kpi-value">{formData.cardName || 'Marketing Q4'}</div>
                            </div>
                            <div className="ac__kpi">
                                <div className="ac__kpi-label">Transactions</div>
                                <div className="ac__kpi-value">0</div>
                            </div>
                            <div className="ac__kpi">
                                <div className="ac__kpi-label">Status</div>
                                <div className="ac__kpi-value">Active</div>
                            </div>
                            <div className="ac__kpi">
                                <div className="ac__kpi-label">Created</div>
                                <div className="ac__kpi-value">Now</div>
                            </div>
                        </div>
                        <div className="ac__note">You can edit the name later. Transaction count is system-managed.</div>
                    </div>
                </div>
            </>
        );
    } catch (error) {
        logger.error('Error rendering add card form:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const AddCardScreen: React.FC<AddCardScreenProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <AddCardErrorFallback 
                    {...fallbackProps} 
                    onCancel={props.onCancel}
                    onBackToCards={props.onBackToCards}
                />
            )}
            onError={(error, errorInfo) => {
                logger.error('Add card screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <AddCardScreenContent {...props} />
        </ErrorBoundary>
    );
};

export default AddCardScreen;
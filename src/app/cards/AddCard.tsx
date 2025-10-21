'use client';
import React, { useState, useEffect } from 'react';
import { CreditCard, X, Save, LayoutDashboard, StickyNote, ArrowLeft, CheckCircle2, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCard } from '../../store/actions/cardActions';
import { clearError } from '../../store/slices/cardSlice';
import './AddCard.scss';

interface AddCardScreenProps {
    onCancel: () => void;
    onBackToCards: () => void;
}

export interface CardFormData {
    cardName: string;
    notes: string;
}

const AddCardScreen: React.FC<AddCardScreenProps> = ({ onCancel, onBackToCards }) => {
    const dispatch = useAppDispatch();
    const { creating, error } = useAppSelector(state => state.cards);
    
    const [formData, setFormData] = useState<CardFormData>({
        cardName: '',
        notes: ''
    });
    
    const [creationAttempted, setCreationAttempted] = useState(false);

    // Clear error when component mounts
    useEffect(() => {
        if (error) {
            dispatch(clearError());
        }
    }, [dispatch, error]);

    // Handle successful creation
    useEffect(() => {
        if (creationAttempted && !creating && !error) {
            // Success! Navigate back to cards
            onBackToCards();
        }
    }, [creating, error, creationAttempted, onBackToCards]);

    const handleInputChange = (field: keyof CardFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveCard = async () => {
        if (!formData.cardName.trim()) {
            return;
        }

        setCreationAttempted(true);
        
        try {
            await dispatch(createCard({
                name: formData.cardName.trim()
            }));
            // Success handling is done in the useEffect above
        } catch (error) {
            console.error('Failed to create card:', error);
            setCreationAttempted(false);
        }
    };

    const handleCancel = () => {
        if (creating) return; // Prevent cancellation during creation
        onCancel();
    };

    const handleBackToCards = () => {
        if (creating) return; // Prevent navigation during creation
        onBackToCards();
    };

    const isFormValid = formData.cardName.trim().length > 0;
    const isDisabled = creating;

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <CreditCard size={16} />
                    <h1>Add New Card</h1>
                </div>
                <div className="main__header-right">
                    <button 
                        className="main__icon-button" 
                        onClick={handleBackToCards}
                        disabled={isDisabled}
                    >
                        <ArrowLeft size={16} />
                        Back to Cards
                    </button>
                    <button 
                        className={`main__button ${!isFormValid ? 'main__button--disabled' : ''}`}
                        onClick={handleSaveCard}
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
                                Save Card
                            </>
                        )}
                    </button>
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
                            <input
                                type="text"
                                className={`ac__input ${!isFormValid && creationAttempted ? 'ac__input--error' : ''}`}
                                value={formData.cardName}
                                onChange={(e) => handleInputChange('cardName', e.target.value)}
                                placeholder="Enter card name"
                                disabled={isDisabled}
                            />
                            <span className="ac__hint">Example: Visa Credit Card, MasterCard Debit, etc.</span>
                            {!isFormValid && creationAttempted && (
                                <span className="ac__error">Card name is required</span>
                            )}
                        </div>

                        <div className="ac__field">
                            <label className="ac__label">
                                <StickyNote size={16} />
                                Notes (Optional)
                            </label>
                            <textarea
                                className="ac__textarea"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
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
                            onClick={handleSaveCard}
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
                                    Create Card
                                </>
                            )}
                        </button>
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
        </div>
    );
};

export default AddCardScreen;
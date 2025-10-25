'use client';
import React, { useState, useEffect } from 'react';
import { Building2, X, Save, Calendar, LayoutDashboard, IndianRupee, StickyNote, ArrowLeft, CheckCircle2, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBank } from '../../store/actions/bankActions';
import { clearError } from '../../store/slices/bankSlice';
import './AddBank.scss';
import logger from '@/utils/logger';

interface AddBankScreenProps {
    onCancel: () => void;
    onBackToBanks: () => void;
}

export interface BankFormData {
    bankName: string;
    notes: string;
}

const AddBankScreen: React.FC<AddBankScreenProps> = ({ onCancel, onBackToBanks }) => {
    const dispatch = useAppDispatch();
    const { creating, error } = useAppSelector(state => state.banks);
    
    const [formData, setFormData] = useState<BankFormData>({
        bankName: '',
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
            // Success! Navigate back to banks
            onBackToBanks();
        }
    }, [creating, error, creationAttempted, onBackToBanks]);

    const handleInputChange = (field: keyof BankFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveBank = async () => {
        if (!formData.bankName.trim()) {
            return;
        }

        setCreationAttempted(true);
        
        try {
            await dispatch(createBank({
                name: formData.bankName.trim()
            }));
            // Success handling is done in the useEffect above
        } catch (error) {
            logger.error('Failed to create bank:', error);
            setCreationAttempted(false);
        }
    };

    const handleCancel = () => {
        if (creating) return; // Prevent cancellation during creation
        onCancel();
    };

    const handleBackToBanks = () => {
        if (creating) return; // Prevent navigation during creation
        onBackToBanks();
    };

    const isFormValid = formData.bankName.trim().length > 0;
    const isDisabled = creating;

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
};

export default AddBankScreen;
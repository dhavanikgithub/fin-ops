'use client';
import React, { useState } from 'react';
import { CreditCard, X, Save, LayoutDashboard, StickyNote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AddCard.scss';

interface AddCardScreenProps {
    onCancel: () => void;
    onBackToCards: () => void;
}

export interface CardFormData {
    cardName: string;
    initialTransactionsCount: string;
    notes: string;
}

const AddCardScreen: React.FC<AddCardScreenProps> = ({ onCancel, onBackToCards }) => {
    const [formData, setFormData] = useState<CardFormData>({
        cardName: '',
        initialTransactionsCount: '0',
        notes: ''
    });

    const handleInputChange = (field: keyof CardFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveCard = () => {
        console.log('Saving card:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled card creation');
        onCancel();
    };

    const handleBackToCards = () => {
        console.log('Back to cards');
        onBackToCards();
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <CreditCard size={16} />
                    <h1>Add New Card</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleBackToCards}>
                        <ArrowLeft size={16} />
                        Back to Cards
                    </button>
                    <button className="main__button" onClick={handleSaveCard}>
                        <Save size={16} />
                        Save Card
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
                                Card Name
                            </label>
                            <input
                                type="text"
                                className="ac__input"
                                value={formData.cardName}
                                onChange={(e) => handleInputChange('cardName', e.target.value)}
                                placeholder="Enter card name"
                            />
                            <span className="ac__hint">Example: MasterCard</span>
                        </div>

                        <div className="ac__field">
                            <label className="ac__label">
                                <LayoutDashboard size={16} />
                                Initial Transactions Count
                            </label>
                            <input
                                type="text"
                                className="ac__input"
                                value={formData.initialTransactionsCount}
                                readOnly
                                disabled
                                placeholder="0 (read-only)"
                            />
                            <span className="ac__hint">Updates automatically as transactions are linked.</span>
                        </div>

                        <div className="ac__field">
                            <label className="ac__label">
                                <StickyNote size={16} />
                                Notes
                            </label>
                            <textarea
                                className="ac__textarea"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Any internal notes..."
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="main__footer-actions">
                        <button className="main__icon-button" onClick={handleCancel}>
                            <X size={16} />
                            Cancel
                        </button>
                        <button className="main__button" onClick={handleSaveCard}>
                            <CheckCircle2 size={16} />
                            Create Card
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
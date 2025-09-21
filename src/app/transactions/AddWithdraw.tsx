'use client';
import React, { useState } from 'react';
import { ArrowUpCircle, X, Save, User, Building2, CreditCard, IndianRupee, Percent, StickyNote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AddWithdraw.scss';

interface AddWithdrawScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

const AddWithdrawScreen: React.FC<AddWithdrawScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const [formData, setFormData] = useState({
        client: '',
        bank: '',
        card: '',
        amount: '',
        chargesPct: '0',
        notes: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveWithdraw = () => {
        console.log('Saving withdraw:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled withdraw creation');
        onCancel();
    };

    const handleBackToTransactions = () => {
        console.log('Back to transactions');
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
                    <button className="main__button" onClick={handleSaveWithdraw}>
                        <Save size={16} />
                        Save Withdraw
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
                            <input
                                type="text"
                                className="aw__input"
                                value={formData.client}
                                onChange={(e) => handleInputChange('client', e.target.value)}
                                placeholder="Start typing client name"
                            />
                            <span className="aw__hint">Search existing clients to withdraw funds.</span>
                        </div>

                        <div className="aw__dual">
                            <div className="aw__field">
                                <label className="aw__label">
                                    <Building2 size={16} />
                                    From Bank
                                </label>
                                <input
                                    type="text"
                                    className="aw__input"
                                    value={formData.bank}
                                    onChange={(e) => handleInputChange('bank', e.target.value)}
                                    placeholder="Choose bank"
                                />
                                <span className="aw__hint">Source account for withdrawal.</span>
                            </div>

                            <div className="aw__field">
                                <label className="aw__label">
                                    <CreditCard size={16} />
                                    Card
                                </label>
                                <input
                                    type="text"
                                    className="aw__input"
                                    value={formData.card}
                                    onChange={(e) => handleInputChange('card', e.target.value)}
                                    placeholder="Choose card"
                                />
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
                                    className="aw__input"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    placeholder="₹ 0.00"
                                />
                                <span className="aw__hint">Enter the amount to withdraw.</span>
                            </div>

                            <div className="aw__field">
                                <label className="aw__label">
                                    <Percent size={16} />
                                    Charges (%)
                                </label>
                                <input
                                    type="text"
                                    className="aw__input"
                                    value={formData.chargesPct}
                                    onChange={(e) => handleInputChange('chargesPct', e.target.value)}
                                    placeholder="0"
                                />
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
                                placeholder="Optional notes for this withdrawal..."
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="main__footer-actions">
                        <button className="main__icon-button" onClick={handleBackToTransactions}>
                            <ArrowLeft size={16} />
                            Back to Transactions
                        </button>
                        <button className="main__button" onClick={handleSaveWithdraw}>
                            <CheckCircle2 size={16} />
                            Confirm & Add Withdraw
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddWithdrawScreen;

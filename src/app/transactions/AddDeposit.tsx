'use client';
import React, { useState } from 'react';
import { ArrowDownCircle, X, Save, User, IndianRupee, StickyNote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AddDeposit.scss';

interface AddDepositScreenProps {
    onCancel: () => void;
    onBackToTransactions: () => void;
}

const AddDepositScreen: React.FC<AddDepositScreenProps> = ({ onCancel, onBackToTransactions }) => {
    const [formData, setFormData] = useState({
        client: 'Alice Cooper',
        amount: '24,500',
        notes: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveDeposit = () => {
        console.log('Saving deposit:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled deposit creation');
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
                    <ArrowDownCircle size={16} className="main__header-icon--success" />
                    <h1>New Deposit</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="main__button" onClick={handleSaveDeposit}>
                        <Save size={16} />
                        Save Deposit
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
                            <input
                                type="text"
                                className="ad__input"
                                value={formData.client}
                                onChange={(e) => handleInputChange('client', e.target.value)}
                                placeholder="Choose an existing client"
                            />
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
                        <button className="main__button" onClick={handleSaveDeposit}>
                            <CheckCircle2 size={16} />
                            Confirm & Add Deposit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDepositScreen;

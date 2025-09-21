'use client';
import React, { useState } from 'react';
import { Building2, X, Save, Calendar, LayoutDashboard, IndianRupee, StickyNote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AddBank.scss';

interface AddBankScreenProps {
    onCancel: () => void;
    onBackToBanks: () => void;
}

export interface BankFormData {
    bankName: string;
    createdOn: string;
    initialTransactionsCount: string;
    initialAmount: string;
    notes: string;
}

const AddBankScreen: React.FC<AddBankScreenProps> = ({ onCancel, onBackToBanks }) => {
    const [formData, setFormData] = useState<BankFormData>({
        bankName: '',
        createdOn: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
        initialTransactionsCount: '0',
        initialAmount: '0.00',
        notes: ''
    });

    const handleInputChange = (field: keyof BankFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveBank = () => {
        console.log('Saving bank:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled bank creation');
        onCancel();
    };

    const handleBackToBanks = () => {
        console.log('Back to banks');
        onBackToBanks();
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <Building2 size={16} />
                    <h1>Add New Bank</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleBackToBanks}>
                        <ArrowLeft size={16} />
                        Back to Banks
                    </button>
                    <button className="main__button" onClick={handleSaveBank}>
                        <Save size={16} />
                        Save Bank
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
                                Bank Name
                            </label>
                            <input
                                type="text"
                                className="ab__input"
                                value={formData.bankName}
                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                placeholder="Enter bank name"
                            />
                            <span className="ab__hint">Example: HDFC Bank</span>
                        </div>

                        <div className="ab__field">
                            <label className="ab__label">
                                <Calendar size={16} />
                                Created On
                            </label>
                            <input
                                type="date"
                                className="ab__input"
                                value={formData.createdOn}
                                onChange={(e) => handleInputChange('createdOn', e.target.value)}
                            />
                            <span className="ab__hint">You can adjust later if needed.</span>
                        </div>

                        <div className="ab__dual-grid">
                            <div className="ab__field">
                                <label className="ab__label">
                                    <LayoutDashboard size={16} />
                                    Initial Transactions Count
                                </label>
                                <input
                                    type="number"
                                    className="ab__input"
                                    value={formData.initialTransactionsCount}
                                    onChange={(e) => handleInputChange('initialTransactionsCount', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                                <span className="ab__hint">Starting transaction count.</span>
                            </div>

                            <div className="ab__field">
                                <label className="ab__label">
                                    <IndianRupee size={16} />
                                    Initial Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    className="ab__input"
                                    value={formData.initialAmount}
                                    onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                                <span className="ab__hint">Starting balance amount.</span>
                            </div>
                        </div>

                        <div className="ab__field">
                            <label className="ab__label">
                                <StickyNote size={16} />
                                Notes
                            </label>
                            <textarea
                                className="ab__textarea"
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
                        <button className="main__button" onClick={handleSaveBank}>
                            <CheckCircle2 size={16} />
                            Create Bank
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBankScreen;
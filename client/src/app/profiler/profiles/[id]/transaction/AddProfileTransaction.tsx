'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createDepositTransaction, createWithdrawTransaction } from '@/store/actions/profilerTransactionActions';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { ArrowLeft, Save, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { NumericInput, Button, TextArea } from '@/components/FormInputs';
import './AddProfileTransaction.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface AddProfileTransactionProps {
    profile: ProfilerProfile;
    onBack: () => void;
}

type TransactionType = 'deposit' | 'withdraw';

interface FormData {
    transaction_type: TransactionType;
    amount: number;
    withdraw_charges_percentage: number;
    notes: string;
}

interface FormErrors {
    amount?: string;
    withdraw_charges_percentage?: string;
}

const AddProfileTransaction: React.FC<AddProfileTransactionProps> = ({ profile, onBack }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerTransactions);

    const [formData, setFormData] = useState<FormData>({
        transaction_type: 'deposit',
        amount: 0,
        withdraw_charges_percentage: 0,
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: keyof FormData, value: string | number): string | undefined => {
        switch (name) {
            case 'amount':
                if (typeof value === 'number' && value <= 0) {
                    return 'Amount must be greater than 0';
                }
                break;

            case 'withdraw_charges_percentage':
                if (formData.transaction_type === 'withdraw' && typeof value === 'number') {
                    if (value < 0 || value > 100) {
                        return 'Charges percentage must be between 0 and 100';
                    }
                }
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        const amountError = validateField('amount', formData.amount);
        if (amountError) newErrors.amount = amountError;

        if (formData.transaction_type === 'withdraw') {
            const chargesError = validateField('withdraw_charges_percentage', formData.withdraw_charges_percentage);
            if (chargesError) newErrors.withdraw_charges_percentage = chargesError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        const error = validateField(name as keyof FormData, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleTransactionTypeChange = (type: TransactionType) => {
        setFormData((prev) => ({
            ...prev,
            transaction_type: type,
            withdraw_charges_percentage: type === 'deposit' ? 0 : prev.withdraw_charges_percentage
        }));
    };

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);

        if (!validateForm()) {
            toast.error('Please fix all validation errors');
            return;
        }

        try {
            if (formData.transaction_type === 'deposit') {
                await dispatch(createDepositTransaction({
                    profile_id: profile.id,
                    amount: formData.amount,
                    notes: formData.notes.trim() || null
                })).unwrap();
                toast.success('Deposit transaction created successfully');
            } else {
                await dispatch(createWithdrawTransaction({
                    profile_id: profile.id,
                    amount: formData.amount,
                    withdraw_charges_percentage: formData.withdraw_charges_percentage,
                    notes: formData.notes.trim() || null
                })).unwrap();
                toast.success('Withdraw transaction created successfully');
            }

            logger.log(`${formData.transaction_type} transaction created for profile:`, profile.id);
            onBack();
        } catch (error: any) {
            logger.error('Error creating transaction:', error);
            toast.error(error || 'Failed to create transaction');
        }
    };

    const handleReset = () => {
        setFormData({
            transaction_type: 'deposit',
            amount: 0,
            withdraw_charges_percentage: 0,
            notes: ''
        });
        setErrors({});
        setTouched({});
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    {formData.transaction_type === 'deposit' ? (
                        <TrendingUp size={16} className="main__header-icon--success" />
                    ) : (
                        <TrendingDown size={16} className="main__header-icon--destructive" />
                    )}
                    <h1>New Transaction</h1>
                </div>
                <div className="main__header-right">
                    <Button
                        variant="secondary"
                        icon={<ArrowLeft size={16} />}
                        onClick={onBack}
                        className="main__icon-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        icon={creating ? <Loader2 size={16} /> : <Save size={16} />}
                        onClick={handleSubmit}
                        disabled={creating}
                        className="main__button"
                    >
                        {creating ? 'Saving...' : `Save ${formData.transaction_type === 'deposit' ? 'Deposit' : 'Withdraw'}`}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Transaction Details</h2>
                        </div>
                        <p className="main__subtitle">
                            Create a new deposit or withdraw transaction for {profile.client_name}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="add-profile-transaction__form">
                <div className="add-profile-transaction__card">
                    <div className="add-profile-transaction__section">
                        <h2 className="add-profile-transaction__section-title">Transaction Type</h2>
                        
                        <div className="add-profile-transaction__type-selector">
                            <button
                                type="button"
                                className={`add-profile-transaction__type-button ${formData.transaction_type === 'deposit' ? 'add-profile-transaction__type-button--active add-profile-transaction__type-button--deposit' : ''}`}
                                onClick={() => handleTransactionTypeChange('deposit')}
                                disabled={creating}
                            >
                                <TrendingUp size={20} />
                                <span>Deposit</span>
                            </button>
                            <button
                                type="button"
                                className={`add-profile-transaction__type-button ${formData.transaction_type === 'withdraw' ? 'add-profile-transaction__type-button--active add-profile-transaction__type-button--withdraw' : ''}`}
                                onClick={() => handleTransactionTypeChange('withdraw')}
                                disabled={creating}
                            >
                                <TrendingDown size={20} />
                                <span>Withdraw</span>
                            </button>
                        </div>
                    </div>

                    <div className="add-profile-transaction__section">
                        <h2 className="add-profile-transaction__section-title">Transaction Details</h2>
                        
                        <div className="add-profile-transaction__form-grid">
                            <div className="add-profile-transaction__form-group">
                                <label htmlFor="amount" className="add-profile-transaction__label">
                                    Amount <span className="add-profile-transaction__required">*</span>
                                </label>
                                <NumericInput
                                    value={formData.amount}
                                    onChange={(value) => handleChange('amount', value)}
                                    onBlur={() => handleBlur('amount')}
                                    placeholder="0.00"
                                    error={touched.amount ? errors.amount : undefined}
                                    disabled={creating}
                                />
                            </div>

                            {formData.transaction_type === 'withdraw' && (
                                <div className="add-profile-transaction__form-group">
                                    <label htmlFor="withdraw_charges_percentage" className="add-profile-transaction__label">
                                        Charges Percentage
                                    </label>
                                    <NumericInput
                                        value={formData.withdraw_charges_percentage}
                                        onChange={(value) => handleChange('withdraw_charges_percentage', value)}
                                        onBlur={() => handleBlur('withdraw_charges_percentage')}
                                        placeholder="0.00"
                                        error={touched.withdraw_charges_percentage ? errors.withdraw_charges_percentage : undefined}
                                        disabled={creating}
                                        max={100}
                                    />
                                    {formData.amount > 0 && formData.withdraw_charges_percentage > 0 && (
                                        <p className="add-profile-transaction__helper-text">
                                            Charges: {formatCurrency((formData.amount * formData.withdraw_charges_percentage) / 100)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="add-profile-transaction__form-group add-profile-transaction__form-group--full">
                                <label htmlFor="notes" className="add-profile-transaction__label">
                                    Notes
                                </label>
                                <TextArea
                                    value={formData.notes}
                                    onChange={(value) => handleChange('notes', value)}
                                    placeholder="Additional notes about this transaction..."
                                    rows={4}
                                    disabled={creating}
                                />
                            </div>
                        </div>
                    </div>

                    {formData.amount > 0 && (
                        <div className="add-profile-transaction__summary">
                            <div className="add-profile-transaction__summary-item">
                                <span>Current Balance:</span>
                                <span>{formatCurrency(profile.current_balance)}</span>
                            </div>
                            {formData.transaction_type === 'withdraw' && formData.withdraw_charges_percentage > 0 && (
                                <div className="add-profile-transaction__summary-item">
                                    <span>Charges ({formData.withdraw_charges_percentage}%):</span>
                                    <span className="add-profile-transaction__summary-charges">
                                        {formatCurrency((formData.amount * formData.withdraw_charges_percentage) / 100)}
                                    </span>
                                </div>
                            )}
                            <div className="add-profile-transaction__summary-item add-profile-transaction__summary-item--total">
                                <span>New Balance:</span>
                                <span className={formData.transaction_type === 'deposit' ? 'add-profile-transaction__summary-positive' : 'add-profile-transaction__summary-negative'}>
                                    {formatCurrency(
                                        formData.transaction_type === 'deposit'
                                            ? profile.current_balance + formData.amount
                                            : profile.current_balance - formData.amount - ((formData.amount * formData.withdraw_charges_percentage) / 100)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                    </div>

                    <div className="main__footer-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<ArrowLeft size={16} />}
                            onClick={handleReset}
                            disabled={creating}
                            className="main__icon-button"
                        >
                            Reset Form
                        </Button>
                        
                        <Button
                            type="submit"
                            variant="primary"
                            icon={creating ? <Loader2 size={16} /> : <Save size={16} />}
                            disabled={creating}
                            className="main__button"
                        >
                            {creating ? 'Creating...' : `Confirm & Add ${formData.transaction_type === 'deposit' ? 'Deposit' : 'Withdraw'}`}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
};

export default AddProfileTransaction;

'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createWithdrawTransaction } from '@/store/actions/profilerTransactionActions';
import { fetchProfilerProfileAutocomplete } from '@/store/slices/profilerProfileAutocompleteSlice';
import { ArrowLeft, Save, Loader2, ArrowUpCircle, UserCircle } from 'lucide-react';
import { NumericInput, Button, TextArea, AutocompleteInput } from '@/components/FormInputs';
import type { AutocompleteOption } from '@/components/FormInputs/AutocompleteInput';
import './AddProfilerTransaction.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import { formatAmountAsCurrency } from '@/utils/helperFunctions';

interface AddProfilerWithdrawProps {
    onBack: () => void;
}

interface FormData {
    profiler_profile_id: AutocompleteOption | null;
    amount: number;
    withdraw_charges_percentage: number;
    notes: string;
}

interface FormErrors {
    profiler_profile_id?: string;
    amount?: string;
    withdraw_charges_percentage?: string;
}

const AddProfilerWithdraw: React.FC<AddProfilerWithdrawProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerTransactions);
    const { items: profiles, loading: profilesLoading } = useAppSelector((state) => state.profilerProfileAutocomplete);

    const [formData, setFormData] = useState<FormData>({
        profiler_profile_id: null,
        amount: 0,
        withdraw_charges_percentage: 0,
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [adjustedAmount, setAdjustedAmount] = useState<number>(0);

    useEffect(() => {
        dispatch(fetchProfilerProfileAutocomplete({}));
    }, [dispatch]);

    useEffect(() => {
        const original = formData.amount || 0;
        const charges = formData.withdraw_charges_percentage || 0;
        const calculated = original + (original * charges / 100);
        setAdjustedAmount(calculated);
    }, [formData.amount, formData.withdraw_charges_percentage]);

    const validateField = (name: keyof FormData, value: string | number | AutocompleteOption | null): string | undefined => {
        switch (name) {
            case 'profiler_profile_id':
                if (!value || value === null) return 'Profile is required';
                break;
            case 'amount':
                if (typeof value === 'number' && value <= 0) {
                    return 'Amount must be greater than 0';
                }
                break;
            case 'withdraw_charges_percentage':
                if (typeof value === 'number' && (value < 0 || value > 100)) {
                    return 'Charges must be between 0 and 100';
                }
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        (['profiler_profile_id', 'amount', 'withdraw_charges_percentage'] as (keyof FormData)[]).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key as keyof FormErrors] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: string, value: string | number | AutocompleteOption | null) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        const error = validateField(name as keyof FormData, formData[name as keyof FormData]);
        if (error) setErrors((prev) => ({ ...prev, [name]: error }));
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
            await dispatch(createWithdrawTransaction({
                profile_id: formData.profiler_profile_id!.id,
                amount: formData.amount,
                withdraw_charges_percentage: formData.withdraw_charges_percentage,
                notes: formData.notes.trim() || null
            })).unwrap();

            toast.success('Withdraw transaction created successfully');
            logger.log('Withdraw transaction created');
            onBack();
        } catch (error: any) {
            logger.error('Error creating withdraw transaction:', error);
            toast.error(error || 'Failed to create withdraw');
        }
    };

    const profileOptions: AutocompleteOption[] = useMemo(() => {
        return profiles.map((profile: any) => {
            const last4Digits = profile.credit_card_number?.slice(-4) || 'N/A';
            return {
                id: profile.id,
                name: `${profile.client_name} - ${profile.bank_name} (*${last4Digits})`
            };
        });
    }, [profiles]);

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <ArrowUpCircle className="add-profiler-transaction__title-icon add-profiler-transaction__title-icon--destructive" size={20} />
                    <div>
                        <h1>Add New Withdraw</h1>
                        <p className="main__subtitle">Record a withdraw transaction for a profile</p>
                    </div>
                </div>
                <div className="main__header-right">
                    <Button
                        variant="secondary"
                        icon={<ArrowLeft size={16} />}
                        onClick={onBack}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="destructive"
                        icon={creating ? <Loader2 size={16} /> : <Save size={16} />}
                        onClick={handleSubmit}
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : 'Create Withdraw'}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <form onSubmit={handleSubmit} className="add-profiler-transaction__form">
                <div className="add-profiler-transaction__card">
                    <div className="add-profiler-transaction__section">
                        <h2 className="add-profiler-transaction__section-title">Withdraw Information</h2>
                        
                        <div className="add-profiler-transaction__form-grid">
                            <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                <AutocompleteInput
                                    label="Profile"
                                    value={formData.profiler_profile_id}
                                    onChange={(value) => handleChange('profiler_profile_id', value)}
                                    options={profileOptions}
                                    loading={profilesLoading}
                                    placeholder="Search for a profile..."
                                    icon={<UserCircle size={16} />}
                                    error={touched.profiler_profile_id ? errors.profiler_profile_id : undefined}
                                    disabled={creating}
                                />
                            </div>

                            <div className="add-profiler-transaction__form-group">
                                <label htmlFor="amount" className="add-profiler-transaction__label">
                                    Amount <span className="add-profiler-transaction__required">*</span>
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

                            <div className="add-profiler-transaction__form-group">
                                <label htmlFor="withdraw_charges_percentage" className="add-profiler-transaction__label">
                                    Charges (%)
                                </label>
                                <NumericInput
                                    value={formData.withdraw_charges_percentage}
                                    onChange={(value) => handleChange('withdraw_charges_percentage', value)}
                                    onBlur={() => handleBlur('withdraw_charges_percentage')}
                                    placeholder="0.00"
                                    max={100}
                                    error={touched.withdraw_charges_percentage ? errors.withdraw_charges_percentage : undefined}
                                    disabled={creating}
                                />
                            </div>

                            {formData.amount > 0 && (
                                <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                    <div className="add-profiler-transaction__summary">
                                        <div className="add-profiler-transaction__summary-row">
                                            <span className="add-profiler-transaction__summary-label">Original Amount:</span>
                                            <span className="add-profiler-transaction__summary-value">{formatAmountAsCurrency(formData.amount)}</span>
                                        </div>
                                        <div className="add-profiler-transaction__summary-row">
                                            <span className="add-profiler-transaction__summary-label">Charges ({formData.withdraw_charges_percentage}%):</span>
                                            <span className="add-profiler-transaction__summary-value add-profiler-transaction__summary-value--negative">
                                                + {formatAmountAsCurrency(formData.amount * formData.withdraw_charges_percentage / 100)}
                                            </span>
                                        </div>
                                        <div className="add-profiler-transaction__summary-row add-profiler-transaction__summary-row--total">
                                            <span className="add-profiler-transaction__summary-label">Net Withdraw:</span>
                                            <span className="add-profiler-transaction__summary-value add-profiler-transaction__summary-value--destructive">{formatAmountAsCurrency(adjustedAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                <label htmlFor="notes" className="add-profiler-transaction__label">
                                    Remarks
                                </label>
                                <TextArea
                                    value={formData.notes}
                                    onChange={(value) => handleChange('notes', value)}
                                    placeholder="Additional notes..."
                                    rows={4}
                                    disabled={creating}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProfilerWithdraw;

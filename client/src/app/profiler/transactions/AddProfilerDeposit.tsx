'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createDepositTransaction } from '@/store/actions/profilerTransactionActions';
import { fetchProfilerProfileAutocomplete } from '@/store/slices/profilerProfileAutocompleteSlice';
import { ArrowLeft, Save, Loader2, ArrowDownCircle, UserCircle } from 'lucide-react';
import { NumericInput, Button, TextArea, AutocompleteInput } from '@/components/FormInputs';
import type { AutocompleteOption } from '@/components/FormInputs/AutocompleteInput';
import './AddProfilerTransaction.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import { formatAmountAsCurrency } from '@/utils/helperFunctions';

interface AddProfilerDepositProps {
    onBack: () => void;
    onTransactionSubmit: () => void;
}

interface FormData {
    profiler_profile_id: AutocompleteOption | null;
    original_amount: number;
    remarks: string;
}

interface FormErrors {
    profiler_profile_id?: string;
    original_amount?: string;
}

const AddProfilerDeposit: React.FC<AddProfilerDepositProps> = ({ onBack, onTransactionSubmit }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerTransactions);
    const { items: profiles, loading: profilesLoading } = useAppSelector((state) => state.profilerProfileAutocomplete);

    const [formData, setFormData] = useState<FormData>({
        profiler_profile_id: null,
        original_amount: 0,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchProfilerProfileAutocomplete({}));
    }, [dispatch]);

    const validateField = (name: keyof FormData, value: string | number | AutocompleteOption | null): string | undefined => {
        switch (name) {
            case 'profiler_profile_id':
                if (!value || value === null) return 'Profile is required';
                break;
            case 'original_amount':
                if (typeof value === 'number' && value <= 0) {
                    return 'Amount must be a positive number';
                }
                if (value === 0 || !value) return 'Amount is required';
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        (['profiler_profile_id', 'original_amount'] as (keyof FormData)[]).forEach((key) => {
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

    const handleTextAreaChange = (value: string) => {
        handleChange('remarks', value);
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
            await dispatch(createDepositTransaction({
                profile_id: formData.profiler_profile_id!.id,
                amount: formData.original_amount,
                notes: formData.remarks.trim() || null
            })).unwrap();

            toast.success('Deposit transaction created successfully');
            logger.log('Deposit transaction created');
            onBack();
        } catch (error: any) {
            logger.error('Error creating deposit transaction:', error);
            toast.error(error || 'Failed to create deposit');
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
                    <ArrowDownCircle className="add-profiler-transaction__title-icon add-profiler-transaction__title-icon--success" size={20} />
                    <div>
                        <h1>Add New Deposit</h1>
                        <p className="main__subtitle">Record a deposit transaction for a profile</p>
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
                        variant="primary"
                        icon={creating ? <Loader2 size={16} /> : <Save size={16} />}
                        onClick={handleSubmit}
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : 'Create Deposit'}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <form onSubmit={handleSubmit} className="add-profiler-transaction__form">
                <div className="add-profiler-transaction__card">
                    <div className="add-profiler-transaction__section">
                        <h2 className="add-profiler-transaction__section-title">Deposit Information</h2>
                        
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
                                <NumericInput
                                    label="Amount"
                                    value={formData.original_amount}
                                    onChange={(value) => handleChange('original_amount', value)}
                                    placeholder="0.00"
                                    error={touched.original_amount ? errors.original_amount : undefined}
                                    disabled={creating}
                                />
                            </div>

                            {formData.original_amount > 0 && (
                                <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                    <div className="add-profiler-transaction__summary">
                                        <div className="add-profiler-transaction__summary-row add-profiler-transaction__summary-row--total">
                                            <span className="add-profiler-transaction__summary-label">Deposit Amount:</span>
                                            <span className="add-profiler-transaction__summary-value add-profiler-transaction__summary-value--success">{formatAmountAsCurrency(formData.original_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                <TextArea
                                    label="Remarks"
                                    value={formData.remarks}
                                    onChange={handleTextAreaChange}
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

export default AddProfilerDeposit;

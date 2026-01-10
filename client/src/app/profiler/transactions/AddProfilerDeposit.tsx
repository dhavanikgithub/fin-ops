'use client'
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createDepositTransaction } from '@/store/actions/profilerTransactionActions';
import { fetchProfilerProfileAutocomplete } from '@/store/slices/profilerProfileAutocompleteSlice';
import { ArrowLeft, Save, Loader2, ArrowDownCircle } from 'lucide-react';
import { NumericInput, Button, TextArea, SelectInput } from '@/components/FormInputs';
import './AddProfilerTransaction.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface AddProfilerDepositProps {
    onBack: () => void;
}

interface FormData {
    profiler_profile_id: string;
    original_amount: number;
    remarks: string;
}

interface FormErrors {
    profiler_profile_id?: string;
    original_amount?: string;
}

const AddProfilerDeposit: React.FC<AddProfilerDepositProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerTransactions);
    const { items: profiles, loading: profilesLoading } = useAppSelector((state) => state.profilerProfileAutocomplete);

    const [formData, setFormData] = useState<FormData>({
        profiler_profile_id: '',
        original_amount: 0,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchProfilerProfileAutocomplete({}));
    }, [dispatch]);

    const validateField = (name: keyof FormData, value: string | number): string | undefined => {
        switch (name) {
            case 'profiler_profile_id':
                if (!value) return 'Profile is required';
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

    const handleChange = (name: string, value: string | number) => {
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
                profile_id: parseInt(formData.profiler_profile_id),
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

    const profileOptions = profiles.map((profile: any) => ({
        value: profile.id.toString(),
        label: `${profile.client_name} - ${profile.bank_name}`
    }));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="add-profiler-transaction">
            <div className="add-profiler-transaction__header">
                <Button
                    variant="ghost"
                    icon={<ArrowLeft size={18} />}
                    onClick={onBack}
                    className="add-profiler-transaction__back-button"
                >
                    Back to Transactions
                </Button>
                
                <div className="add-profiler-transaction__title-section">
                    <h1 className="add-profiler-transaction__title">
                        <ArrowDownCircle className="add-profiler-transaction__title-icon add-profiler-transaction__title-icon--success" size={32} />
                        Add New Deposit
                    </h1>
                    <p className="add-profiler-transaction__subtitle">
                        Record a deposit transaction for a profile
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="add-profiler-transaction__form">
                <div className="add-profiler-transaction__card">
                    <div className="add-profiler-transaction__section">
                        <h2 className="add-profiler-transaction__section-title">Deposit Information</h2>
                        
                        <div className="add-profiler-transaction__form-grid">
                            <div className="add-profiler-transaction__form-group add-profiler-transaction__form-group--full">
                                <SelectInput
                                    label="Profile"
                                    value={formData.profiler_profile_id}
                                    onChange={(value) => handleChange('profiler_profile_id', value)}
                                    options={profileOptions}
                                    placeholder="Select profile"
                                    error={touched.profiler_profile_id ? errors.profiler_profile_id : undefined}
                                    disabled={creating || profilesLoading}
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
                                            <span className="add-profiler-transaction__summary-value add-profiler-transaction__summary-value--success">{formatCurrency(formData.original_amount)}</span>
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

                <div className="add-profiler-transaction__actions">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={creating}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        icon={creating ? <Loader2 size={18} className="add-profiler-transaction__spinner" /> : <Save size={18} />}
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : 'Create Deposit'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddProfilerDeposit;

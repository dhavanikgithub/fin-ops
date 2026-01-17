'use client'
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProfilerProfile } from '@/store/actions/profilerProfileActions';
import { fetchProfilerClientAutocomplete } from '@/store/slices/profilerClientAutocompleteSlice';
import { fetchProfilerBankAutocomplete } from '@/store/slices/profilerBankAutocompleteSlice';
import { ArrowLeft, Save, Loader2, Users, Building2 } from 'lucide-react';
import { TextInput, NumericInput, Button, TextArea, AutocompleteInput } from '@/components/FormInputs';
import type { AutocompleteOption } from '@/components/FormInputs/AutocompleteInput';
import './AddProfilerProfile.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import { formatCreditCard, unformatCreditCard } from '@/utils/helperFunctions';

interface AddProfilerProfileProps {
    onBack: () => void;
    onProfileSubmit: () => void;
}

interface FormData {
    profiler_client_id: AutocompleteOption | null;
    profiler_bank_id: AutocompleteOption | null;
    credit_card_number: string;
    opening_balance: number;
    carry_forward_balance: number;
    carry_forward: boolean;
    remarks: string;
}

interface FormErrors {
    profiler_client_id?: string;
    profiler_bank_id?: string;
    credit_card_number?: string;
    opening_balance?: string;
    carry_forward_balance?: string;
}

const AddProfilerProfile: React.FC<AddProfilerProfileProps> = ({ onBack, onProfileSubmit }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerProfiles);
    const { items: clients, loading: clientsLoading } = useAppSelector((state) => state.profilerClientAutocomplete);
    const { items: banks, loading: banksLoading } = useAppSelector((state) => state.profilerBankAutocomplete);

    const [formData, setFormData] = useState<FormData>({
        profiler_client_id: null,
        profiler_bank_id: null,
        credit_card_number: '',
        opening_balance: 0,
        carry_forward_balance: 0,
        carry_forward: false,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchProfilerClientAutocomplete({}));
        dispatch(fetchProfilerBankAutocomplete({}));
    }, [dispatch]);

    const validateField = (name: keyof FormData, value: string | boolean | number | AutocompleteOption | null): string | undefined => {
        switch (name) {
            case 'profiler_client_id':
                if (!value || value === null || typeof value !== 'object' || !('id' in value) || !value.id) {
                    return 'Client is required';
                }
                break;

            case 'profiler_bank_id':
                if (!value || value === null || typeof value !== 'object' || !('id' in value) || !value.id) {
                    return 'Bank is required';
                }
                break;

            case 'credit_card_number':
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return 'Credit card number is required';
                }
                if (typeof value === 'string') {
                    const digits = value.replace(/[•–\-\s]/g, '');
                    if (!/^\d+$/.test(digits)) {
                        return 'Credit card number must contain only digits';
                    }
                    if (digits.length < 15 || digits.length > 16) {
                        return 'Credit card number must be 15-16 digits';
                    }
                }
                break;

            case 'opening_balance':
                if (typeof value === 'number' && value <= 0) {
                    return 'Opening balance is required';
                }
                break;

            case 'carry_forward_balance':
                if (formData.carry_forward && typeof value === 'number' && value <= 0) {
                    return 'Carry forward balance is required when carry forward is enabled';
                }
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        (['profiler_client_id', 'profiler_bank_id', 'credit_card_number', 'opening_balance', 'carry_forward_balance'] as (keyof FormData)[]).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key as keyof FormErrors] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: string, value: string | number | boolean | AutocompleteOption | null) => {
        // Special handling for credit card number
        if (name === 'credit_card_number' && typeof value === 'string') {
            const unformatted = unformatCreditCard(value);
            // Only allow digits and limit to 16 digits
            if (unformatted === '' || /^\d{0,16}$/.test(unformatted)) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: unformatted
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        handleChange(name, checked);
    };

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateField(name as keyof FormData, formData[name as keyof FormData]);
        setErrors((prev) => ({ ...prev, [name]: error }));
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
            await dispatch(createProfilerProfile({
                client_id: formData.profiler_client_id!.id,
                bank_id: formData.profiler_bank_id!.id,
                credit_card_number: formData.credit_card_number.trim(),
                pre_planned_deposit_amount: formData.opening_balance,
                carry_forward_enabled: formData.carry_forward,
                notes: formData.remarks.trim() || null
            })).unwrap();

            toast.success('Profiler profile created successfully');
            logger.log('Profiler profile created');
            onProfileSubmit();
        } catch (error: any) {
            logger.error('Error creating profiler profile:', error);
            toast.error(error || 'Failed to create profile');
        }
    };

    const handleReset = () => {
        setFormData({
            profiler_client_id: null,
            profiler_bank_id: null,
            credit_card_number: '',
            opening_balance: 0,
            carry_forward_balance: 0,
            carry_forward: false,
            remarks: ''
        });
        setErrors({});
        setTouched({});
    };

    const clientOptions: AutocompleteOption[] = clients.map((client: any) => ({
        id: client.id,
        name: client.name
    }));

    const bankOptions: AutocompleteOption[] = banks.map((bank: any) => ({
        id: bank.id,
        name: bank.bank_name
    }));

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>New Profile</h1>
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
                        {creating ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Profile Details</h2>
                        </div>
                        <p className="main__subtitle">
                            Create a new financial profile
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="add-profiler-profile__form">
                        <div className="add-profiler-profile__card">
                            <div className="add-profiler-profile__section">
                                <h2 className="add-profiler-profile__section-title">Profile Information</h2>

                                <div className="add-profiler-profile__form-grid">
                                    <div className="add-profiler-profile__form-group">
                                        <AutocompleteInput
                                            label="Client"
                                            value={formData.profiler_client_id}
                                            onChange={(value) => handleChange('profiler_client_id', value)}
                                            options={clientOptions}
                                            loading={clientsLoading}
                                            placeholder="Search for a client..."
                                            icon={<Users size={16} />}
                                            error={touched.profiler_client_id ? errors.profiler_client_id : undefined}
                                            disabled={creating}
                                            onBlur={() => handleBlur('profiler_client_id')}
                                        />
                                    </div>

                                    <div className="add-profiler-profile__form-group">
                                        <AutocompleteInput
                                            label="Bank"
                                            value={formData.profiler_bank_id}
                                            onChange={(value) => handleChange('profiler_bank_id', value)}
                                            options={bankOptions}
                                            loading={banksLoading}
                                            placeholder="Search for a bank..."
                                            icon={<Building2 size={16} />}
                                            error={touched.profiler_bank_id ? errors.profiler_bank_id : undefined}
                                            disabled={creating}
                                            onBlur={() => handleBlur('profiler_bank_id')}
                                        />
                                    </div>

                                    <div className="add-profiler-profile__form-group">
                                        <label htmlFor="credit_card_number" className="add-profiler-profile__label">
                                            Credit Card Number <span className="add-profiler-profile__required">*</span>
                                        </label>
                                        <TextInput
                                            value={formatCreditCard(formData.credit_card_number)}
                                            onChange={(value) => handleChange('credit_card_number', value)}
                                            onBlur={() => handleBlur('credit_card_number')}
                                            placeholder="1234 • 5678 • 9012 • 3456"
                                            error={touched.credit_card_number ? errors.credit_card_number : undefined}
                                            disabled={creating}
                                            maxLength={25}
                                        />
                                    </div>

                                    <div className="add-profiler-profile__form-group">
                                        <label htmlFor="opening_balance" className="add-profiler-profile__label">
                                            Opening Balance <span className="add-profiler-profile__required">*</span>
                                        </label>
                                        <NumericInput
                                            value={formData.opening_balance}
                                            onChange={(value) => handleChange('opening_balance', value)}
                                            onBlur={() => handleBlur('opening_balance')}
                                            placeholder="0.00"
                                            error={touched.opening_balance ? errors.opening_balance : undefined}
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="add-profiler-profile__form-group">
                                        <label className="add-profiler-profile__checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="carry_forward"
                                                checked={formData.carry_forward}
                                                onChange={handleCheckboxChange}
                                                disabled={creating}
                                                className="add-profiler-profile__checkbox"
                                            />
                                            <span>Enable Carry Forward</span>
                                        </label>
                                    </div>

                                    {formData.carry_forward && (
                                        <div className="add-profiler-profile__form-group add-profiler-profile__form-group--full">
                                            <label htmlFor="carry_forward_balance" className="add-profiler-profile__label">
                                                Carry Forward Balance <span className="add-profiler-profile__required">*</span>
                                            </label>
                                            <NumericInput
                                                value={formData.carry_forward_balance}
                                                onChange={(value) => handleChange('carry_forward_balance', value)}
                                                onBlur={() => handleBlur('carry_forward_balance')}
                                                placeholder="0.00"
                                                error={touched.carry_forward_balance ? errors.carry_forward_balance : undefined}
                                                disabled={creating}
                                            />
                                        </div>
                                    )}

                                    <div className="add-profiler-profile__form-group add-profiler-profile__form-group--full">
                                        <label htmlFor="remarks" className="add-profiler-profile__label">
                                            Remarks
                                        </label>
                                        <TextArea
                                            value={formData.remarks}
                                            onChange={(value) => handleChange('remarks', value)}
                                            placeholder="Additional remarks or notes..."
                                            rows={4}
                                            disabled={creating}
                                        />
                                    </div>
                                </div>
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
                                    {creating ? 'Creating...' : 'Confirm & Add Profile'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProfilerProfile;

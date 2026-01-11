'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProfilerBank } from '@/store/actions/profilerBankActions';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { TextInput, Button } from '@/components/FormInputs';
import './AddProfilerBank.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface AddProfilerBankProps {
    onBack: () => void;
}

interface FormData {
    bank_name: string;
}

interface FormErrors {
    bank_name?: string;
}

const AddProfilerBank: React.FC<AddProfilerBankProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerBanks);

    const [formData, setFormData] = useState<FormData>({
        bank_name: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: keyof FormData, value: string): string | undefined => {
        if (name === 'bank_name') {
            if (!value.trim()) {
                return 'Bank name is required';
            }
            if (value.trim().length < 2) {
                return 'Bank name must be at least 2 characters';
            }
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        Object.keys(formData).forEach((key) => {
            const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
            if (error) {
                newErrors[key as keyof FormErrors] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateField(name as keyof FormData, value);
        if (error) {
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
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
            await dispatch(createProfilerBank({
                bank_name: formData.bank_name.trim()
            })).unwrap();

            toast.success('Profiler bank created successfully');
            logger.log('Profiler bank created:', formData.bank_name);
            onBack();
        } catch (error: any) {
            logger.error('Error creating profiler bank:', error);
            toast.error(error || 'Failed to create bank');
        }
    };

    const handleReset = () => {
        setFormData({
            bank_name: ''
        });
        setErrors({});
        setTouched({});
    };

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>New Bank</h1>
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
                        {creating ? 'Saving...' : 'Save Bank'}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Bank Details</h2>
                        </div>
                        <p className="main__subtitle">
                            Create a new bank for financial profiling
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="add-profiler-bank__form">
                        <div className="add-profiler-bank__card">
                            <div className="add-profiler-bank__section">
                                <h2 className="add-profiler-bank__section-title">Bank Information</h2>

                                <div className="add-profiler-bank__form-grid">
                                    <div className="add-profiler-bank__form-group add-profiler-bank__form-group--full">
                                        <label htmlFor="bank_name" className="add-profiler-bank__label">
                                            Bank Name <span className="add-profiler-bank__required">*</span>
                                        </label>
                                        <TextInput
                                            type="text"
                                            value={formData.bank_name}
                                            onChange={(value) => handleChange({ target: { name: 'bank_name', value } } as React.ChangeEvent<HTMLInputElement>)}
                                            onBlur={handleBlur}
                                            placeholder="Enter bank name (e.g., HDFC Bank, ICICI Bank)"
                                            error={touched.bank_name ? errors.bank_name : undefined}
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
                                    {creating ? 'Creating...' : 'Confirm & Add Bank'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProfilerBank;

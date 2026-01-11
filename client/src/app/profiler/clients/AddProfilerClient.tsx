'use client'
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProfilerClient } from '@/store/actions/profilerClientActions';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { TextInput, Button, TextArea } from '@/components/FormInputs';
import './AddProfilerClient.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface AddProfilerClientProps {
    onBack: () => void;
}

interface FormData {
    name: string;
    email: string;
    mobile_number: string;
    aadhaar_card_number: string;
    notes: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    mobile_number?: string;
    aadhaar_card_number?: string;
}

const AddProfilerClient: React.FC<AddProfilerClientProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.profilerClients);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile_number: '',
        aadhaar_card_number: '',
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Format Aadhaar number with bullet every 4 digits
    const formatAadhaar = (value: string): string => {
        const digits = value.replace(/[•\-\s]/g, '');
        const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
        return formatted;
    };

    // Remove bullets, hyphens and spaces from Aadhaar number
    const unformatAadhaar = (value: string): string => {
        return value.replace(/[•\-\s]/g, '');
    };

    const validateField = (name: keyof FormData, value: string): string | undefined => {
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    return 'Client name is required';
                }
                if (value.trim().length < 2) {
                    return 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Invalid email format';
                }
                break;

            case 'mobile_number':
                if (value && !/^\d{10}$/.test(value)) {
                    return 'Mobile number must be 10 digits';
                }
                break;

            case 'aadhaar_card_number':
                if (value) {
                    const digits = value.replace(/[•\-\s]/g, '');
                    if (!/^\d*$/.test(digits)) {
                        return 'Aadhaar number must contain only digits';
                    }
                    if (digits.length > 0 && digits.length !== 12) {
                        return 'Aadhaar number must be 12 digits';
                    }
                }
                break;
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Special handling for Aadhaar card number
        if (name === 'aadhaar_card_number') {
            const unformatted = unformatAadhaar(value);
            // Only allow digits and limit to 12 digits
            if (unformatted === '' || /^\d{0,12}$/.test(unformatted)) {
                setFormData((prev) => ({ ...prev, [name]: unformatted }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            await dispatch(createProfilerClient({
                name: formData.name.trim(),
                email: formData.email.trim() || null,
                mobile_number: formData.mobile_number.trim() || null,
                aadhaar_card_number: formData.aadhaar_card_number.trim() || null,
                notes: formData.notes.trim() || null
            })).unwrap();

            toast.success('Profiler client created successfully');
            logger.log('Profiler client created:', formData.name);
            onBack();
        } catch (error: any) {
            logger.error('Error creating profiler client:', error);
            toast.error(error || 'Failed to create client');
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            email: '',
            mobile_number: '',
            aadhaar_card_number: '',
            notes: ''
        });
        setErrors({});
        setTouched({});
    };

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>New Client</h1>
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
                        {creating ? 'Saving...' : 'Save Client'}
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title-row">
                            <h2 className="main__title">Client Details</h2>
                        </div>
                        <p className="main__subtitle">
                            Create a new client for financial profiling
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="add-profiler-client__form">
                        <div className="add-profiler-client__card">
                            <div className="add-profiler-client__section">
                                <h2 className="add-profiler-client__section-title">Basic Information</h2>

                                <div className="add-profiler-client__form-grid">
                                    <div className="add-profiler-client__form-group add-profiler-client__form-group--full">
                                        <label htmlFor="name" className="add-profiler-client__label">
                                            Client Name <span className="add-profiler-client__required">*</span>
                                        </label>
                                        <TextInput
                                            type="text"
                                            value={formData.name}
                                            onChange={(value) => handleChange({ target: { name: 'name', value } } as React.ChangeEvent<HTMLInputElement>)}
                                            onBlur={handleBlur}
                                            placeholder="Enter client full name"
                                            error={touched.name ? errors.name : undefined}
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="add-profiler-client__form-group">
                                        <label htmlFor="email" className="add-profiler-client__label">
                                            Email Address
                                        </label>
                                        <TextInput
                                            type="email"
                                            value={formData.email}
                                            onChange={(value) => handleChange({ target: { name: 'email', value } } as React.ChangeEvent<HTMLInputElement>)}
                                            onBlur={handleBlur}
                                            placeholder="client@example.com"
                                            error={touched.email ? errors.email : undefined}
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="add-profiler-client__form-group">
                                        <label htmlFor="mobile_number" className="add-profiler-client__label">
                                            Mobile Number
                                        </label>
                                        <TextInput
                                            type="text"
                                            value={formData.mobile_number}
                                            onChange={(value) => handleChange({ target: { name: 'mobile_number', value } } as React.ChangeEvent<HTMLInputElement>)}
                                            onBlur={handleBlur}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            error={touched.mobile_number ? errors.mobile_number : undefined}
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="add-profiler-client__form-group add-profiler-client__form-group--full">
                                        <label htmlFor="aadhaar_card_number" className="add-profiler-client__label">
                                            Aadhaar Card Number
                                        </label>
                                        <TextInput
                                            type="text"
                                            value={formatAadhaar(formData.aadhaar_card_number)}
                                            onChange={(value) => handleChange({ target: { name: 'aadhaar_card_number', value } } as React.ChangeEvent<HTMLInputElement>)}
                                            onBlur={handleBlur}
                                            placeholder="1234 • 5678 • 9012"
                                            maxLength={18}
                                            error={touched.aadhaar_card_number ? errors.aadhaar_card_number : undefined}
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="add-profiler-client__form-group add-profiler-client__form-group--full">
                                        <label htmlFor="notes" className="add-profiler-client__label">
                                            Notes
                                        </label>
                                        <TextArea
                                            value={formData.notes}
                                            onChange={(value) => handleChange({ target: { name: 'notes', value } } as React.ChangeEvent<HTMLTextAreaElement>)}
                                            placeholder="Additional notes about the client..."
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
                                    {creating ? 'Creating...' : 'Confirm & Add Client'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
};

export default AddProfilerClient;

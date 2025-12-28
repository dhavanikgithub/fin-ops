'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import './SelectInput.scss';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectInputProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    error?: string;
    hint?: string;
    className?: string;
}

/**
 * SelectInput Component
 * 
 * A reusable select dropdown component with:
 * - Custom styling consistent with other inputs
 * - Icon support
 * - Error and hint messages
 * - Disabled state
 */
export const SelectInput: React.FC<SelectInputProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder = 'Select an option...',
    icon,
    disabled = false,
    error,
    hint,
    className = '',
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={`select-input ${className}`}>
            {label && (
                <label className="select-input__label">
                    {icon && <span className="select-input__icon">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="select-input__wrapper">
                <select
                    className={`select-input__field ${error ? 'select-input__field--error' : ''}`}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown size={16} className="select-input__chevron" />
            </div>
            {error && <span className="select-input__error">{error}</span>}
            {hint && !error && <span className="select-input__hint">{hint}</span>}
        </div>
    );
};

export default SelectInput;

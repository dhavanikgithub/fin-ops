'use client';

import React from 'react';
import './CheckboxInput.scss';

export interface CheckboxInputProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    id?: string;
    disabled?: boolean;
    hint?: string;
    className?: string;
}

/**
 * CheckboxInput Component
 * 
 * A reusable checkbox input component with:
 * - Custom checkbox styling
 * - Label support
 * - Disabled state
 * - Hint/helper text
 * - Consistent styling across the app
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
    checked,
    onChange,
    label,
    id,
    disabled = false,
    hint,
    className = '',
}) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <div className={`checkbox-input ${disabled ? 'checkbox-input--disabled' : ''} ${className}`}>
            <div className="checkbox-input__wrapper">
                <input
                    type="checkbox"
                    id={checkboxId}
                    className="checkbox-input__field"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                />
                <label htmlFor={checkboxId} className="checkbox-input__label">
                    {label}
                </label>
            </div>
            {hint && <div className="checkbox-input__hint">{hint}</div>}
        </div>
    );
};

export default CheckboxInput;

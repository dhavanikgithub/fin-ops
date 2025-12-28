'use client';

import React from 'react';
import { X } from 'lucide-react';
import './TextInput.scss';

export interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'tel' | 'url' | 'password';
    icon?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    error?: string;
    hint?: string;
    showClearButton?: boolean;
    className?: string;
    autoFocus?: boolean;
    autoComplete?: string;
    maxLength?: number;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * TextInput Component
 * 
 * A reusable text input component with:
 * - Support for various input types (text, email, tel, etc.)
 * - Icon support
 * - Error and hint messages
 * - Auto-select on focus
 * - Disabled state
 * - Consistent styling across the app
 */
export const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    label,
    placeholder,
    type = 'text',
    icon,
    disabled = false,
    readOnly = false,
    error,
    hint,
    showClearButton = true,
    className = '',
    autoFocus = false,
    autoComplete,
    maxLength,
    onFocus,
    onBlur,
    onKeyDown,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
        onFocus?.(e);
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className={`text-input ${className}`}>
            {label && (
                <label className="text-input__label">
                    {icon && <span className="text-input__icon">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="text-input__wrapper">
                <input
                    type={type}
                    className={`text-input__field ${error ? 'text-input__field--error' : ''}`}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    style={{ paddingRight: showClearButton && value ? '36px' : '12px' }}
                />
                {showClearButton && value && !disabled && !readOnly && (
                    <button
                        type="button"
                        className="text-input__clear"
                        onClick={handleClear}
                        tabIndex={-1}
                        title="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {error && <span className="text-input__error">{error}</span>}
            {hint && !error && <span className="text-input__hint">{hint}</span>}
        </div>
    );
};

export default TextInput;

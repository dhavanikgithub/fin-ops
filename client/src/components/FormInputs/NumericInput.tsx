'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './NumericInput.scss';

export interface NumericInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    icon?: React.ReactNode;
    disabled?: boolean;
    error?: string;
    hint?: string;
    showClearButton?: boolean;
    className?: string;
    allowDecimals?: boolean;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * NumericInput Component
 * 
 * A reusable numeric input component with:
 * - Decimal support with smooth typing (handles "0.", ".5", etc.)
 * - Display state for UX + numeric state for calculations
 * - Optional clear button
 * - Min/Max clamping
 * - Auto-select on focus
 * - Format on blur
 * - Validation and error display
 */
export const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    label,
    placeholder = '0',
    min = 0,
    max,
    icon,
    disabled = false,
    error,
    hint,
    showClearButton = true,
    className = '',
    allowDecimals = true,
    onFocus,
    onBlur,
}) => {
    // Display state for smooth typing (allows "0.", ".5", etc.)
    const [displayValue, setDisplayValue] = useState<string>('');

    // Sync display value with prop value
    useEffect(() => {
        if (value === 0 && displayValue === '') {
            // Keep display empty when value is 0 and display is empty
            return;
        }
        setDisplayValue(value.toString());
    }, [value]);

    const clampValue = (val: number): number => {
        let clamped = Math.max(min, val);
        if (max !== undefined) {
            clamped = Math.min(max, clamped);
        }
        return clamped;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        
        // Validation regex: positive numbers with optional decimals
        const regex = allowDecimals ? /^\d*\.?\d*$/ : /^\d*$/;
        
        if (val === '' || regex.test(val)) {
            setDisplayValue(val);
            
            // Parse and clamp the numeric value
            const numericValue = val === '' || val === '.' ? 0 : parseFloat(val) || 0;
            const clampedValue = clampValue(numericValue);
            onChange(clampedValue);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Format on blur: show the actual numeric value
        if (displayValue && value > 0) {
            setDisplayValue(value.toString());
        } else if (!displayValue || value === 0) {
            setDisplayValue('');
        }
        onBlur?.(e);
    };

    const handleClear = () => {
        setDisplayValue('');
        onChange(0);
    };

    return (
        <div className={`numeric-input ${className}`}>
            {label && (
                <label className="numeric-input__label">
                    {icon && <span className="numeric-input__icon">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="numeric-input__wrapper">
                <input
                    type="text"
                    inputMode="decimal"
                    className={`numeric-input__field ${error ? 'numeric-input__field--error' : ''}`}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{ paddingRight: showClearButton && displayValue ? '36px' : '12px' }}
                />
                {showClearButton && displayValue && !disabled && (
                    <button
                        type="button"
                        className="numeric-input__clear"
                        onClick={handleClear}
                        tabIndex={-1}
                        title="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {error && <span className="numeric-input__error">{error}</span>}
            {hint && !error && <span className="numeric-input__hint">{hint}</span>}
        </div>
    );
};

export default NumericInput;

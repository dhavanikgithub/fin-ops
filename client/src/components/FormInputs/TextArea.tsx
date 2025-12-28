'use client';

import React from 'react';
import './TextArea.scss';

export interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    rows?: number;
    maxLength?: number;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

/**
 * TextArea Component
 * 
 * A reusable textarea component with:
 * - Multi-line text support
 * - Icon support
 * - Error and hint messages
 * - Character count (when maxLength is provided)
 * - Disabled state
 * - Consistent styling across the app
 */
export const TextArea: React.FC<TextAreaProps> = ({
    value,
    onChange,
    label,
    placeholder,
    icon,
    disabled = false,
    error,
    hint,
    className = '',
    rows = 4,
    maxLength,
    onFocus,
    onBlur,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        e.target.select();
        onFocus?.(e);
    };

    return (
        <div className={`text-area ${className}`}>
            {label && (
                <label className="text-area__label">
                    {icon && <span className="text-area__icon">{icon}</span>}
                    {label}
                </label>
            )}
            <textarea
                className={`text-area__field ${error ? 'text-area__field--error' : ''}`}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
            />
            <div className="text-area__footer">
                {error && <span className="text-area__error">{error}</span>}
                {hint && !error && <span className="text-area__hint">{hint}</span>}
                {maxLength && (
                    <span className="text-area__count">
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TextArea;

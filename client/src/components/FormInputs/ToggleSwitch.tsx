'use client';

import React from 'react';
import './ToggleSwitch.scss';

export interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * ToggleSwitch Component
 * 
 * A reusable toggle switch component with:
 * - Smooth animations
 * - Label and description support
 * - Disabled state
 * - Keyboard accessibility
 * - Consistent styling across the app
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    description,
    id,
    disabled = false,
    className = '',
}) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) {
            onChange(e.target.checked);
        }
    };

    return (
        <div className={`toggle-switch ${disabled ? 'toggle-switch--disabled' : ''} ${className}`}>
            <div className="toggle-switch__wrapper">
                {(label || description) && (
                    <div className="toggle-switch__content">
                        {label && (
                            <label htmlFor={toggleId} className="toggle-switch__label">
                                {label}
                            </label>
                        )}
                        {description && (
                            <div className="toggle-switch__description">
                                {description}
                            </div>
                        )}
                    </div>
                )}
                <label className="toggle-switch__control">
                    <input
                        type="checkbox"
                        id={toggleId}
                        className="toggle-switch__input"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                    <span className="toggle-switch__slider"></span>
                </label>
            </div>
        </div>
    );
};

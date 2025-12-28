import React from 'react';
import { Check } from 'lucide-react';
import './PillToggleGroup.scss';

export interface PillToggleOption {
    label: string;
    value: string | number;
}

export interface PillToggleGroupProps {
    /**
     * Type of toggle - 'radio' for single selection, 'checkbox' for multiple selection
     */
    type: 'radio' | 'checkbox';
    
    /**
     * Current value(s) - single value for radio, array for checkbox
     */
    value: string | number | (string | number)[];
    
    /**
     * Callback when value changes
     */
    onChange: (value: string | number | (string | number)[]) => void;
    
    /**
     * Available options to display
     */
    options: PillToggleOption[];
    
    /**
     * Optional name attribute for radio group
     */
    name?: string;
    
    /**
     * Optional disabled state
     */
    disabled?: boolean;
    
    /**
     * Optional className for custom styling
     */
    className?: string;
}

/**
 * PillToggleGroup Component
 * 
 * A reusable component for rendering radio or checkbox groups with pill-style styling.
 * Features:
 * - Supports both radio (single selection) and checkbox (multiple selection) modes
 * - Custom pill styling with checkmark indicator
 * - Disabled state support
 * - Flexible value handling (string or number)
 * 
 * @example
 * // Radio mode
 * <PillToggleGroup
 *   type="radio"
 *   value={selectedValue}
 *   onChange={setValue}
 *   options={[
 *     { label: 'Option 1', value: 'opt1' },
 *     { label: 'Option 2', value: 'opt2' }
 *   ]}
 *   name="myRadioGroup"
 * />
 * 
 * @example
 * // Checkbox mode
 * <PillToggleGroup
 *   type="checkbox"
 *   value={selectedValues}
 *   onChange={setValues}
 *   options={[
 *     { label: 'Filter 1', value: 1 },
 *     { label: 'Filter 2', value: 2 }
 *   ]}
 * />
 */
export const PillToggleGroup: React.FC<PillToggleGroupProps> = ({
    type,
    value,
    onChange,
    options,
    name,
    disabled = false,
    className = ''
}) => {
    const isChecked = (optionValue: string | number): boolean => {
        if (type === 'radio') {
            return value === optionValue;
        } else {
            // Checkbox mode - value should be an array
            if (!Array.isArray(value)) return false;
            return value.includes(optionValue);
        }
    };

    const handleToggle = (optionValue: string | number) => {
        if (disabled) return;

        if (type === 'radio') {
            // Radio mode - set single value
            onChange(optionValue);
        } else {
            // Checkbox mode - toggle value in array
            if (!Array.isArray(value)) {
                onChange([optionValue]);
                return;
            }

            if (value.includes(optionValue)) {
                // Remove value
                onChange(value.filter(v => v !== optionValue));
            } else {
                // Add value
                onChange([...value, optionValue]);
            }
        }
    };

    return (
        <div className={`pill-toggle-group ${className}`.trim()}>
            {options.map((option, index) => {
                const checked = isChecked(option.value);
                const inputId = name 
                    ? `${name}-${option.value}` 
                    : `pill-toggle-${type}-${option.value}-${index}`;

                return (
                    <label
                        key={inputId}
                        className={`pill-toggle-group__item ${disabled ? 'pill-toggle-group__item--disabled' : ''}`}
                        htmlFor={inputId}
                    >
                        <input
                            type={type}
                            id={inputId}
                            name={name}
                            value={option.value}
                            checked={checked}
                            onChange={() => handleToggle(option.value)}
                            disabled={disabled}
                            className="pill-toggle-group__input"
                        />
                        <span className="pill-toggle-group__indicator">
                            {checked && <Check size={14} />}
                        </span>
                        <span className="pill-toggle-group__label">{option.label}</span>
                    </label>
                );
            })}
        </div>
    );
};

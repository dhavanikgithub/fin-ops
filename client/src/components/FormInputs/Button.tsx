'use client';

import React from 'react';
import './Button.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button variant - determines the visual style
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    
    /**
     * Button size
     */
    size?: 'small' | 'medium' | 'large';
    
    /**
     * Icon to display before the text
     */
    icon?: React.ReactNode;
    
    /**
     * Icon to display after the text
     */
    iconRight?: React.ReactNode;
    
    /**
     * Loading state - shows spinner and disables button
     */
    loading?: boolean;
    
    /**
     * Full width button
     */
    fullWidth?: boolean;
    
    /**
     * Active state for toggle buttons
     */
    active?: boolean;
    
    /**
     * Badge content (number or text) to display on button
     */
    badge?: string | number;
    
    /**
     * Children content (button text)
     */
    children?: React.ReactNode;
}

/**
 * Button Component
 * 
 * A reusable button component with:
 * - Multiple variants (primary, secondary, outline, ghost, destructive)
 * - Different sizes (small, medium, large)
 * - Icon support (before or after text)
 * - Loading state with spinner
 * - Badge support
 * - Active state
 * - Full width option
 * - All native button attributes support
 * 
 * @example
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Save
 * </Button>
 * 
 * @example
 * // Button with icon
 * <Button variant="secondary" icon={<Plus size={16} />}>
 *   Add Item
 * </Button>
 * 
 * @example
 * // Loading button
 * <Button variant="primary" loading={isLoading}>
 *   Submit
 * </Button>
 * 
 * @example
 * // Button with badge
 * <Button variant="secondary" badge={5} icon={<Filter size={16} />}>
 *   Filters
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    icon,
    iconRight,
    loading = false,
    fullWidth = false,
    active = false,
    badge,
    children,
    disabled,
    className = '',
    ...props
}) => {
    const buttonClasses = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full-width',
        active && 'btn--active',
        loading && 'btn--loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="btn__spinner" />
            )}
            {!loading && icon && (
                <span className="btn__icon btn__icon--left">
                    {icon}
                </span>
            )}
            {children && (
                <span className="btn__text">
                    {children}
                </span>
            )}
            {!loading && iconRight && (
                <span className="btn__icon btn__icon--right">
                    {iconRight}
                </span>
            )}
            {badge !== undefined && badge !== null && (
                <span className="btn__badge">
                    {badge}
                </span>
            )}
        </button>
    );
};

export default Button;

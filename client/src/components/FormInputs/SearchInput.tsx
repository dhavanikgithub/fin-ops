'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchInput.scss';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    onClear?: () => void;
    autoFocus?: boolean;
}

/**
 * SearchInput Component
 * 
 * A reusable search input component with:
 * - Search icon
 * - Clear button
 * - Loading indicator
 * - Debouncing handled by parent
 * - Consistent styling across the app
 */
export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    loading = false,
    disabled = false,
    className = '',
    onClear,
    autoFocus = false,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleClear = () => {
        onChange('');
        onClear?.();
    };

    return (
        <div className={`search-input ${className}`}>
            <span className="search-input__icon">
                <Search size={16} />
            </span>
            <input
                type="text"
                className="search-input__field"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                autoFocus={autoFocus}
            />
            {loading && value && (
                <span className="search-input__loading">Searching...</span>
            )}
            {value && !loading && (
                <button
                    type="button"
                    className="search-input__clear"
                    onClick={handleClear}
                    title="Clear search"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default SearchInput;

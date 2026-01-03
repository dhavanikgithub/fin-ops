'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import './AutocompleteInput.scss';

export interface AutocompleteOption {
    id: number;
    name: string;
}

export interface AutocompleteInputProps {
    value: AutocompleteOption | null;
    onChange: (value: AutocompleteOption | null) => void;
    options: AutocompleteOption[];
    loading?: boolean;
    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    onSearch?: (searchTerm: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    maxVisibleItems?: number;
    renderOption?: (option: AutocompleteOption, isHighlighted: boolean) => React.ReactNode;
    renderToken?: (option: AutocompleteOption) => React.ReactNode;
}

/**
 * AutocompleteInput Component
 * 
 * A reusable autocomplete input component with:
 * - Token display when selected
 * - Dropdown with keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Debounced search (handled by parent via onSearch)
 * - Loading state
 * - Custom rendering for options and tokens
 * - Error and hint messages
 */
export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    value,
    onChange,
    options,
    loading = false,
    label,
    placeholder = 'Search...',
    icon,
    disabled = false,
    error,
    hint,
    className = '',
    onSearch,
    onFocus,
    onBlur,
    maxVisibleItems = 3,
    renderOption,
    renderToken,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Calculate dropdown position
    const updateDropdownPosition = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    };

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(0);
        // Reset option refs array when options change
        optionRefs.current = optionRefs.current.slice(0, options.length);
    }, [options]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (showDropdown && optionRefs.current[highlightedIndex]) {
            const highlightedElement = optionRefs.current[highlightedIndex];
            const dropdown = dropdownRef.current;
            
            if (highlightedElement && dropdown) {
                const dropdownRect = dropdown.getBoundingClientRect();
                const elementRect = highlightedElement.getBoundingClientRect();
                
                // Check if element is below visible area
                if (elementRect.bottom > dropdownRect.bottom) {
                    highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
                // Check if element is above visible area
                else if (elementRect.top < dropdownRect.top) {
                    highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        }
    }, [highlightedIndex, showDropdown]);

    // Update dropdown position when it's shown or on scroll/resize
    useEffect(() => {
        if (showDropdown) {
            updateDropdownPosition();
            
            const handleScroll = () => updateDropdownPosition();
            const handleResize = () => updateDropdownPosition();
            
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
            
            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [showDropdown]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSearchTerm('');
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // Trigger search when searchTerm changes
    useEffect(() => {
        if (showDropdown && searchTerm) {
            onSearch?.(searchTerm);
        }
    }, [searchTerm, showDropdown, onSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        // Ensure dropdown is open when user types
        if (!showDropdown) {
            setShowDropdown(true);
        }
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
        setSearchTerm('');
        updateDropdownPosition();
        onFocus?.();
    };

    const handleInputBlur = () => {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            setShowDropdown(false);
            setSearchTerm('');
            setHighlightedIndex(0);
            onBlur?.();
        }, 200);
    };

    const handleSelect = (option: AutocompleteOption) => {
        onChange(option);
        setShowDropdown(false);
        setSearchTerm('');
        setHighlightedIndex(0);
    };

    const handleRemove = () => {
        onChange(null);
        setSearchTerm('');
        setShowDropdown(true);
        // Focus the input field after removing the selection
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < options.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (options[highlightedIndex]) {
                    handleSelect(options[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setSearchTerm('');
                break;
        }
    };

    const defaultRenderOption = (option: AutocompleteOption, isHighlighted: boolean) => (
        <div
            ref={(el) => {
                const index = options.indexOf(option);
                optionRefs.current[index] = el;
            }}
            className={`autocomplete-input__option ${isHighlighted ? 'autocomplete-input__option--highlighted' : ''}`}
            onClick={() => handleSelect(option)}
            onMouseEnter={() => setHighlightedIndex(options.indexOf(option))}
        >
            {option.name}
        </div>
    );

    const defaultRenderToken = (option: AutocompleteOption) => (
        <div className="autocomplete-input__token">
            {icon && <span className="autocomplete-input__token-icon">{icon}</span>}
            <span className="autocomplete-input__token-text">{option.name}</span>
            <button
                type="button"
                className="autocomplete-input__token-remove"
                onClick={handleRemove}
                disabled={disabled}
            >
                <X size={12} />
            </button>
        </div>
    );

    return (
        <div className={`autocomplete-input ${className}`} ref={wrapperRef}>
            {label && (
                <label className="autocomplete-input__label">
                    {icon && <span className="autocomplete-input__icon">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="autocomplete-input__wrapper">
                {value && !showDropdown ? (
                    renderToken ? renderToken(value) : defaultRenderToken(value)
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            className={`autocomplete-input__field ${error ? 'autocomplete-input__field--error' : ''}`}
                            placeholder={placeholder}
                            value={showDropdown ? searchTerm : value?.name || ''}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            autoComplete="off"
                        />
                        {showDropdown && searchTerm && (
                            <div 
                                ref={dropdownRef}
                                className="autocomplete-input__dropdown scrollbar-overlay"
                                style={{
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    width: `${dropdownPosition.width}px`,
                                    maxHeight: `${maxVisibleItems * 42}px`
                                }}
                            >
                                {loading ? (
                                    <div className="autocomplete-input__option autocomplete-input__option--loading">
                                        Loading...
                                    </div>
                                ) : options.length > 0 ? (
                                    options.map((option, index) => (
                                        <React.Fragment key={option.id}>
                                            {renderOption
                                                ? renderOption(option, index === highlightedIndex)
                                                : defaultRenderOption(option, index === highlightedIndex)}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <div className="autocomplete-input__option autocomplete-input__option--no-results">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            {error && <span className="autocomplete-input__error">{error}</span>}
            {hint && !error && <span className="autocomplete-input__hint">{hint}</span>}
        </div>
    );
};

export default AutocompleteInput;

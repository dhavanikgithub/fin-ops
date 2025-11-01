'use client';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import DatePicker from './DatePicker.js';
import './datepicker.scss';

interface DatePickerOptions {
    mode?: 'single' | 'range' | 'multiple';
    format?: string;
    locale?: string;
    defaultDate?: Date | string | null;
    inline?: boolean;
    theme?: 'default' | 'dark' | 'minimal';
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    disabledDates?: string[];
    disabledDaysOfWeek?: number[];
    disabledDateRanges?: Array<{start: string; end: string}>;
    enabledDates?: string[];
    disableWeekends?: boolean;
    blockPastDates?: boolean;
    blockFutureDates?: boolean;
    disableFunction?: (date: Date) => boolean;
    showIcon?: boolean;
    iconPosition?: 'left' | 'right';
    customIcon?: string;
    iconClass?: string;
    iconClickOpens?: boolean;
    position?: 'auto' | 'above' | 'below';
    firstDayOfWeek?: number;
    closeOnSelect?: boolean;
    allowInput?: boolean;
    clickOpens?: boolean;
    confirmRange?: boolean;
    applyButtonText?: string;
    cancelButtonText?: string;
    enableTime?: boolean;
    enableSeconds?: boolean;
    time_24hr?: boolean;
    enableMonthDropdown?: boolean;
    enableYearDropdown?: boolean;
    yearRange?: number;
    minYear?: number;
    maxYear?: number;
    // Callbacks
    onReady?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    onChange?: (date: Date | null | { start: Date | null; end: Date | null } | Date[]) => void;
    onMonthChange?: (month: number, year: number) => void;
    onYearChange?: (year: number) => void;
    onTimeChange?: (time: { hours: number; minutes: number; seconds: number }) => void;
    onSelect?: (date: Date) => void;
    onClear?: () => void;
}

interface DatePickerProps {
    value?: string;
    onChange?: (date: Date | null | { start: Date | null; end: Date | null } | Date[]) => void;
    onOpen?: () => void;
    onClose?: () => void;
    options?: DatePickerOptions;
    className?: string;
    placeholder?: string;
    theme?: 'light' | 'dark';
    maxDateToday?: boolean;
}

interface DatePickerRef {
    datePicker: DatePicker | null;
    open: () => void;
    close: () => void;
    setDate: (date: string | Date) => void;
    getDate: () => any;
    setTheme: (theme: 'light' | 'dark') => void;
    updateOptions: (options: Partial<DatePickerOptions>) => void;
}

const ReactDatePicker = forwardRef<DatePickerRef, DatePickerProps>(({
    value,
    onChange,
    onOpen,
    onClose,
    options = {},
    className = '',
    placeholder = 'Select date',
    theme = 'light',
    maxDateToday = false
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const datePickerRef = useRef<DatePicker | null>(null);

    // Determine theme class for DatePicker
    const getDatePickerTheme = () => {
        if (theme === 'dark') {
            return 'dark';
        }
        return 'default';
    };

    useImperativeHandle(ref, () => ({
        datePicker: datePickerRef.current,
        open: () => datePickerRef.current?.open(),
        close: () => datePickerRef.current?.close(),
        setDate: (date: string | Date) => datePickerRef.current?.setDate(date),
        getDate: () => datePickerRef.current?.getDate(),
        setTheme: (newTheme: 'light' | 'dark') => {
            if (datePickerRef.current) {
                const themeClass = newTheme === 'dark' ? 'dark' : 'default';
                datePickerRef.current.updateOptions({ theme: themeClass });
            }
        },
        updateOptions: (newOptions: Partial<DatePickerOptions>) => {
            if (datePickerRef.current) {
                datePickerRef.current.updateOptions(newOptions);
            }
        }
    }));

    useEffect(() => {
        if (inputRef.current && !datePickerRef.current) {
            // Prepare options with defaults and customizations
            const datePickerOptions: DatePickerOptions = {
                mode: 'single',
                format: 'Y-m-d',
                locale: 'en',
                theme: getDatePickerTheme(),
                showIcon: true,
                iconPosition: 'right',
                iconClass: 'datepicker-icon lucide-calendar',
                iconClickOpens: true,
                position: 'auto',
                firstDayOfWeek: 0,
                closeOnSelect: true,
                allowInput: true,
                clickOpens: true,
                enableMonthDropdown: true,
                enableYearDropdown: true,
                yearRange: 50,
                blockFutureDates: false,
                blockPastDates: false,
                disableWeekends: false,
                ...options, // Merge user options
                // Set maxDate to today if maxDateToday is true
                ...(maxDateToday && { maxDate: new Date() }),
                // Override callbacks to include prop callbacks
                onChange: (date: any) => {
                    if (onChange) {
                        onChange(date);
                    }
                    // Call user's onChange if provided in options
                    if (options.onChange) {
                        options.onChange(date);
                    }
                },
                onOpen: () => {
                    if (onOpen) {
                        onOpen();
                    }
                    // Call user's onOpen if provided in options
                    if (options.onOpen) {
                        options.onOpen();
                    }
                },
                onClose: () => {
                    if (onClose) {
                        onClose();
                    }
                    // Call user's onClose if provided in options
                    if (options.onClose) {
                        options.onClose();
                    }
                }
            };

            // Initialize DatePicker
            datePickerRef.current = new DatePicker(inputRef.current, datePickerOptions);

            // Set initial value if provided
            if (value) {
                datePickerRef.current.setDate(value);
            }
        }

        return () => {
            // Cleanup
            if (datePickerRef.current) {
                datePickerRef.current.destroy();
                datePickerRef.current = null;
            }
        };
    }, []); // Empty dependency array to run only on mount

    // Update value when prop changes
    useEffect(() => {
        if (datePickerRef.current && value !== undefined) {
            if (value) {
                datePickerRef.current.setDate(value);
            } else {
                datePickerRef.current.handleClear();
            }
        }
    }, [value]);

    // Update theme when theme prop changes
    useEffect(() => {
        if (datePickerRef.current) {
            const themeClass = theme === 'dark' ? 'dark' : 'default';
            datePickerRef.current.updateOptions({ theme: themeClass });
        }
    }, [theme]);

    // Update maxDate when maxDateToday changes
    useEffect(() => {
        if (datePickerRef.current) {
            datePickerRef.current.setMaxDate(maxDateToday ? new Date() : null);
        }
    }, [maxDateToday]);

    return (
        <input
            ref={inputRef}
            type="text"
            className={`datepicker-input ${className} ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
            placeholder={placeholder}
            readOnly
        />
    );
});

ReactDatePicker.displayName = 'ReactDatePicker';

export default ReactDatePicker;
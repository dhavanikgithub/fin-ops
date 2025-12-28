import { TRANSACTION_TYPES } from "../v1/types/transaction.js";
import {logger} from "./logger.js";


// Format date from API response
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Format time
export const formatTime = (timeString: string): string => {
    // Handle different time string formats
    if (!timeString) return '';

    // If timeString is already in HH:MM:SS format
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0]!!, 10);
            const minutes = parseInt(parts[1]!!, 10);
            const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

            // Convert to 12-hour format with AM/PM
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

            return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
    }

    // If timeString is a timestamp or ISO string, extract time
    try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    } catch (error) {
        logger.warn('Failed to parse time string:', timeString);
    }

    // Fallback: return original string
    return timeString;
};


// Function to format the amount with commas and restrict decimal points to two digits
const formatAmount = (input: string): string => {
    let value = input.replace(/[^0-9.]/g, '');  // Remove any non-numeric and non-period characters
    if (value === 'NaN' || value === '') {
        return '';
    }
    const decimalCount = (value.match(/\./g) || []).length;  // Count the number of periods (decimal points)

    // If more than one decimal point exists, remove the extra one
    if (decimalCount > 1) value = value.slice(0, -1);

    // Split the value into integer and decimal parts
    const parts = value.split('.');
    let integerPart = parts[0] || '';
    let decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    if (integerPart) {
        const temp = parseInt(integerPart, 10).toString();
        if (temp !== 'NaN') {
            // Remove leading zeros from the integer part
            integerPart = temp;
        }
    }


    // Ensure the decimal part is up to 2 digits
    if (decimalPart) {
        decimalPart = decimalPart.slice(0, 3); // Keep only 2 decimal places
    }

    // Format the integer part with commas every 3 digits
    if (integerPart && integerPart.length > 3) {
        const lastThree = integerPart.slice(-3);
        const otherNumbers = integerPart.slice(0, -3);
        if (otherNumbers !== '') {
            integerPart = otherNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ',' + lastThree;
        }
    }

    return integerPart + decimalPart;
};

// Function to parse a formatted amount (remove commas and convert to a number)
const parseFormattedAmount = (formattedAmount: string): number => {
    return parseFloat(formattedAmount.replace(/,/g, ''));
};

export function isTransactionTypeDeposit(type: number) {
    return type === 0;
}

export function isTransactionTypeWidthdraw(type: number) {
    return type === 1;
}

export function getTransactionTypeStr(type: number) {
    if (isTransactionTypeDeposit(type)) {
        return TRANSACTION_TYPES.DEPOSIT
    }
    return TRANSACTION_TYPES.WITHDRAW
}

const baseFuseOptions = {
    isCaseSensitive: false,
    includeScore: false,
    shouldSort: true,
    threshold: 0.6,
};

const monthMapping: Record<number, string> = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
}

const getMonthNumberFromDate = (dateString: string) => {
    return new Date(dateString).getMonth() + 1;
}

const getMonthName = (monthNumber: number) => {
    return new Date(2000, monthNumber - 1, 1).toLocaleString('default', { month: 'long' });
};

export { formatAmount, parseFormattedAmount, baseFuseOptions, getMonthNumberFromDate, monthMapping, getMonthName }
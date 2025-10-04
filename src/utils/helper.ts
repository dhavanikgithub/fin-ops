import { TRANSACTION_TYPES } from "../v1/types/transaction.js";

export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}


export function formatTime(dateString: string): string {
    // Extract the time portion (HH:mm:ss.sss) from the input string
    const timeParts = dateString.split('+')[0]; // Ignore the timezone part for now

    if (!timeParts) {
        return '12:00 AM'; // Default fallback
    }

    const timeComponents = timeParts.split(':');
    const hours = timeComponents[0] || '0';
    const minutes = timeComponents[1] || '0';
    const seconds = timeComponents[2] || '0';

    // Create a new Date object with today's date and the extracted time
    const now = new Date();
    now.setHours(parseInt(hours, 10));
    now.setMinutes(parseInt(minutes, 10));
    const secondsPart = (seconds || '0').split('.')[0] || '0';
    now.setSeconds(parseInt(secondsPart, 10));

    // Format the time in 12-hour format
    const formattedHours = now.getHours() % 12 || 12;  // Convert to 12-hour format
    const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
    const isAM = now.getHours() < 12;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${isAM ? 'AM' : 'PM'}`;

    return formattedTime;
}

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
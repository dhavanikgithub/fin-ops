
// Function to generate consistent background color for a name
const getAvatarColor = (name: string): string => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
        '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
        '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
        '#FD79A8', '#E17055', '#00B894', '#00CEC9', '#74B9FF'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

const getAvatarInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

const getAvatarColorClass = (name: string) => {
    // Simple hash function to get consistent color based on name
    const hash = name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
    return colors[Math.abs(hash) % colors.length];
};

// Format currency
const formatCurrency = (amount: number, currency = '₹'): string => {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
};

// Format date from API response
const formatDateToReadable = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const formatDateWithTime = (date: string, time: string) => {
    return `${date} • ${time}`;
};

// Format date to "Jan 2023"
const formatDateToMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
};

// Format time
const formatTime = (timeString: string): string => {
    // Handle different time string formats
    if (!timeString) return '';

    // If timeString is already in HH:MM:SS format
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
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
        console.warn('Failed to parse time string:', timeString);
    }

    // Fallback: return original string
    return timeString;
};


// Debounce function
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const formatAmountWithSymbol = (amount: number): string => {
    return `₹ ${amount.toLocaleString()}`;
};

const formatAmountAsCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

export { getAvatarInitials, getAvatarColorClass, getAvatarColor, formatDateToReadable, formatDateWithTime, formatTime, debounce, formatCurrency, formatAmountWithSymbol, formatAmountAsCurrency, formatDateToMonthYear };
// Transaction type mappings based on API documentation
export const TRANSACTION_TYPES = {
  DEPOSIT: 0,
  WITHDRAW: 1
} as const;

// Type for capitalized transaction type labels
export type TransactionType = 'deposit' | 'withdraw';

// Reverse mapping for display
export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.DEPOSIT]: 'deposit',
  [TRANSACTION_TYPES.WITHDRAW]: 'withdraw'
} as const;

// Map transaction type number to string
export const getTransactionTypeLabel = (type: number): TransactionType => {
  return TRANSACTION_TYPE_LABELS[type as keyof typeof TRANSACTION_TYPE_LABELS] || TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT];
};

// Map transaction type string to number
export const getTransactionTypeValue = (label: string): number => {
  return label === TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT] ? TRANSACTION_TYPES.DEPOSIT : TRANSACTION_TYPES.WITHDRAW;
};

// Get capitalized transaction type label for display
export const getCapitalizedTransactionTypeLabel = (type: number): TransactionType => {
  return isDeposit(type) ? TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT] : TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.WITHDRAW];
};

// Helper functions to check transaction type
export const isDeposit = (type: number): boolean => {
  return type === TRANSACTION_TYPES.DEPOSIT;
};

export const isWithdraw = (type: number): boolean => {
  return type === TRANSACTION_TYPES.WITHDRAW;
};

// Format currency
export const formatCurrency = (amount: number, currency = '₹'): string => {
  return `${currency} ${amount.toLocaleString('en-IN')}`;
};

// Format date from API response
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format time
export const formatTime = (timeStr: string): string => {
  // If time is in HH:MM:SS format, convert to 12-hour format
  const [hours, minutes] = timeStr.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// Generate initials from name
export const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else {
    return words[0][0].toUpperCase();
  }
};

// Generate consistent avatar color
export const getAvatarColor = (name: string): string => {
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

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
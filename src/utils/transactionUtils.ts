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

// Helper functions to check transaction type
export const isDeposit = (type: number): boolean => {
  return type === TRANSACTION_TYPES.DEPOSIT;
};

export const isWithdraw = (type: number): boolean => {
  return type === TRANSACTION_TYPES.WITHDRAW;
};

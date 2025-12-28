'use client';
import React from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Trash2, X, Hash, Calendar, User, Banknote, IndianRupee, Percent, AlertTriangle, Trash, RotateCcw } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteTransactionConfirmModal.scss';
import { isWithdraw, isWithdrawLabel, TransactionType } from '@/utils/transactionUtils';
import { formatAmountAsCurrency, formatDateToReadable, formatDateWithTime, formatTime } from '@/utils/helperFunctions';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

export interface Transaction {
    id: string;
    date: string;
    time: string;
    client: string;
    type: TransactionType;
    amount: number;
    charges: number;
    bank: string;
    card: string;
    notes?: string;
}

interface DeleteTransactionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (transactionId: string) => void;
    transaction: Transaction | null;
}

// Error Fallback Component for Delete Transaction Modal
const DeleteModalErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onClose: () => void;
}> = ({ error, resetErrorBoundary, onClose }) => {
    const handleTryAgain = () => {
        resetErrorBoundary();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="delete-modal-overlay" onClick={handleClose}>
            <div
                className="delete-modal delete-modal--error"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="errorTitle"
                aria-describedby="errorDesc"
            >
                <div className="delete-modal__header">
                    <h2 className="delete-modal__title" id="errorTitle">
                        <AlertTriangle size={18} />
                        Something went wrong
                    </h2>
                </div>

                <div className="delete-modal__body">
                    <p className="delete-modal__description" id="errorDesc">
                        We encountered an unexpected error while loading the delete confirmation dialog. 
                        Please try again or close this modal.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="delete-modal__error-details">
                            <summary>Technical Details (Development)</summary>
                            <pre className="delete-modal__error-stack">
                                {error.message}
                                {error.stack && `\n${error.stack}`}
                            </pre>
                        </details>
                    )}

                    <div className="delete-modal__warning">
                        <AlertTriangle size={16} />
                        Your transaction data is safe. This is just a display issue.
                    </div>
                </div>

                <div className="delete-modal__footer">
                    <Button 
                        variant="secondary" 
                        icon={<X size={16} />}
                        onClick={handleClose}
                        className="delete-modal__cancel"
                    >
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        icon={<RotateCcw size={16} />}
                        onClick={handleTryAgain}
                        className="delete-modal__delete"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DeleteTransactionConfirmModalContent: React.FC<DeleteTransactionConfirmModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    transaction
}) => {
    const { showBoundary } = useErrorBoundary();

    if (!isOpen || !transaction) return null;

    const handleDelete = () => {
        try {
            logger.info('Deleting transaction', { transactionId: transaction.id });
            onDelete(transaction.id);
            onClose();
            toast.success('Transaction deleted successfully');
        } catch (error) {
            logger.error('Error deleting transaction:', error);
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        try {
            logger.info('Cancelling transaction deletion');
            onClose();
        } catch (error) {
            logger.error('Error closing delete modal:', error);
            showBoundary(error);
        }
    };

    try {
        return (
            <div className="delete-modal-overlay" onClick={onClose}>
                <div
                    className="delete-modal"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-labelledby="deleteTitle"
                    aria-describedby="deleteDesc"
                >
                    <div className="delete-modal__header">
                        <h2 className="delete-modal__title" id="deleteTitle">
                            <Trash2 size={18} />
                            Delete Transaction
                        </h2>
                        <div className="delete-modal__irreversible-badge">Irreversible</div>
                    </div>

                    <div className="delete-modal__body">
                        <p className="delete-modal__description" id="deleteDesc">
                            You are about to permanently delete the following transaction. This action cannot be undone.
                        </p>

                        <div className="delete-modal__summary">
                            <div className="delete-modal__summary-left">
                                <div className="delete-modal__row">
                                    <Hash size={16} />
                                    {transaction.id}
                                </div>
                                <div className="delete-modal__row">
                                    <Calendar size={16} />
                                    {formatDateWithTime(formatDateToReadable(transaction.date), formatTime(transaction.time))}
                                </div>
                                <div className="delete-modal__meta">
                                    <div className="delete-modal__row">
                                        <User size={16} />
                                        Client: {transaction.client}
                                    </div>
                                    <div className="delete-modal__row">
                                        <Banknote size={16} />
                                        Type: {transaction.type}
                                    </div>
                                    <div className="delete-modal__row">
                                        <IndianRupee size={16} />
                                        Amount: {formatAmountAsCurrency(transaction.amount)}
                                    </div>
                                    {transaction.charges && transaction.charges > 0 ? <div className="delete-modal__row">
                                        <Percent size={16} />
                                        Charges: {transaction.charges}%
                                    </div> : null}
                                </div>
                            </div>
                            {isWithdrawLabel(transaction.type) && transaction.bank && transaction.card && transaction.bank.toUpperCase() !== 'N/A' && transaction.card.toUpperCase() !== 'N/A' ? (
                                <div className="delete-modal__summary-right">
                                    <div className="delete-modal__badge">Bank: {transaction.bank}</div>
                                    <div className="delete-modal__badge">Card: {transaction.card}</div>
                                </div>
                            ) : null}

                        </div>

                        <div className="delete-modal__warning">
                            <AlertTriangle size={16} />
                            Deleting this transaction will remove it from all reports and client balance calculations.
                        </div>
                    </div>

                    <div className="delete-modal__footer">
                        <Button 
                            variant="secondary" 
                            icon={<X size={16} />}
                            onClick={handleCancel}
                            className="delete-modal__cancel"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            icon={<Trash size={16} />}
                            onClick={handleDelete}
                            className="delete-modal__delete"
                        >
                            Delete Transaction
                        </Button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering delete modal:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const DeleteTransactionConfirmModal: React.FC<DeleteTransactionConfirmModalProps> = (props) => {
    if (!props.isOpen) return null;

    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <DeleteModalErrorFallback {...fallbackProps} onClose={props.onClose} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Delete transaction modal error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString(),
                    transactionId: props.transaction?.id
                });
            }}
        >
            <DeleteTransactionConfirmModalContent {...props} />
        </ErrorBoundary>
    );
};

export default DeleteTransactionConfirmModal;
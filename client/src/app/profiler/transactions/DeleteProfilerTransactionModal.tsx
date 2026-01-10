'use client'
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ProfilerTransaction } from '@/services/profilerTransactionService';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteProfilerTransactionModal.scss';

interface DeleteProfilerTransactionModalProps {
    transaction: ProfilerTransaction;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteProfilerTransactionModal: React.FC<DeleteProfilerTransactionModalProps> = ({
    transaction,
    onConfirm,
    onCancel
}) => {
    const { deletingTransactionIds } = useAppSelector((state) => state.profilerTransactions);
    const isDeleting = deletingTransactionIds.includes(transaction.id);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="delete-profiler-transaction-modal" onClick={handleBackdropClick}>
            <div className="delete-profiler-transaction-modal__content">
                <div className="delete-profiler-transaction-modal__header">
                    <div className="delete-profiler-transaction-modal__icon-wrapper">
                        <AlertTriangle className="delete-profiler-transaction-modal__icon" size={24} />
                    </div>
                    <button
                        type="button"
                        className="delete-profiler-transaction-modal__close"
                        onClick={onCancel}
                        disabled={isDeleting}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-profiler-transaction-modal__body">
                    <h2 className="delete-profiler-transaction-modal__title">
                        Delete Transaction
                    </h2>
                    <p className="delete-profiler-transaction-modal__message">
                        Are you sure you want to delete this <strong>{transaction.transaction_type}</strong> transaction?
                    </p>
                    
                    <div className="delete-profiler-transaction-modal__details">
                        <div className="delete-profiler-transaction-modal__detail-row">
                            <span className="delete-profiler-transaction-modal__detail-label">Client:</span>
                            <span className="delete-profiler-transaction-modal__detail-value">{transaction.client_name}</span>
                        </div>
                        <div className="delete-profiler-transaction-modal__detail-row">
                            <span className="delete-profiler-transaction-modal__detail-label">Bank:</span>
                            <span className="delete-profiler-transaction-modal__detail-value">{transaction.bank_name}</span>
                        </div>
                        <div className="delete-profiler-transaction-modal__detail-row">
                            <span className="delete-profiler-transaction-modal__detail-label">Date:</span>
                            <span className="delete-profiler-transaction-modal__detail-value">{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="delete-profiler-transaction-modal__detail-row">
                            <span className="delete-profiler-transaction-modal__detail-label">Amount:</span>
                            <span className="delete-profiler-transaction-modal__detail-value">{formatCurrency(transaction.amount)}</span>
                        </div>
                    </div>

                    <p className="delete-profiler-transaction-modal__warning">
                        This action cannot be undone. The transaction will be permanently removed and the profile balance will be recalculated.
                    </p>
                </div>

                <div className="delete-profiler-transaction-modal__actions">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="delete-profiler-transaction-modal__cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="delete-profiler-transaction-modal__confirm"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Transaction'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfilerTransactionModal;

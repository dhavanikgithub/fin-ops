'use client'
import React from 'react';
import { ProfilerTransaction } from '@/services/profilerTransactionService';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteProfileTransactionModal.scss';

interface DeleteProfileTransactionModalProps {
    transaction: ProfilerTransaction;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteProfileTransactionModal: React.FC<DeleteProfileTransactionModalProps> = ({
    transaction,
    onConfirm,
    onCancel
}) => {
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="delete-transaction-modal-overlay" onClick={onCancel}>
            <div className="delete-transaction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-transaction-modal__header">
                    <div className="delete-transaction-modal__icon-wrapper">
                        <AlertTriangle className="delete-transaction-modal__icon" size={24} />
                    </div>
                    <button
                        className="delete-transaction-modal__close"
                        onClick={onCancel}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-transaction-modal__content">
                    <h2 className="delete-transaction-modal__title">Delete Transaction</h2>
                    <p className="delete-transaction-modal__message">
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </p>

                    <div className="delete-transaction-modal__details">
                        <div className="delete-transaction-modal__detail-row">
                            <span className="delete-transaction-modal__detail-label">Type:</span>
                            <span className={`delete-transaction-modal__detail-value delete-transaction-modal__detail-value--${transaction.transaction_type}`}>
                                {transaction.transaction_type}
                            </span>
                        </div>
                        <div className="delete-transaction-modal__detail-row">
                            <span className="delete-transaction-modal__detail-label">Amount:</span>
                            <span className="delete-transaction-modal__detail-value">
                                {formatCurrency(transaction.amount)}
                            </span>
                        </div>
                        {transaction.withdraw_charges_amount && (
                            <div className="delete-transaction-modal__detail-row">
                                <span className="delete-transaction-modal__detail-label">Charges:</span>
                                <span className="delete-transaction-modal__detail-value">
                                    {formatCurrency(transaction.withdraw_charges_amount)}
                                </span>
                            </div>
                        )}
                        <div className="delete-transaction-modal__detail-row">
                            <span className="delete-transaction-modal__detail-label">Date:</span>
                            <span className="delete-transaction-modal__detail-value">
                                {formatDate(transaction.created_at)}
                            </span>
                        </div>
                        {transaction.notes && (
                            <div className="delete-transaction-modal__detail-row">
                                <span className="delete-transaction-modal__detail-label">Notes:</span>
                                <span className="delete-transaction-modal__detail-value">
                                    {transaction.notes}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="delete-transaction-modal__actions">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Delete Transaction
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfileTransactionModal;

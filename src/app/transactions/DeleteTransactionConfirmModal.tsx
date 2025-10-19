'use client';
import React from 'react';
import { Trash2, X, Hash, Calendar, User, Banknote, IndianRupee, Percent, AlertTriangle, Trash } from 'lucide-react';
import './DeleteTransactionConfirmModal.scss';
import { TransactionType } from '@/utils/transactionUtils';
import { formatAmountAsCurrency, formatDateToReadable, formatDateWithTime, formatTime } from '@/utils/helperFunctions';

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

const DeleteTransactionConfirmModal: React.FC<DeleteTransactionConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onDelete, 
    transaction 
}) => {
    if (!isOpen || !transaction) return null;

    const handleDelete = () => {
        onDelete(transaction.id);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

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
                                <div className="delete-modal__row">
                                    <Percent size={16} />
                                    Charges: {transaction.charges}%
                                </div>
                            </div>
                        </div>
                        <div className="delete-modal__summary-right">
                            <div className="delete-modal__badge">Bank: {transaction.bank}</div>
                            <div className="delete-modal__badge">Card: {transaction.card}</div>
                        </div>
                    </div>

                    <div className="delete-modal__warning">
                        <AlertTriangle size={16} />
                        Deleting this transaction will remove it from all reports and client balance calculations.
                    </div>
                </div>

                <div className="delete-modal__footer">
                    <button className="delete-modal__cancel" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="delete-modal__delete" onClick={handleDelete}>
                        <Trash size={16} />
                        Delete Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTransactionConfirmModal;
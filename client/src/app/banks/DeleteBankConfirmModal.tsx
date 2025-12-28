'use client';
import React, { useState } from 'react';
import { Building2, X, AlertTriangle, Trash2, UndoIcon, List, BadgeDollarSign } from 'lucide-react';
import { CheckboxInput } from '@/components/FormInputs';
import './DeleteBankConfirmModal.scss';

export interface Bank {
    id: string;
    name: string;
    accountNumber: string;
    linkedTransactionsCount: number;
    notes?: string;
}

interface DeleteBankConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (bankId: string, deleteTransactions: boolean) => void;
    bank: Bank | null;
}

const DeleteBankConfirmModal: React.FC<DeleteBankConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onDelete, 
    bank 
}) => {
    const [deleteTransactions, setDeleteTransactions] = useState(true);

    if (!isOpen || !bank) return null;

    const handleDelete = () => {
        onDelete(bank.id, deleteTransactions);
        onClose();
    };

    const handleCancel = () => {
        setDeleteTransactions(true);
        onClose();
    };

    const formatAccountNumber = (accountNumber: string) => {
        return `•••• ${accountNumber.slice(-4)}`;
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
                        <Building2 size={18} />
                        Delete Bank Account
                    </h2>
                    <button className="delete-modal__close" onClick={handleCancel}>
                        <X size={16} />
                        Close
                    </button>
                </div>

                <div className="delete-modal__body">
                    <div className="delete-modal__warning">
                        <AlertTriangle size={16} />
                        <div>
                            <div className="delete-modal__warning-title">
                                This action cannot be undone.
                            </div>
                            <div className="delete-modal__warning-text">
                                Deleting this bank will permanently remove it from your workspace.
                            </div>
                        </div>
                    </div>

                    <div className="delete-modal__summary">
                        <div className="delete-modal__item">
                            <div>
                                <div className="delete-modal__item-label">Bank Name</div>
                                <div className="delete-modal__item-value">{bank.name}</div>
                            </div>
                            <Building2 size={16} />
                        </div>
                        {/* <div className="delete-modal__item">
                            <div>
                                <div className="delete-modal__item-label">Account Number</div>
                                <div className="delete-modal__item-value">{formatAccountNumber(bank.accountNumber)}</div>
                            </div>
                            <BadgeDollarSign size={16} />
                        </div> */}
                        <div className="delete-modal__item">
                            <div>
                                <div className="delete-modal__item-label">Linked Transactions</div>
                                <div className="delete-modal__item-value">{bank.linkedTransactionsCount}</div>
                            </div>
                            <List size={16} />
                        </div>
                    </div>

                    <div className="delete-modal__options">
                        <CheckboxInput
                            id="deleteTransactions"
                            checked={deleteTransactions}
                            onChange={setDeleteTransactions}
                            label="Also delete all linked transactions (Required)"
                            disabled={true}
                            className="delete-modal__check--disabled"
                        />
                        <div className="delete-modal__hint">
                            All transactions associated with this bank must be deleted to maintain data integrity.
                        </div>
                    </div>
                </div>

                <div className="delete-modal__footer">
                    <button className="delete-modal__cancel" onClick={handleCancel}>
                        <UndoIcon size={16} />
                        Cancel
                    </button>
                    <button className="delete-modal__delete" onClick={handleDelete}>
                        <Trash2 size={16} />
                        Delete Bank
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteBankConfirmModal;

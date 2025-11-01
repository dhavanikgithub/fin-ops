'use client';
import React, { useState } from 'react';
import { CreditCard, X, AlertTriangle, Trash2, UndoIcon, List } from 'lucide-react';
import './DeleteCardConfirmModal.scss';

export interface Card {
    id: string;
    name: string;
    linkedTransactionsCount: number;
    notes?: string;
}

interface DeleteCardConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (cardId: string, deleteTransactions: boolean) => void;
    card: Card | null;
}

const DeleteCardConfirmModal: React.FC<DeleteCardConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onDelete, 
    card 
}) => {
    const [deleteTransactions, setDeleteTransactions] = useState(true);

    if (!isOpen || !card) return null;

    const handleDelete = () => {
        onDelete(card.id, deleteTransactions);
        onClose();
    };

    const handleCancel = () => {
        setDeleteTransactions(true);
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
                        <CreditCard size={18} />
                        Delete Card
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
                                Deleting this card will permanently remove it and optionally its linked transactions.
                            </div>
                        </div>
                    </div>

                    <div className="delete-modal__summary">
                        <div className="delete-modal__item">
                            <div>
                                <div className="delete-modal__item-label">Card Name</div>
                                <div className="delete-modal__item-value">{card.name}</div>
                            </div>
                            <CreditCard size={16} />
                        </div>
                        <div className="delete-modal__item">
                            <div>
                                <div className="delete-modal__item-label">Linked Transactions</div>
                                <div className="delete-modal__item-value">{card.linkedTransactionsCount}</div>
                            </div>
                            <List size={16} />
                        </div>
                    </div>

                    <div className="delete-modal__options">
                        <div className="delete-modal__check delete-modal__check--disabled">
                            <input 
                                type="checkbox"
                                id="deleteTransactions"
                                className="delete-modal__checkbox"
                                checked={deleteTransactions}
                                onChange={(e) => setDeleteTransactions(e.target.checked)}
                                disabled={true}
                            />
                            <label htmlFor="deleteTransactions" className="delete-modal__check-text">
                                Also delete all linked transactions (Required)
                            </label>
                        </div>
                        <div className="delete-modal__hint">
                            All transactions associated with this card must be deleted to maintain data integrity.
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
                        Delete Card
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCardConfirmModal;
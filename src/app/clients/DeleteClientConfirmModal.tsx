'use client';
import React, { useState } from 'react';
import { UserX, X, AlertTriangle, User, Mail, Phone, Building2, Hash, MapPin, Wallet } from 'lucide-react';
import './DeleteClientConfirmModal.scss';

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    clientId: string;
    location: string;
    activeTransactions: number;
    openBalance: number;
}

interface DeleteClientConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (clientId: string, deleteTransactions: boolean) => void;
    client: Client | null;
}

const DeleteClientConfirmModal: React.FC<DeleteClientConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onDelete, 
    client 
}) => {
    const [deleteTransactions, setDeleteTransactions] = useState(true);

    if (!isOpen || !client) return null;

    const handleDelete = () => {
        onDelete(client.id, deleteTransactions);
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
                        <UserX size={18} />
                        Delete Client
                    </h2>
                    <div className="delete-modal__badge">Irreversible</div>
                </div>

                <div className="delete-modal__body">
                    <div className="delete-modal__description" id="deleteDesc">
                        You are about to permanently delete this client. This will also remove all related transactions and records associated with this client.
                    </div>

                    <div className="delete-modal__summary">
                        <div className="delete-modal__summary-left">
                            <div className="delete-modal__info-row">
                                <User size={16} />
                                <span>{client.name}</span>
                            </div>
                            {client.email ? <div className="delete-modal__info-row">
                                <Mail size={16} />
                                <span>{client.email}</span>
                            </div> : null}
                            <div className="delete-modal__meta-grid">
                                {client.phone ? <div className="delete-modal__info-row">
                                    <Phone size={16} />
                                    <span>{client.phone}</span>
                                </div> : null}
                                {client.location ? <div className="delete-modal__info-row">
                                    <MapPin size={16} />
                                    <span>{client.location}</span>
                                </div> : null}
                                <div className="delete-modal__info-row">
                                    <Hash size={16} />
                                    <span>Client ID: {client.clientId}</span>
                                </div>
                                <div className="delete-modal__info-row">
                                    <Wallet size={16} />
                                    <span>Active Transactions: {client.activeTransactions}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="delete-modal__warning">
                        <AlertTriangle size={20} />
                        <div>
                            <div className="delete-modal__warning-title">
                                This action cannot be undone.
                            </div>
                            <div className="delete-modal__warning-text">
                                Deleting this client will permanently remove the client profile and all their transactions from reports, statements, and balance calculations.
                            </div>
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
                            All transactions associated with this client must be deleted to maintain data integrity.
                        </div>
                    </div>
                </div>

                <div className="delete-modal__footer">
                    <button className="delete-modal__cancel" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="delete-modal__delete" onClick={handleDelete}>
                        <UserX size={16} />
                        Delete Client
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteClientConfirmModal;

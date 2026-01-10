'use client'
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ProfilerClient } from '@/services/profilerClientService';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteProfilerClientModal.scss';

interface DeleteProfilerClientModalProps {
    client: ProfilerClient;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteProfilerClientModal: React.FC<DeleteProfilerClientModalProps> = ({
    client,
    onConfirm,
    onCancel
}) => {
    const { deletingClientIds } = useAppSelector((state) => state.profilerClients);
    const isDeleting = deletingClientIds.includes(client.id);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    return (
        <div className="delete-profiler-client-modal" onClick={handleBackdropClick}>
            <div className="delete-profiler-client-modal__content">
                <div className="delete-profiler-client-modal__header">
                    <div className="delete-profiler-client-modal__icon-wrapper">
                        <AlertTriangle className="delete-profiler-client-modal__icon" size={24} />
                    </div>
                    <button
                        type="button"
                        className="delete-profiler-client-modal__close"
                        onClick={onCancel}
                        disabled={isDeleting}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-profiler-client-modal__body">
                    <h2 className="delete-profiler-client-modal__title">
                        Delete Profiler Client
                    </h2>
                    <p className="delete-profiler-client-modal__message">
                        Are you sure you want to delete <strong>{client.name}</strong>?
                    </p>
                    <p className="delete-profiler-client-modal__warning">
                        This action cannot be undone. All data associated with this client will be permanently removed.
                    </p>

                    {client.profile_count > 0 && (
                        <div className="delete-profiler-client-modal__alert">
                            <AlertTriangle size={16} />
                            <span>
                                This client has {client.profile_count} active profile{client.profile_count > 1 ? 's' : ''}. 
                                Please remove all profiles before deleting this client.
                            </span>
                        </div>
                    )}
                </div>

                <div className="delete-profiler-client-modal__actions">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="delete-profiler-client-modal__cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting || client.profile_count > 0}
                        className="delete-profiler-client-modal__confirm"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Client'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfilerClientModal;

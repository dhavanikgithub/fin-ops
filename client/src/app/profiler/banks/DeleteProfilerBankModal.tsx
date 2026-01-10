'use client'
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ProfilerBank } from '@/services/profilerBankService';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteProfilerBankModal.scss';

interface DeleteProfilerBankModalProps {
    bank: ProfilerBank;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteProfilerBankModal: React.FC<DeleteProfilerBankModalProps> = ({
    bank,
    onConfirm,
    onCancel
}) => {
    const { deletingBankIds } = useAppSelector((state) => state.profilerBanks);
    const isDeleting = deletingBankIds.includes(bank.id);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    return (
        <div className="delete-profiler-bank-modal" onClick={handleBackdropClick}>
            <div className="delete-profiler-bank-modal__content">
                <div className="delete-profiler-bank-modal__header">
                    <div className="delete-profiler-bank-modal__icon-wrapper">
                        <AlertTriangle className="delete-profiler-bank-modal__icon" size={24} />
                    </div>
                    <button
                        type="button"
                        className="delete-profiler-bank-modal__close"
                        onClick={onCancel}
                        disabled={isDeleting}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-profiler-bank-modal__body">
                    <h2 className="delete-profiler-bank-modal__title">
                        Delete Profiler Bank
                    </h2>
                    <p className="delete-profiler-bank-modal__message">
                        Are you sure you want to delete <strong>{bank.bank_name}</strong>?
                    </p>
                    <p className="delete-profiler-bank-modal__warning">
                        This action cannot be undone. All data associated with this bank will be permanently removed.
                    </p>

                    {bank.profile_count > 0 && (
                        <div className="delete-profiler-bank-modal__alert">
                            <AlertTriangle size={16} />
                            <span>
                                This bank has {bank.profile_count} active profile{bank.profile_count > 1 ? 's' : ''}. 
                                Please remove all profiles before deleting this bank.
                            </span>
                        </div>
                    )}
                </div>

                <div className="delete-profiler-bank-modal__actions">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="delete-profiler-bank-modal__cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting || bank.profile_count > 0}
                        className="delete-profiler-bank-modal__confirm"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Bank'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfilerBankModal;

'use client'
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteProfilerProfileModal.scss';

interface DeleteProfilerProfileModalProps {
    profile: ProfilerProfile;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteProfilerProfileModal: React.FC<DeleteProfilerProfileModalProps> = ({
    profile,
    onConfirm,
    onCancel
}) => {
    const { deletingProfileIds } = useAppSelector((state) => state.profilerProfiles);
    const isDeleting = deletingProfileIds.includes(profile.id);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    return (
        <div className="delete-profiler-profile-modal" onClick={handleBackdropClick}>
            <div className="delete-profiler-profile-modal__content">
                <div className="delete-profiler-profile-modal__header">
                    <div className="delete-profiler-profile-modal__icon-wrapper">
                        <AlertTriangle className="delete-profiler-profile-modal__icon" size={24} />
                    </div>
                    <button
                        type="button"
                        className="delete-profiler-profile-modal__close"
                        onClick={onCancel}
                        disabled={isDeleting}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-profiler-profile-modal__body">
                    <h2 className="delete-profiler-profile-modal__title">
                        Delete Profiler Profile
                    </h2>
                    <p className="delete-profiler-profile-modal__message">
                        Are you sure you want to delete the profile for <strong>{profile.client_name}</strong> at <strong>{profile.bank_name}</strong>?
                    </p>
                    <p className="delete-profiler-profile-modal__warning">
                        This action cannot be undone. All data associated with this profile will be permanently removed.
                    </p>

                    {profile.transaction_count && profile.transaction_count > 0 && (
                        <div className="delete-profiler-profile-modal__alert">
                            <AlertTriangle size={16} />
                            <span>
                                This profile has {profile.transaction_count} transaction{profile.transaction_count > 1 ? 's' : ''}. 
                                Please remove all transactions before deleting this profile.
                            </span>
                        </div>
                    )}
                </div>

                <div className="delete-profiler-profile-modal__actions">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="delete-profiler-profile-modal__cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting || (profile.transaction_count && profile.transaction_count > 0) || false}
                        className="delete-profiler-profile-modal__confirm"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Profile'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfilerProfileModal;

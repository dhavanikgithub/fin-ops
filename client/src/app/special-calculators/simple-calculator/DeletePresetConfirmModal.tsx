'use client';
import React from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Trash2, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './DeleteScenarioConfirmModal.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

export interface PresetToDelete {
    id: string;
    name: string;
    value: string; // "2.5%" or "₹100"
    type: 'bank' | 'platform';
}

interface DeletePresetConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    preset: PresetToDelete | null;
}

// Error Fallback Component for Delete Preset Modal
const DeletePresetModalErrorFallback: React.FC<{
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
        <div className="delete-scenario-modal-overlay" onClick={handleClose}>
            <div
                className="delete-scenario-modal delete-scenario-modal--error"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="errorTitle"
                aria-describedby="errorDesc"
            >
                <div className="delete-scenario-modal__header">
                    <h2 className="delete-scenario-modal__title" id="errorTitle">
                        <AlertTriangle size={18} />
                        Something went wrong
                    </h2>
                </div>

                <div className="delete-scenario-modal__body">
                    <p className="delete-scenario-modal__description" id="errorDesc">
                        We encountered an unexpected error while loading the delete confirmation dialog. 
                        Please try again or close this modal.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="delete-scenario-modal__error-details">
                            <summary>Technical Details (Development)</summary>
                            <pre className="delete-scenario-modal__error-stack">
                                {error.message}
                                {error.stack && `\n${error.stack}`}
                            </pre>
                        </details>
                    )}

                    <div className="delete-scenario-modal__warning">
                        <AlertTriangle size={16} />
                        Your preset data is safe. This is just a display issue.
                    </div>
                </div>

                <div className="delete-scenario-modal__footer">
                    <Button 
                        variant="secondary" 
                        icon={<X size={16} />}
                        onClick={handleClose}
                        className="delete-scenario-modal__cancel"
                    >
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        icon={<RotateCcw size={16} />}
                        onClick={handleTryAgain}
                        className="delete-scenario-modal__delete"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DeletePresetConfirmModalContent: React.FC<DeletePresetConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    preset
}) => {
    const { showBoundary } = useErrorBoundary();

    if (!isOpen) return null;

    const handleDelete = () => {
        try {
            logger.info('Deleting preset', { presetId: preset?.id, presetName: preset?.name });
            onConfirm();
            onClose();
            toast.success('Preset deleted successfully');
        } catch (error) {
            logger.error('Error deleting preset:', error);
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        try {
            logger.info('Cancelling preset deletion');
            onClose();
        } catch (error) {
            logger.error('Error closing delete modal:', error);
            showBoundary(error);
        }
    };

    try {
        return (
            <div className="delete-scenario-modal-overlay" onClick={onClose}>
                <div
                    className="delete-scenario-modal"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-labelledby="modalTitle"
                    aria-describedby="modalDesc"
                >
                    <div className="delete-scenario-modal__header">
                        <h2 className="delete-scenario-modal__title" id="modalTitle">
                            <Trash2 size={18} />
                            Delete {preset?.type === 'bank' ? 'Bank Charge' : 'Platform Charge'} Preset
                        </h2>
                        <div className="delete-scenario-modal__irreversible-badge">Irreversible</div>
                    </div>

                    <div className="delete-scenario-modal__body">
                        <p className="delete-scenario-modal__description" id="modalDesc">
                            Are you sure you want to delete this preset? This action cannot be undone.
                        </p>

                        {preset && (
                            <div className="delete-scenario-modal__details">
                                <div className="delete-scenario-modal__detail-row">
                                    <span className="delete-scenario-modal__detail-label">Preset Name:</span>
                                    <span className="delete-scenario-modal__detail-value">{preset.name}</span>
                                </div>
                                <div className="delete-scenario-modal__detail-row">
                                    <span className="delete-scenario-modal__detail-label">Value:</span>
                                    <span className="delete-scenario-modal__detail-value">{preset.value}</span>
                                </div>
                                <div className="delete-scenario-modal__detail-row">
                                    <span className="delete-scenario-modal__detail-label">Type:</span>
                                    <span className="delete-scenario-modal__detail-value">
                                        {preset.type === 'bank' ? 'Bank Charge (%)' : 'Platform Charge (₹)'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="delete-scenario-modal__warning">
                            <AlertTriangle size={16} />
                            This will permanently remove the preset from your saved list.
                        </div>
                    </div>

                    <div className="delete-scenario-modal__footer">
                        <Button 
                            variant="secondary" 
                            icon={<X size={16} />}
                            onClick={handleCancel}
                            className="delete-scenario-modal__cancel"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            icon={<Trash2 size={16} />}
                            onClick={handleDelete}
                            className="delete-scenario-modal__delete"
                        >
                            Delete Preset
                        </Button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering delete preset modal:', error);
        showBoundary(error);
        return null;
    }
};

const DeletePresetConfirmModal: React.FC<DeletePresetConfirmModalProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <DeletePresetModalErrorFallback {...fallbackProps} onClose={props.onClose} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Delete Preset Modal Error Boundary caught an error:', error, errorInfo);
                toast.error('Delete preset modal encountered an error');
            }}
            onReset={() => {
                logger.log('Delete Preset Modal Error Boundary reset');
            }}
        >
            <DeletePresetConfirmModalContent {...props} />
        </ErrorBoundary>
    );
};

export default DeletePresetConfirmModal;

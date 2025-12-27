'use client';
import React from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Trash2, X, Calendar, IndianRupee, Percent, AlertTriangle, Trash, RotateCcw } from 'lucide-react';
import './DeleteScenarioConfirmModal.scss';
import { formatAmountAsCurrency, formatDateWithTime } from '@/utils/helperFunctions';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

export interface SavedScenario {
    id: string;
    amount: number;
    our: number;
    bank: number;
    platform: number;
    gst: number;
    savedAt: string;
}

interface DeleteScenarioConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    scenario: SavedScenario | null;
    mode: 'single' | 'all';
    totalCount?: number;
}

// Error Fallback Component for Delete Scenario Modal
const DeleteScenarioModalErrorFallback: React.FC<{
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
                        Your scenario data is safe. This is just a display issue.
                    </div>
                </div>

                <div className="delete-scenario-modal__footer">
                    <button className="delete-scenario-modal__cancel" onClick={handleClose}>
                        <X size={16} />
                        Close
                    </button>
                    <button className="delete-scenario-modal__delete" onClick={handleTryAgain}>
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteScenarioConfirmModalContent: React.FC<DeleteScenarioConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    scenario,
    mode,
    totalCount = 0
}) => {
    const { showBoundary } = useErrorBoundary();

    if (!isOpen) return null;

    const handleDelete = () => {
        try {
            if (mode === 'single') {
                logger.info('Deleting scenario', { scenarioId: scenario?.id });
            } else {
                logger.info('Deleting all scenarios', { count: totalCount });
            }
            onConfirm();
            onClose();
            
            if (mode === 'single') {
                toast.success('Scenario deleted successfully');
            } else {
                toast.success('All scenarios cleared successfully');
            }
        } catch (error) {
            logger.error('Error deleting scenario:', error);
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        try {
            logger.info('Cancelling scenario deletion');
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
                    aria-labelledby="deleteTitle"
                    aria-describedby="deleteDesc"
                >
                    <div className="delete-scenario-modal__header">
                        <h2 className="delete-scenario-modal__title" id="deleteTitle">
                            <Trash2 size={18} />
                            {mode === 'single' ? 'Delete Scenario' : 'Clear All Scenarios'}
                        </h2>
                        <div className="delete-scenario-modal__irreversible-badge">Irreversible</div>
                    </div>

                    <div className="delete-scenario-modal__body">
                        {mode === 'single' && scenario ? (
                            <>
                                <p className="delete-scenario-modal__description" id="deleteDesc">
                                    You are about to permanently delete the following saved scenario. This action cannot be undone.
                                </p>

                                <div className="delete-scenario-modal__summary">
                                    <div className="delete-scenario-modal__summary-content">
                                        <div className="delete-scenario-modal__row">
                                            <IndianRupee size={16} />
                                            <span className="delete-scenario-modal__label">Amount:</span>
                                            <span className="delete-scenario-modal__value">{formatAmountAsCurrency(scenario.amount)}</span>
                                        </div>
                                        <div className="delete-scenario-modal__row">
                                            <Percent size={16} />
                                            <span className="delete-scenario-modal__label">Our Charge:</span>
                                            <span className="delete-scenario-modal__value">{scenario.our}%</span>
                                        </div>
                                        <div className="delete-scenario-modal__row">
                                            <Percent size={16} />
                                            <span className="delete-scenario-modal__label">Bank Charge:</span>
                                            <span className="delete-scenario-modal__value">{scenario.bank}%</span>
                                        </div>
                                        <div className="delete-scenario-modal__row">
                                            <IndianRupee size={16} />
                                            <span className="delete-scenario-modal__label">Platform:</span>
                                            <span className="delete-scenario-modal__value">{formatAmountAsCurrency(scenario.platform)}</span>
                                        </div>
                                        <div className="delete-scenario-modal__row">
                                            <Calendar size={16} />
                                            <span className="delete-scenario-modal__label">Saved:</span>
                                            <span className="delete-scenario-modal__value">
                                                {new Date(scenario.savedAt).toLocaleDateString()} at {new Date(scenario.savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="delete-scenario-modal__description" id="deleteDesc">
                                    You are about to permanently delete all {totalCount} saved scenario{totalCount !== 1 ? 's' : ''}. This action cannot be undone.
                                </p>

                                <div className="delete-scenario-modal__summary delete-scenario-modal__summary--all">
                                    <div className="delete-scenario-modal__count">
                                        <Trash2 size={32} />
                                        <span className="delete-scenario-modal__count-number">{totalCount}</span>
                                        <span className="delete-scenario-modal__count-label">
                                            Scenario{totalCount !== 1 ? 's' : ''} will be deleted
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="delete-scenario-modal__warning">
                            <AlertTriangle size={16} />
                            {mode === 'single' 
                                ? 'This scenario will be permanently removed from your saved calculations.'
                                : 'All your saved scenarios will be permanently removed. You will need to save them again if needed.'}
                        </div>
                    </div>

                    <div className="delete-scenario-modal__footer">
                        <button className="delete-scenario-modal__cancel" onClick={handleCancel}>
                            <X size={16} />
                            Cancel
                        </button>
                        <button className="delete-scenario-modal__delete" onClick={handleDelete}>
                            <Trash size={16} />
                            {mode === 'single' ? 'Delete Scenario' : `Delete All (${totalCount})`}
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering delete scenario modal:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const DeleteScenarioConfirmModal: React.FC<DeleteScenarioConfirmModalProps> = (props) => {
    if (!props.isOpen) return null;

    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <DeleteScenarioModalErrorFallback {...fallbackProps} onClose={props.onClose} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Delete scenario modal error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString(),
                    scenarioId: props.scenario?.id,
                    mode: props.mode
                });
            }}
        >
            <DeleteScenarioConfirmModalContent {...props} />
        </ErrorBoundary>
    );
};

export default DeleteScenarioConfirmModal;

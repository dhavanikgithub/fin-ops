'use client';
import React, { useEffect } from 'react';
import { ServerOff, X, AlertTriangle, Square, RotateCcw, Clock3, RefreshCcw, Inbox } from 'lucide-react';
import './ServerUnavailableModal.scss';

interface ServerUnavailableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTryAgain?: () => void;
    onDismiss?: () => void;
    countdown?: number;
    lastError?: string | null;
    isServerHealthy?: boolean;
    isRetrying?: boolean;
}

const ServerUnavailableModal: React.FC<ServerUnavailableModalProps> = ({ 
    isOpen, 
    onClose, 
    onTryAgain,
    onDismiss,
    countdown = 0,
    lastError,
    isServerHealthy = false,
    isRetrying = false
}) => {
    if (!isOpen) return null;

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent Escape key from closing modal when server is down
            if (event.key === 'Escape' && !isServerHealthy) {
                event.preventDefault();
                event.stopPropagation();
            } else if (event.key === 'Escape' && isServerHealthy) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown, true);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isServerHealthy, onClose]);

    const handleTryAgain = () => {
        if (onTryAgain) {
            onTryAgain();
        }
        // Only close if server becomes healthy
        if (isServerHealthy) {
            onClose();
        }
    };

    const handleDismiss = () => {
        // Only allow dismiss if server is healthy
        if (isServerHealthy) {
            if (onDismiss) {
                onDismiss();
            }
            onClose();
        }
    };

    const handleOverlayClick = () => {
        // Only allow closing via overlay if server is healthy
        if (isServerHealthy) {
            onClose();
        }
    };

    const handleCloseClick = () => {
        // Only allow closing via close button if server is healthy
        if (isServerHealthy) {
            onClose();
        }
    };

    return (
        <div className="server-modal-overlay" onClick={handleOverlayClick}>
            <div 
                className="server-modal" 
                onClick={(e) => e.stopPropagation()}
                role="dialog" 
                aria-labelledby="serverTitle" 
                aria-describedby="serverDesc"
                aria-modal="true"
            >
                <div className="server-modal__header">
                    <h2 className="server-modal__title" id="serverTitle">
                        <ServerOff size={18} />
                        Server Unavailable
                    </h2>
                    {isServerHealthy && (
                        <button className="server-modal__close" onClick={handleCloseClick}>
                            <X size={16} />
                            Close
                        </button>
                    )}
                </div>

                <div className="server-modal__body">
                    <div className="server-modal__error">
                        <AlertTriangle size={16} />
                        <div className="server-modal__error-text">
                            The server is currently down. Please try again after some time. Your
                            data is safe and no changes were made.
                            {lastError && (
                                <div className="server-modal__error-details">
                                    Error: {lastError}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isServerHealthy && (
                        <div className="server-modal__countdown">
                            <RefreshCcw size={16} className={`server-modal__countdown-icon ${isRetrying ? 'spinning' : ''}`} />
                            <span>
                                {isRetrying 
                                    ? 'Retrying...' 
                                    : countdown > 0
                                        ? `Automatically retrying in ${countdown} seconds...`
                                        : 'Starting retry countdown...'
                                }
                            </span>
                        </div>
                    )}

                    <div className="server-modal__tips">
                        <div className="server-modal__tip">
                            <Clock3 size={16} />
                            <span>Wait a few minutes and try again.</span>
                        </div>
                        <div className="server-modal__tip">
                            <RefreshCcw size={16} />
                            <span>If the issue persists, refresh this page.</span>
                        </div>
                        <div className="server-modal__tip">
                            <Inbox size={16} />
                            <span>Optional: Contact support if you need immediate assistance.</span>
                        </div>
                    </div>
                </div>

                <div className="server-modal__footer">
                    {isServerHealthy && (
                        <button className="server-modal__dismiss" onClick={handleDismiss}>
                            <Square size={16} />
                            Dismiss
                        </button>
                    )}
                    <button 
                        className="server-modal__try-again" 
                        onClick={handleTryAgain}
                        disabled={isRetrying}
                    >
                        <RotateCcw size={16} className={isRetrying ? 'spinning' : ''} />
                        {isRetrying ? 'Retrying...' : 'Try Again'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerUnavailableModal;
'use client';
import React from 'react';
import { ServerOff, X, AlertTriangle, Square, RotateCcw, Clock3, RefreshCcw, Inbox } from 'lucide-react';
import './ServerUnavailableModal.scss';

interface ServerUnavailableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTryAgain?: () => void;
    onDismiss?: () => void;
}

const ServerUnavailableModal: React.FC<ServerUnavailableModalProps> = ({ 
    isOpen, 
    onClose, 
    onTryAgain,
    onDismiss
}) => {
    if (!isOpen) return null;

    const handleTryAgain = () => {
        if (onTryAgain) {
            onTryAgain();
        }
        onClose();
    };

    const handleDismiss = () => {
        if (onDismiss) {
            onDismiss();
        }
        onClose();
    };

    return (
        <div className="server-modal-overlay" onClick={onClose}>
            <div 
                className="server-modal" 
                onClick={(e) => e.stopPropagation()}
                role="dialog" 
                aria-labelledby="serverTitle" 
                aria-describedby="serverDesc"
            >
                <div className="server-modal__header">
                    <h2 className="server-modal__title" id="serverTitle">
                        <ServerOff size={18} />
                        Server Unavailable
                    </h2>
                    <button className="server-modal__close" onClick={onClose}>
                        <X size={16} />
                        Close
                    </button>
                </div>

                <div className="server-modal__body">
                    <div className="server-modal__error">
                        <AlertTriangle size={16} />
                        <div className="server-modal__error-text">
                            The server is currently down. Please try again after some time. Your
                            data is safe and no changes were made.
                        </div>
                    </div>

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
                    <button className="server-modal__dismiss" onClick={handleDismiss}>
                        <Square size={16} />
                        Dismiss
                    </button>
                    <button className="server-modal__try-again" onClick={handleTryAgain}>
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerUnavailableModal;
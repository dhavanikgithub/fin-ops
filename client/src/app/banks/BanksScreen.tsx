'use client'
import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, Building2 } from 'lucide-react';
import './BanksScreen.scss';
import BankList from './BankList';
import AddBankScreen from './AddBank';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-bank';

// Error Fallback Component for Banks Screen
const BanksScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="bs__error-boundary">
                        <div className="bs__error-boundary-content">
                            <AlertTriangle size={64} className="bs__error-boundary-icon" />
                            <h2 className="bs__error-boundary-title">Something went wrong</h2>
                            <p className="bs__error-boundary-message">
                                We encountered an unexpected error in the banks section. 
                                Don't worry, your bank data is safe. You can try again or go back to the main dashboard.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="bs__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="bs__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="bs__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/banks'}
                                >
                                    <Building2 size={16} />
                                    Reload Banks
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <Home size={16} />
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BanksScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddBank = () => {
        try {
            logger.log('Switching to add bank view');
            setCurrentView('add-bank');
        } catch (error) {
            logger.error('Error navigating to add bank view:', error);
            toast.error('Failed to open add bank form. Please try again.');
        }
    };

    const handleBackToBanks = () => {
        try {
            logger.log('Switching back to bank list view');
            setCurrentView('list');
        } catch (error) {
            logger.error('Error navigating back to bank list:', error);
            toast.error('Failed to return to bank list. Please try again.');
        }
    };

    const renderCurrentView = () => {
        try {
            switch (currentView) {
                case 'add-bank':
                    return (
                        <AddBankScreen
                            onCancel={handleBackToBanks}
                            onBackToBanks={handleBackToBanks}
                        />
                    );
                case 'list':
                default:
                    return (
                        <BankList
                            onNewBank={handleShowAddBank}
                        />
                    );
            }
        } catch (error) {
            logger.error('Error rendering banks view:', error);
            throw error; // Let error boundary handle this
        }
    };

    return renderCurrentView();
};

const BanksScreen: React.FC = () => {
    return (
        <ErrorBoundary 
            FallbackComponent={BanksScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Banks screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <BanksScreenContent />
        </ErrorBoundary>
    );
};

export default BanksScreen;
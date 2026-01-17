'use client';
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import TransactionList from './TransactionList';
import AddDepositScreen from './AddDeposit';
import AddWithdrawScreen from './AddWithdraw';
import './TransactionsScreen.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'deposit' | 'withdraw';

// Error Fallback Component for Transaction Screen
const TransactionScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="ts__error-boundary">
                        <div className="ts__error-boundary-content">
                            <AlertTriangle size={64} className="ts__error-boundary-icon" />
                            <h2 className="ts__error-boundary-title">Something went wrong</h2>
                            <p className="ts__error-boundary-message">
                                We encountered an unexpected error in the transactions section. 
                                Don&apos;t worry, your data is safe. You can try again or go back to the main dashboard.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="ts__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="ts__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="ts__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                    className="main__button"
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<ArrowUpDown size={16} />}
                                    onClick={() => window.location.href = '/transactions'}
                                    className="main__icon-button"
                                >
                                    Reload Transactions
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/'}
                                    className="main__icon-button"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransactionScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { showBoundary } = useErrorBoundary();

    // Check URL params on mount to handle navigation from ClientList
    React.useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const view = urlParams.get('view');
            
            if (view === 'deposit' || view === 'withdraw') {
                setCurrentView(view as ViewState);
                // Clear URL params after reading
                window.history.replaceState({}, '', '/transactions');
            }
        } catch (error) {
            logger.error('Error checking URL params:', error);
        }
    }, []);

    const handleShowDeposit = () => {
        try {
            logger.info('Navigating to deposit view');
            setCurrentView('deposit');
        } catch (error) {
            logger.error('Error navigating to deposit view:', error);
            toast.error('Failed to open deposit form. Please try again.');
        }
    };

    const handleShowWithdraw = () => {
        try {
            logger.info('Navigating to withdraw view');
            setCurrentView('withdraw');
        } catch (error) {
            logger.error('Error navigating to withdraw view:', error);
            toast.error('Failed to open withdraw form. Please try again.');
        }
    };

    const handleBackToTransactions = () => {
        try {
            logger.info('Navigating back to transaction list');
            setCurrentView('list');
        } catch (error) {
            logger.error('Error navigating back to transaction list:', error);
            toast.error('Failed to return to transaction list. Please try again.');
        }
    };

    const renderCurrentView = () => {
        try {
            switch (currentView) {
                case 'deposit':
                    return (
                        <AddDepositScreen 
                            onCancel={handleBackToTransactions}
                            onBackToTransactions={handleBackToTransactions}
                        />
                    );
                case 'withdraw':
                    return (
                        <AddWithdrawScreen 
                            onCancel={handleBackToTransactions}
                            onBackToTransactions={handleBackToTransactions}
                        />
                    );
                case 'list':
                default:
                    return (
                        <TransactionList 
                            onDeposit={handleShowDeposit}
                            onWithdraw={handleShowWithdraw}
                        />
                    );
            }
        } catch (error) {
            logger.error('Error rendering transaction view:', error);
            showBoundary(error);
            return null;
        }
    };

    return (
        <div className="main">
            {renderCurrentView()}
        </div>
    );
};

const TransactionScreen: React.FC = () => {
    return (
        <ErrorBoundary 
            FallbackComponent={TransactionScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Transaction screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <TransactionScreenContent />
        </ErrorBoundary>
    );
};

export default TransactionScreen;
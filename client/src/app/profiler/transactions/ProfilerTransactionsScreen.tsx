'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfilerTransactionsScreen.scss';
import ProfilerTransactionList from './ProfilerTransactionList';
import AddProfilerDeposit from './AddProfilerDeposit';
import AddProfilerWithdraw from './AddProfilerWithdraw';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-deposit' | 'add-withdraw';

const ProfilerTransactionsScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="profiler-transactions-screen__error-boundary">
                        <div className="profiler-transactions-screen__error-boundary-content">
                            <AlertTriangle size={64} className="profiler-transactions-screen__error-boundary-icon" />
                            <h2 className="profiler-transactions-screen__error-boundary-title">Something went wrong</h2>
                            <p className="profiler-transactions-screen__error-boundary-message">
                                We encountered an unexpected error in the profiler transactions section.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="profiler-transactions-screen__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="profiler-transactions-screen__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="profiler-transactions-screen__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<ArrowDownCircle size={16} />}
                                    onClick={() => window.location.href = '/profiler/transactions'}
                                >
                                    Reload Transactions
                                </Button>
                                <Button 
                                    variant="ghost"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/profiler'}
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

const ProfilerTransactionsScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { resetBoundary } = useErrorBoundary();

    const handleShowAddDeposit = () => {
        logger.log('Navigating to add deposit view');
        setCurrentView('add-deposit');
    };

    const handleShowAddWithdraw = () => {
        logger.log('Navigating to add withdraw view');
        setCurrentView('add-withdraw');
    };

    const handleBackToTransactions = () => {
        logger.log('Navigating back to transactions list');
        setCurrentView('list');
        
    };

    const handleTransactionSubmit = () => {
        logger.log('Navigating back to transactions list');
        setCurrentView('list');
        toast.success('Transaction saved successfully');
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'list':
                return (
                    <ProfilerTransactionList 
                        onNewDeposit={handleShowAddDeposit}
                        onNewWithdraw={handleShowAddWithdraw}
                    />
                );
            case 'add-deposit':
                return <AddProfilerDeposit onBack={handleBackToTransactions} onTransactionSubmit={handleTransactionSubmit} />;
            case 'add-withdraw':
                return <AddProfilerWithdraw onBack={handleBackToTransactions} onTransactionSubmit={handleTransactionSubmit} />;
            default:
                return (
                    <ProfilerTransactionList 
                        onNewDeposit={handleShowAddDeposit}
                        onNewWithdraw={handleShowAddWithdraw}
                    />
                );
        }
    };

    return <div className="main">{renderCurrentView()}</div>;
};

const ProfilerTransactionsScreen: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ProfilerTransactionsScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('ProfilerTransactionsScreen Error Boundary caught an error:', {
                    error,
                    errorInfo,
                });
            }}
        >
            <ProfilerTransactionsScreenContent />
        </ErrorBoundary>
    );
};

export default ProfilerTransactionsScreen;

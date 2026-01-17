'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfilerBanksScreen.scss';
import ProfilerBankList from './ProfilerBankList';
import AddProfilerBank from './AddProfilerBank';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-bank';

const ProfilerBanksScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="profiler-banks-screen__error-boundary">
                        <div className="profiler-banks-screen__error-boundary-content">
                            <AlertTriangle size={64} className="profiler-banks-screen__error-boundary-icon" />
                            <h2 className="profiler-banks-screen__error-boundary-title">Something went wrong</h2>
                            <p className="profiler-banks-screen__error-boundary-message">
                                We encountered an unexpected error in the profiler banks section.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="profiler-banks-screen__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="profiler-banks-screen__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="profiler-banks-screen__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<Building2 size={16} />}
                                    onClick={() => window.location.href = '/profiler/banks'}
                                >
                                    Reload Banks
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

const ProfilerBanksScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { resetBoundary } = useErrorBoundary();

    const handleShowAddBank = () => {
        logger.log('Navigating to add bank view');
        setCurrentView('add-bank');
    };

    const handleBackToBanks = () => {
        logger.log('Navigating back to banks list');
        setCurrentView('list');
        toast.success('Bank saved successfully');
    };

    const handleOnBankSubmit = () => {
        setCurrentView('list');
        toast.success('Bank saved successfully');
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'list':
                return <ProfilerBankList onNewBank={handleShowAddBank} />;
            case 'add-bank':
                return <AddProfilerBank onBack={handleBackToBanks} onBankSubmit={handleOnBankSubmit} />;
            default:
                return <ProfilerBankList onNewBank={handleShowAddBank} />;
        }
    };

    return <div className="main">{renderCurrentView()}</div>;
};

const ProfilerBanksScreen: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ProfilerBanksScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('ProfilerBanksScreen Error Boundary caught an error:', {
                    error,
                    errorInfo,
                });
            }}
        >
            <ProfilerBanksScreenContent />
        </ErrorBoundary>
    );
};

export default ProfilerBanksScreen;

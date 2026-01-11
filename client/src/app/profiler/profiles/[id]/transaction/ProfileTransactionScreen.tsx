'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, FileText } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfileTransactionScreen.scss';
import ProfileTransactionList from './ProfileTransactionList';
import AddProfileTransaction from './AddProfileTransaction';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import logger from '@/utils/logger';

type ViewState = 'list' | 'add-transaction';

const ProfileTransactionScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    const params = useParams();
    const profileId = params.id;

    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="profile-transaction-screen__error-boundary">
                        <div className="profile-transaction-screen__error-boundary-content">
                            <AlertTriangle size={64} className="profile-transaction-screen__error-boundary-icon" />
                            <h2 className="profile-transaction-screen__error-boundary-title">Something went wrong</h2>
                            <p className="profile-transaction-screen__error-boundary-message">
                                We encountered an unexpected error in the profile transactions section.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="profile-transaction-screen__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="profile-transaction-screen__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="profile-transaction-screen__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<FileText size={16} />}
                                    onClick={() => window.location.href = `/profiler/profiles/${profileId}/transaction`}
                                >
                                    Reload Transactions
                                </Button>
                                <Button 
                                    variant="ghost"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/profiler/profiles'}
                                >
                                    Back to Profiles
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileTransactionScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { resetBoundary } = useErrorBoundary();
    const { selectedProfile } = useAppSelector((state) => state.profilerProfiles);

    const handleShowAddTransaction = () => {
        logger.log('Navigating to add transaction view');
        setCurrentView('add-transaction');
    };

    const handleBackToList = () => {
        logger.log('Navigating back to transactions list');
        setCurrentView('list');
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'list':
                return <ProfileTransactionList onAddTransaction={handleShowAddTransaction} />;
            case 'add-transaction':
                return selectedProfile ? (
                    <AddProfileTransaction 
                        profile={selectedProfile} 
                        onBack={handleBackToList} 
                    />
                ) : null;
            default:
                return <ProfileTransactionList onAddTransaction={handleShowAddTransaction} />;
        }
    };

    return (
        <div className="main">
            {renderCurrentView()}
        </div>
    );
};

const ProfileTransactionScreen: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ProfileTransactionScreenErrorFallback}
            onReset={() => {
                logger.log('Error boundary reset');
            }}
        >
            <ProfileTransactionScreenContent />
        </ErrorBoundary>
    );
};

export default ProfileTransactionScreen;

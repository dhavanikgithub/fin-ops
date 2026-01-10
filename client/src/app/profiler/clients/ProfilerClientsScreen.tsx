'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, Users } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfilerClientsScreen.scss';
import ProfilerClientList from './ProfilerClientList';
import AddProfilerClient from './AddProfilerClient';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-client';

const ProfilerClientsScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="profiler-clients-screen__error-boundary">
                        <div className="profiler-clients-screen__error-boundary-content">
                            <AlertTriangle size={64} className="profiler-clients-screen__error-boundary-icon" />
                            <h2 className="profiler-clients-screen__error-boundary-title">Something went wrong</h2>
                            <p className="profiler-clients-screen__error-boundary-message">
                                We encountered an unexpected error in the profiler clients section.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="profiler-clients-screen__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="profiler-clients-screen__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="profiler-clients-screen__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<Users size={16} />}
                                    onClick={() => window.location.href = '/profiler/clients'}
                                >
                                    Reload Clients
                                </Button>
                                <Button 
                                    variant="secondary"
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

const ProfilerClientsScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { showBoundary } = useErrorBoundary();

    const handleShowAddClient = () => {
        try {
            logger.log('Switching to add profiler client view');
            setCurrentView('add-client');
        } catch (error) {
            logger.error('Error navigating to add profiler client view:', error);
            toast.error('Failed to open add client form. Please try again.');
        }
    };

    const handleBackToClients = () => {
        try {
            logger.log('Switching back to profiler client list view');
            setCurrentView('list');
        } catch (error) {
            logger.error('Error navigating back to profiler client list:', error);
            toast.error('Failed to return to client list. Please try again.');
        }
    };

    const renderCurrentView = () => {
        try {
            switch (currentView) {
                case 'add-client':
                    return (
                        <AddProfilerClient
                            onBack={handleBackToClients}
                        />
                    );
                case 'list':
                default:
                    return (
                        <ProfilerClientList
                            onNewClient={handleShowAddClient}
                        />
                    );
            }
        } catch (error) {
            logger.error('Error rendering profiler clients view:', error);
            showBoundary(error);
        }
    };

    return renderCurrentView();
};

const ProfilerClientsScreen: React.FC = () => {
    return (
        <div className="profiler-clients-screen">
            <ErrorBoundary 
                FallbackComponent={ProfilerClientsScreenErrorFallback}
                onError={(error, errorInfo) => {
                    logger.error('Profiler clients screen error boundary triggered:', {
                        error: error.message,
                        stack: error.stack,
                        errorInfo,
                        timestamp: new Date().toISOString()
                    });
                }}
            >
                <ProfilerClientsScreenContent />
            </ErrorBoundary>
        </div>
    );
};

export default ProfilerClientsScreen;

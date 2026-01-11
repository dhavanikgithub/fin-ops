'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, Users } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ClientsScreen.scss';
import ClientList from './ClientList';
import AddClientScreen from './AddClient';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-client';

// Error Fallback Component for Clients Screen
const ClientsScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="cs__error-boundary">
                        <div className="cs__error-boundary-content">
                            <AlertTriangle size={64} className="cs__error-boundary-icon" />
                            <h2 className="cs__error-boundary-title">Something went wrong</h2>
                            <p className="cs__error-boundary-message">
                                We encountered an unexpected error in the clients section. 
                                Don't worry, your client data is safe. You can try again or go back to the main dashboard.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="cs__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="cs__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="cs__error-boundary-actions">
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
                                    icon={<Users size={16} />}
                                    onClick={() => window.location.href = '/clients'}
                                    className="main__icon-button"
                                >
                                    Reload Clients
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

const ClientsScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { showBoundary } = useErrorBoundary();

    const handleShowAddClient = () => {
        try {
            logger.log('Switching to add client view');
            setCurrentView('add-client');
        } catch (error) {
            logger.error('Error navigating to add client view:', error);
            toast.error('Failed to open add client form. Please try again.');
        }
    };

    const handleBackToClients = () => {
        try {
            logger.log('Switching back to client list view');
            setCurrentView('list');
        } catch (error) {
            logger.error('Error navigating back to client list:', error);
            toast.error('Failed to return to client list. Please try again.');
        }
    };

    const renderCurrentView = () => {
        try {
            switch (currentView) {
                case 'add-client':
                    return (
                        <AddClientScreen
                            onCancel={handleBackToClients}
                            onBackToClients={handleBackToClients}
                        />
                    );
                case 'list':
                default:
                    return (
                        <ClientList
                            onNewClient={handleShowAddClient}
                        />
                    );
            }
        } catch (error) {
            logger.error('Error rendering clients view:', error);
            showBoundary(error);
        }
    };

    return <div className="main">{renderCurrentView()}</div>;
};

const ClientsScreen: React.FC = () => {
    return (
        <ErrorBoundary 
            FallbackComponent={ClientsScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Clients screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <ClientsScreenContent />
        </ErrorBoundary>
    );
};

export default ClientsScreen;
'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Building2, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import './BanksScreen.scss';
import BankList from './BankList';
import AddBankScreen from './AddBank';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-bank';

interface BanksScreenErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const BanksScreenErrorFallback: React.FC<BanksScreenErrorFallbackProps> = ({ 
    error, 
    resetErrorBoundary 
}) => {
    return (
        <div className="banks-screen-error-boundary">
            <div className="error-boundary__content">
                <div className="error-boundary__icon">
                    <Building2 size={48} />
                </div>
                <h2 className="error-boundary__title">Banks Module Error</h2>
                <p className="error-boundary__message">
                    We encountered an issue with the banks module. This might be a temporary problem.
                </p>
                <div className="error-boundary__actions">
                    <button className="error-boundary__button" onClick={resetErrorBoundary}>
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                    <button 
                        className="error-boundary__button error-boundary__button--secondary"
                        onClick={() => window.location.href = '/'}
                    >
                        <Home size={16} />
                        Go to Dashboard
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="error-boundary__details">
                        <summary>Technical Details (Development)</summary>
                        <pre className="error-boundary__error-text">
                            {error.message}
                            {error.stack && '\n\nStack trace:\n' + error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

const BanksScreenContent: React.FC = () => {
    const { showBoundary } = useErrorBoundary();
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddBank = () => {
        try {
            logger.log('Switching to add bank view');
            setCurrentView('add-bank');
        } catch (error) {
            logger.error('Error navigating to add bank view:', error);
            toast.error('Failed to open add bank form');
            showBoundary(error);
        }
    };

    const handleBackToBanks = () => {
        try {
            logger.log('Switching back to bank list view');
            setCurrentView('list');
        } catch (error) {
            logger.error('Error navigating back to banks list:', error);
            toast.error('Failed to return to banks list');
            showBoundary(error);
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
            logger.error('Error rendering current view:', error);
            showBoundary(error);
            return null;
        }
    };

    try {
        return renderCurrentView();
    } catch (error) {
        logger.error('Error rendering banks screen:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
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
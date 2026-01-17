'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import CardList from './CardList';
import AddCardScreen from './AddCard';
import './CardsScreen.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add';

// Error Fallback Component for Cards Screen
const CardsScreenErrorFallback: React.FC<{
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
                                We encountered an unexpected error in the cards section. 
                                Don&apos;t worry, your card data is safe. You can try again or go back to the main dashboard.
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
                                    icon={<CreditCard size={16} />}
                                    onClick={() => window.location.href = '/cards'}
                                    className="main__icon-button"
                                >
                                    Reload Cards
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

const CardsScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { showBoundary } = useErrorBoundary();

    const handleShowAddCard = () => {
        try {
            setCurrentView('add');
            logger.debug('Navigated to add card view');
        } catch (error) {
            logger.error('Error navigating to add card view:', error);
            toast.error('Failed to open add card form. Please try again.');
        }
    };

    const handleBackToCards = () => {
        try {
            setCurrentView('list');
            logger.debug('Navigated back to cards list');
        } catch (error) {
            logger.error('Error navigating back to cards list:', error);
            toast.error('Failed to return to cards list. Please try again.');
        }
    };

    const handleCancelAddCard = () => {
        try {
            setCurrentView('list');
            logger.debug('Cancelled add card and returned to list');
        } catch (error) {
            logger.error('Error cancelling add card:', error);
            toast.error('Failed to cancel add card. Please try again.');
        }
    };

    const renderCurrentView = () => {
        try {
            return (
                <div className="main">
                    {currentView === 'list' && (
                        <CardList onNewCard={handleShowAddCard} />
                    )}
                    {currentView === 'add' && (
                        <AddCardScreen 
                            onCancel={handleCancelAddCard}
                            onBackToCards={handleBackToCards}
                        />
                    )}
                </div>
            );
        } catch (error) {
            logger.error('Error rendering cards view:', error);
            showBoundary(error);
        }
    };

    return <div className='main'>{renderCurrentView()}</div>;
};

const CardsScreen: React.FC = () => {
    return (
        <ErrorBoundary 
            FallbackComponent={CardsScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Cards screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <CardsScreenContent />
        </ErrorBoundary>
    );
};

export default CardsScreen;
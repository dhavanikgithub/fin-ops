'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { CreditCard, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import CardList from './CardList';
import AddCardScreen from './AddCard';
import './CardsScreen.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add';

interface CardsScreenErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const CardsScreenErrorFallback: React.FC<CardsScreenErrorFallbackProps> = ({ 
    error, 
    resetErrorBoundary 
}) => {
    return (
        <div className="cards-screen-error-boundary">
            <div className="error-boundary__content">
                <div className="error-boundary__icon">
                    <CreditCard size={48} />
                </div>
                <h2 className="error-boundary__title">Cards Module Error</h2>
                <p className="error-boundary__message">
                    We encountered an issue with the cards module. This might be a temporary problem.
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

const CardsScreenContent: React.FC = () => {
    const { showBoundary } = useErrorBoundary();
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddCard = () => {
        try {
            setCurrentView('add');
            logger.debug('Navigated to add card view');
        } catch (error) {
            logger.error('Error navigating to add card view:', error);
            toast.error('Failed to open add card form');
            showBoundary(error);
        }
    };

    const handleBackToCards = () => {
        try {
            setCurrentView('list');
            logger.debug('Navigated back to cards list');
        } catch (error) {
            logger.error('Error navigating back to cards list:', error);
            toast.error('Failed to return to cards list');
            showBoundary(error);
        }
    };

    const handleCancelAddCard = () => {
        try {
            setCurrentView('list');
            logger.debug('Cancelled add card and returned to list');
        } catch (error) {
            logger.error('Error cancelling add card:', error);
            toast.error('Failed to cancel add card');
            showBoundary(error);
        }
    };

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
        logger.error('Error rendering cards screen:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
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
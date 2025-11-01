'use client'
import React, { useState } from 'react';
import CardList from './CardList';
import AddCardScreen from './AddCard';
import './CardsScreen.scss';

type ViewState = 'list' | 'add';

const CardsScreen: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddCard = () => {
        setCurrentView('add');
    };

    const handleBackToCards = () => {
        setCurrentView('list');
    };

    const handleCancelAddCard = () => {
        setCurrentView('list');
    };

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
};

export default CardsScreen;
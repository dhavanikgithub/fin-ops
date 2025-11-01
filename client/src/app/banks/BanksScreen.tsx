'use client'
import React, { useState } from 'react';
import './BanksScreen.scss';
import BankList from './BankList';
import AddBankScreen from './AddBank';
import logger from '@/utils/logger';

type ViewState = 'list' | 'add-bank';

const BanksScreen: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddBank = () => {
        logger.log('Switching to add bank view');
        setCurrentView('add-bank');
    };

    const handleBackToBanks = () => {
        logger.log('Switching back to bank list view');
        setCurrentView('list');
    };

    const renderCurrentView = () => {
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
    };

    return renderCurrentView();
};

export default BanksScreen;
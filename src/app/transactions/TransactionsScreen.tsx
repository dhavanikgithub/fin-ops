'use client';
import React, { useState } from 'react';
import TransactionList from './TransactionList';
import AddDepositScreen from './AddDeposit';
import AddWithdrawScreen from './AddWithdraw';
import './TransactionsScreen.scss';

type ViewState = 'list' | 'deposit' | 'withdraw';

const TransactionScreen: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowDeposit = () => {
        setCurrentView('deposit');
    };

    const handleShowWithdraw = () => {
        setCurrentView('withdraw');
    };

    const handleBackToTransactions = () => {
        setCurrentView('list');
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'deposit':
                return (
                    <AddDepositScreen 
                        onCancel={handleBackToTransactions}
                        onBackToTransactions={handleBackToTransactions}
                    />
                );
            case 'withdraw':
                return (
                    <AddWithdrawScreen 
                        onCancel={handleBackToTransactions}
                        onBackToTransactions={handleBackToTransactions}
                    />
                );
            case 'list':
            default:
                return (
                    <TransactionList 
                        onDeposit={handleShowDeposit}
                        onWithdraw={handleShowWithdraw}
                    />
                );
        }
    };

    return (
        <div className="main">
            {renderCurrentView()}
        </div>
    );
};

export default TransactionScreen;
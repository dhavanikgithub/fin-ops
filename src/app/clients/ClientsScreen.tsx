'use client'
import React, { useState } from 'react';
import './ClientsScreen.scss';
import ClientList from './ClientList';
import AddClientScreen from './AddClient';

type ViewState = 'list' | 'add-client';

const ClientsScreen: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');

    const handleShowAddClient = () => {
        console.log('Switching to add client view');
        setCurrentView('add-client');
    };

    const handleBackToClients = () => {
        console.log('Switching back to client list view');
        setCurrentView('list');
    };

    const renderCurrentView = () => {
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
    };

    return renderCurrentView();
};

export default ClientsScreen;
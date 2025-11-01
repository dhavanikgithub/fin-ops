'use client';
import React from 'react';
import { useHealthCheck } from '../context/HealthCheckContext';
import ServerUnavailableModal from './ServerUnavailableModal';

const GlobalHealthCheckModal: React.FC = () => {
    const { 
        isServerHealthy,
        isModalOpen, 
        lastError, 
        countdown, 
        retryManually, 
        dismissModal,
        isRetrying
    } = useHealthCheck();

    return (
        <ServerUnavailableModal
            isOpen={isModalOpen}
            onClose={dismissModal}
            onTryAgain={retryManually}
            onDismiss={dismissModal}
            countdown={countdown}
            lastError={lastError}
            isServerHealthy={isServerHealthy}
            isRetrying={isRetrying}
        />
    );
};

export default GlobalHealthCheckModal;
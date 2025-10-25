'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import healthCheckService, { HealthCheckResult } from '../services/healthCheckService';
import useStateWithRef from '@/hooks/useStateWithRef';

interface HealthCheckContextType {
    isServerHealthy: boolean;
    isModalOpen: boolean;
    lastError: string | null;
    countdown: number;
    retryManually: () => Promise<void>;
    dismissModal: () => void;
    isRetrying: boolean;
}

const HealthCheckContext = createContext<HealthCheckContextType | undefined>(undefined);

interface HealthCheckProviderProps {
    children: ReactNode;
}

export const HealthCheckProvider: React.FC<HealthCheckProviderProps> = ({ children }) => {
    const [isServerHealthy, setIsServerHealthy] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [countdown, setCountdown, countdownRef] = useStateWithRef<number>(0);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const [isRetrying, setIsRetrying] = useState<boolean>(false);

    // Start countdown when server is down
    const startCountdown = useCallback(() => {
        console.log('Starting countdown for health check retry');
        
        // Clear any existing countdown first
        setCountdownInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            return null;
        });

        setCountdown(20); // Start at 20 seconds
        
        const interval = setInterval(() => {
            const currentCount = countdownRef.current;
            if (currentCount <= 1) {
                clearInterval(interval);
                setCountdownInterval(null);
                setCountdown(0);
            } else {
                setCountdown(currentCount - 1);
            }
        }, 1000);

        setCountdownInterval(interval);
    }, [setCountdown, countdownRef]);

    // Stop countdown
    const stopCountdown = useCallback(() => {
        console.log('Stopping countdown');
        setCountdownInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            return null;
        });
        setCountdown(0);
    }, [setCountdown]);

    // Handle health check results
    const handleHealthCheckResult = useCallback((result: HealthCheckResult) => {
        setIsServerHealthy(prevHealthy => {
            const wasHealthy = prevHealthy;
            setLastError(result.error || null);

            if (!result.isHealthy) {
                // Server is down
                if (wasHealthy) {
                    // First time server went down, show modal and start countdown
                    setIsModalOpen(true);
                    startCountdown();
                } else {
                    setIsModalOpen(prevModalOpen => {
                        if (!prevModalOpen) {
                            // Server was already down but modal was dismissed, start countdown again
                            setIsModalOpen(true);
                            startCountdown();
                            return true;
                        }
                        return prevModalOpen;
                    });
                }
                // If server was already down and modal is open, countdown restart will be handled by useEffect
            } else {
                // Server is healthy
                setIsModalOpen(false);
                stopCountdown();
            }
            
            return result.isHealthy;
        });
    }, [startCountdown, stopCountdown]);

    // Manual retry function
    const retryManually = useCallback(async () => {
        try {
            setIsRetrying(true);
            console.log('Manual retry started');
            
            const result = await healthCheckService.manualHealthCheck();
            handleHealthCheckResult(result);

            // Don't manually start countdown here - let the useEffect handle it
            // This ensures consistent behavior for both manual and automatic retries
        } catch (error) {
            console.error('Manual health check failed:', error);
        } finally {
            setIsRetrying(false);
            startCountdown();
            console.log('Manual retry completed');
        }
    }, [handleHealthCheckResult]);

    // Dismiss modal (only when server is healthy)
    const dismissModal = useCallback(() => {
        setIsServerHealthy(prevHealthy => {
            if (prevHealthy) {
                setIsModalOpen(false);
                stopCountdown();
            }
            // If server is not healthy, do nothing (modal stays open)
            return prevHealthy;
        });
    }, [stopCountdown]);

    useEffect(() => {
        // Subscribe to health check results
        const unsubscribe = healthCheckService.subscribe(handleHealthCheckResult);
        
        // Subscribe to retry state changes
        const unsubscribeRetry = healthCheckService.subscribeToRetryState((retrying) => {
            setIsRetrying(retrying);
            console.log('Automatic retry state:', retrying ? 'started' : 'completed');
        });

        // Start monitoring
        healthCheckService.startMonitoring(5000, 20000); // 5s normal, 20s retry

        return () => {
            unsubscribe();
            unsubscribeRetry();
            healthCheckService.stopMonitoring();
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [handleHealthCheckResult]);

    // Restart countdown when it reaches zero and server is still down, or after retry completes
    useEffect(() => {
        if (!isServerHealthy && isModalOpen && !isRetrying) {
            if (countdown === 0) {
                // Countdown finished or retry just completed - restart immediately
                console.log('Countdown at 0 and not retrying, server still down - restarting countdown');
                startCountdown();
            }
        }
    }, [isServerHealthy, countdown, isModalOpen, isRetrying, startCountdown]);




    const contextValue: HealthCheckContextType = {
        isServerHealthy,
        isModalOpen,
        lastError,
        countdown,
        retryManually,
        dismissModal,
        isRetrying
    };

    return (
        <HealthCheckContext.Provider value={contextValue}>
            {children}
        </HealthCheckContext.Provider>
    );
};

export const useHealthCheck = (): HealthCheckContextType => {
    const context = useContext(HealthCheckContext);
    if (context === undefined) {
        throw new Error('useHealthCheck must be used within a HealthCheckProvider');
    }
    return context;
};
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import api from './api';
import logger from '@/utils/logger';

export interface HealthCheckResult {
    isHealthy: boolean;
    timestamp: number;
    error?: string;
    isRetrying?: boolean;
}

class HealthCheckService {
    private static instance: HealthCheckService;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private retryInterval: NodeJS.Timeout | null = null;
    private listeners: ((result: HealthCheckResult) => void)[] = [];
    private retryListeners: ((isRetrying: boolean) => void)[] = [];
    private lastHealthStatus: boolean = true;
    private isChecking: boolean = false;

    private constructor() { }

    public static getInstance(): HealthCheckService {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }

    /**
     * Perform a single health check
     */
    public async checkHealth(): Promise<HealthCheckResult> {
        if (this.isChecking) {
            return {
                isHealthy: this.lastHealthStatus,
                timestamp: Date.now()
            };
        }

        this.isChecking = true;

        try {
            // Try to hit a health endpoint first, if not available try a lightweight endpoint
            let response;
            response = await api.get(API_ENDPOINTS.HEALTH.HEALTH, {
                timeout: 5000 // 5 second timeout for health checks
            });

            const result: HealthCheckResult = {
                isHealthy: response.status >= 200 && response.status < 300,
                timestamp: Date.now()
            };

            this.lastHealthStatus = result.isHealthy;
            this.notifyListeners(result);
            this.isChecking = false;
            return result;

        } catch (error: any) {
            const result: HealthCheckResult = {
                isHealthy: false,
                timestamp: Date.now(),
                error: error.message || 'Server is unreachable'
            };

            this.lastHealthStatus = false;
            this.notifyListeners(result);
            this.isChecking = false;
            return result;
        }
    }

    /**
     * Start continuous health monitoring
     * @param normalInterval - Interval in ms when server is healthy (default: 5000ms)
     * @param retryInterval - Interval in ms when server is down (default: 20000ms)
     */
    public startMonitoring(normalInterval: number = 5000, retryInterval: number = 20000): void {
        this.stopMonitoring();

        const monitor = async () => {
            // For automatic retries when server is down, show retrying state
            const wasDown = !this.lastHealthStatus;
            if (wasDown) {
                this.notifyRetryListeners(true);
            }
            
            const result = await this.checkHealth();
            
            // Clear retrying state after check completes
            if (wasDown) {
                this.notifyRetryListeners(false);
            }

            if (result.isHealthy) {
                // Server is healthy, check every 5 seconds
                this.healthCheckInterval = setTimeout(monitor, normalInterval);
            } else {
                // Server is down, check every 20 seconds
                this.retryInterval = setTimeout(monitor, retryInterval);
            }
        };

        // Start immediately
        monitor();
    }

    /**
     * Stop all health monitoring
     */
    public stopMonitoring(): void {
        if (this.healthCheckInterval) {
            clearTimeout(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        if (this.retryInterval) {
            clearTimeout(this.retryInterval);
            this.retryInterval = null;
        }
    }

    /**
     * Subscribe to health check results
     */
    public subscribe(listener: (result: HealthCheckResult) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Subscribe to retry state changes
     */
    public subscribeToRetryState(listener: (isRetrying: boolean) => void): () => void {
        this.retryListeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.retryListeners.indexOf(listener);
            if (index > -1) {
                this.retryListeners.splice(index, 1);
            }
        };
    }

    /**
     * Get the last known health status
     */
    public getLastHealthStatus(): boolean {
        return this.lastHealthStatus;
    }

    /**
     * Manually trigger a health check (for retry button)
     */
    public async manualHealthCheck(): Promise<HealthCheckResult> {
        return await this.checkHealth();
    }

    private notifyListeners(result: HealthCheckResult): void {
        this.listeners.forEach(listener => {
            try {
                listener(result);
            } catch (error) {
                logger.error('Error in health check listener:', error);
            }
        });
    }

    private notifyRetryListeners(isRetrying: boolean): void {
        this.retryListeners.forEach(listener => {
            try {
                listener(isRetrying);
            } catch (error) {
                logger.error('Error in retry state listener:', error);
            }
        });
    }
}

export default HealthCheckService.getInstance();
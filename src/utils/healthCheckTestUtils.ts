/**
 * Health Check System Testing Guide
 * 
 * This file provides instructions for testing the health check system
 * and includes a test component for development purposes.
 */

// To test the health check system:
// 1. Start your application normally
// 2. The health check will automatically start monitoring every 5 seconds
// 3. To simulate server downtime, either:
//    a) Stop your backend server
//    b) Change the API_BASE_URL to an invalid URL in your environment
//    c) Use the test function below to force a server down state

import healthCheckService from '../services/healthCheckService';

/**
 * Test function to manually trigger health check
 * Use this in browser console: window.testHealthCheck()
 */
export const testHealthCheck = async () => {
    console.log('Testing health check...');
    const result = await healthCheckService.checkHealth();
    console.log('Health check result:', result);
    return result;
};

/**
 * Test function to force server down state (for testing countdown)
 * Use this in browser console: window.forceServerDown()
 */
export const forceServerDown = () => {
    console.log('Forcing server down state for testing countdown...');
    
    // Import the health check service dynamically to avoid circular dependencies
    import('../services/healthCheckService').then(({ default: healthCheckService }) => {
        // Create a mock failed health check result
        const mockFailedResult = {
            isHealthy: false,
            timestamp: Date.now(),
            error: 'Simulated server downtime for testing countdown'
        };
        
        // Access the private method to trigger listeners
        // This is for testing purposes only
        const service = healthCheckService as any;
        service.lastHealthStatus = false;
        service.notifyListeners(mockFailedResult);
    });
};

/**
 * Test function to force server back online
 * Use this in browser console: window.forceServerOnline()
 */
export const forceServerOnline = () => {
    console.log('Forcing server online state...');
    
    import('../services/healthCheckService').then(({ default: healthCheckService }) => {
        const mockSuccessResult = {
            isHealthy: true,
            timestamp: Date.now()
        };
        
        const service = healthCheckService as any;
        service.lastHealthStatus = true;
        service.notifyListeners(mockSuccessResult);
    });
};

// Make test functions available globally for browser console testing
if (typeof window !== 'undefined') {
    (window as any).testHealthCheck = testHealthCheck;
    (window as any).forceServerDown = forceServerDown;
    (window as any).forceServerOnline = forceServerOnline;
}

export default {
    testHealthCheck,
    forceServerDown,
    forceServerOnline
};
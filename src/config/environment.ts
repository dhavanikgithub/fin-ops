/**
 * Environment Constants
 * 
 * Centralized constants for environment-related fallback values
 * to maintain consistency across the application.
 */

// Default environment value used as fallback when ENVIRONMENT is not set
export const DEFAULT_ENVIRONMENT = 'staging' as const;

// Environment types for type safety
export type Environment = 'staging' | 'production';

// Helper function to get current environment with proper typing
export const getCurrentEnvironment = (): Environment => {
    const env = process.env.ENVIRONMENT || DEFAULT_ENVIRONMENT;
    return env as Environment;
};

// Environment check helpers
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

export default {
    DEFAULT_ENVIRONMENT,
    getCurrentEnvironment,
    isStaging,
    isProduction
};
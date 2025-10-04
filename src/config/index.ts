// Export ONLY package.json-based configuration (single source of truth)
export { default as PACKAGE_CONFIG } from './packageInfo';
export {
    default as versionManager,
    VersionManager,
    getVersion,
    getAppInfo,
    getApiVersionInfo
} from './versionManager';

// Export API version utilities
export {
    getApiVersions,
    getApiVersionsConfig,
    hasApiVersion,
    getLatestApiVersion,
    getAvailableApiVersions
} from './apiVersionScanner';

// Export environment constants
export {
    DEFAULT_ENVIRONMENT,
    getCurrentEnvironment,
    isStaging,
    isProduction
} from './environment';

// Re-export the most commonly used version getters - ONLY from package.json
import versionManagerInstance from './versionManager';
export const getCurrentVersion = () => versionManagerInstance.version;
export const getCurrentAppInfo = () => versionManagerInstance.appInfo;
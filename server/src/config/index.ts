// Export ONLY package.json-based configuration (single source of truth)
export { default as PACKAGE_CONFIG } from './packageInfo.js';
export {
    default as versionManager,
    VersionManager,
    getVersion,
    getAppInfo,
    getApiVersionInfo
} from './versionManager.js';

// Export API version utilities
export {
    getApiVersions,
    getApiVersionsConfig,
    hasApiVersion,
    getLatestApiVersion,
    getAvailableApiVersions
} from './apiVersionScanner.js';

// Export environment constants
export {
    DEFAULT_ENVIRONMENT,
    getCurrentEnvironment,
    isStaging,
    isProduction
} from './environment.js';

// Re-export the most commonly used version getters - ONLY from package.json
import versionManagerInstance from './versionManager.js';
export const getCurrentVersion = () => versionManagerInstance.version;
export const getCurrentAppInfo = () => versionManagerInstance.appInfo;
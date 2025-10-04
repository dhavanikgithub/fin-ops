import PACKAGE_CONFIG from './packageInfo';

/**
 * Version Management Utility
 * Provides centralized version control for the entire application
 * ONLY USES PACKAGE.JSON as source of truth for version, name, description
 */
export class VersionManager {
    private static instance: VersionManager;

    private constructor() { }

    static getInstance(): VersionManager {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }

    // Get current version - ONLY from package.json
    get version(): string {
        return PACKAGE_CONFIG.VERSION;
    }

    // Get application name - ONLY from package.json
    get appName(): string {
        return PACKAGE_CONFIG.NAME;
    }

    // Get application description - ONLY from package.json
    get appDescription(): string {
        return PACKAGE_CONFIG.DESCRIPTION;
    }

    // Get full application info - ONLY from package.json
    get appInfo() {
        return {
            name: this.appName,
            version: this.version,
            description: this.appDescription,
            author: PACKAGE_CONFIG.AUTHOR,
            environment: PACKAGE_CONFIG.ENVIRONMENT,
            apiVersions: PACKAGE_CONFIG.API_VERSIONS,
            buildInfo: {
                buildDate: PACKAGE_CONFIG.BUILD_DATE,
                nodeVersion: PACKAGE_CONFIG.NODE_VERSION,
                source: 'package.json'
            }
        };
    }

    // Get version for specific API version
    getApiVersionInfo(apiVersion: string) {
        return {
            ...this.appInfo,
            currentApiVersion: apiVersion,
            fullVersion: `${this.version}-${apiVersion}`
        };
    }

    // Check if version is compatible
    isVersionCompatible(requiredVersion: string): boolean {
        const current = this.version.split('.').map(Number).filter(n => !isNaN(n));
        const required = requiredVersion.split('.').map(Number).filter(n => !isNaN(n));

        // Ensure we have at least 3 parts for each version
        while (current.length < 3) current.push(0);
        while (required.length < 3) required.push(0);

        // Major version must match
        if (current[0] !== required[0]) return false;

        // Minor version must be >= required
        if (current[1]! < required[1]!) return false;

        // Patch version must be >= required if minor versions are equal
        if (current[1] === required[1] && current[2]! < required[2]!) return false;

        return true;
    }

    // Get semantic version parts
    get versionParts() {
        const parts = this.version.split('.').map(Number).filter(n => !isNaN(n));
        const [major = 1, minor = 0, patch = 0] = parts;
        return { major, minor, patch };
    }

    // Increment version (for development/testing)
    incrementVersion(type: 'major' | 'minor' | 'patch' = 'patch') {
        const { major, minor, patch } = this.versionParts;

        switch (type) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
            default:
                return this.version;
        }
    }
}

// Export singleton instance
export const versionManager = VersionManager.getInstance();

// Export convenience functions
export const getVersion = () => versionManager.version;
export const getAppInfo = () => versionManager.appInfo;
export const getApiVersionInfo = (apiVersion: string) => versionManager.getApiVersionInfo(apiVersion);

export default versionManager;
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js'
// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Dynamically discovers API version folders in the src directory
 * Looks for folders that match the pattern 'v{number}' (e.g., v1, v2, v3, etc.)
 * 
 * @returns Object with API versions and their folder names
 */
export const getApiVersions = () => {
    try {
        const srcPath = join(__dirname, '../');
        const entries = readdirSync(srcPath);
        
        // Filter for directories that match version pattern (v1, v2, v3, etc.)
        const versionFolders = entries
            .filter(entry => {
                const fullPath = join(srcPath, entry);
                // Check if it's a directory and matches version pattern
                return statSync(fullPath).isDirectory() && /^v\d+$/.test(entry);
            })
            .sort((a, b) => {
                // Sort by version number (v1, v2, v3, etc.)
                const aNum = parseInt(a.substring(1));
                const bNum = parseInt(b.substring(1));
                return aNum - bNum;
            });

        // Create API_VERSIONS object dynamically
        const apiVersions: Record<string, string> = {};
        
        versionFolders.forEach(folder => {
            // Convert v1 -> V1, v2 -> V2, etc.
            const key = folder.toUpperCase();
            apiVersions[key] = folder;
        });

        return {
            versions: apiVersions,
            availableVersions: versionFolders,
            latestVersion: versionFolders[versionFolders.length - 1] || 'v1',
            totalVersions: versionFolders.length
        };
    } catch (error) {
        logger.warn('⚠️  Could not scan for API versions, using defaults:', error);
        // Fallback to default versions if scanning fails
        return {
            versions: { },
            availableVersions: [],
            latestVersion: '',
            totalVersions: 0
        };
    }
};

/**
 * Get API versions in a format suitable for configuration
 */
export const getApiVersionsConfig = () => {
    const { versions } = getApiVersions();
    return versions;
};

/**
 * Check if a specific API version exists
 */
export const hasApiVersion = (version: string): boolean => {
    const { availableVersions } = getApiVersions();
    return availableVersions.includes(version);
};

/**
 * Get the latest API version
 */
export const getLatestApiVersion = (): string => {
    const { latestVersion } = getApiVersions();
    return latestVersion;
};

/**
 * Get all available API versions as an array
 */
export const getAvailableApiVersions = (): string[] => {
    const { availableVersions } = getApiVersions();
    return availableVersions;
};

export default {
    getApiVersions,
    getApiVersionsConfig,
    hasApiVersion,
    getLatestApiVersion,
    getAvailableApiVersions
};
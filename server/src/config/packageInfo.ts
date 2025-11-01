import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getCurrentEnvironment } from './environment.js';
import { getApiVersionsConfig } from './apiVersionScanner.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json - SINGLE SOURCE OF TRUTH for version, name, description
let packageInfo: any = {};

const packagePath = join(__dirname, '../../package.json');
const packageContent = readFileSync(packagePath, 'utf-8');
packageInfo = JSON.parse(packageContent);

// Package-based configuration - ONLY SOURCE for version, name, description
export const PACKAGE_CONFIG = {
    // Get ONLY from package.json (single source of truth)
    VERSION: packageInfo.version,
    NAME: packageInfo.name,
    DESCRIPTION: packageInfo.description,
    AUTHOR: packageInfo.author,

    // API Versions - Dynamically discovered from folder structure
    get API_VERSIONS() {
        return getApiVersionsConfig();
    },

    // Build Information
    BUILD_DATE: new Date().toISOString(),
    NODE_VERSION: process.version,

    // Environment
    get ENVIRONMENT() {
        return getCurrentEnvironment();
    },

    // Full application info
    get APP_INFO() {
        return {
            name: this.NAME,
            version: this.VERSION,
            description: this.DESCRIPTION,
            author: this.AUTHOR,
            environment: this.ENVIRONMENT,
            apiVersions: this.API_VERSIONS,
            buildInfo: {
                buildDate: this.BUILD_DATE,
                nodeVersion: this.NODE_VERSION
            }
        };
    }
} as const;

export default PACKAGE_CONFIG;
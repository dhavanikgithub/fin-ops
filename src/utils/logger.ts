import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

// Set global max listeners to prevent warnings
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 15;

// Indian timezone offset
const INDIAN_TIMEZONE = 'Asia/Kolkata';

// Log rotation configuration
interface LogRotationConfig {
    maxSize: string;
    maxFiles: string;
    datePattern: string;
    zippedArchive: boolean;
    auditFile: string;
}

// Default rotation configuration
const DEFAULT_ROTATION_CONFIG: LogRotationConfig = {
    maxSize: '20m',          // Maximum size per log file
    maxFiles: '60d',         // Keep logs for 60 days
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,     // Compress old logs
    auditFile: 'audit.json' // Audit file to track rotated logs
};

// Logger configuration interface
interface LoggerConfig {
    moduleName: string;
    rotation?: Partial<LogRotationConfig>;
    logLevel?: string;
    enableConsole?: boolean;
}

// Path normalization function
const normalizePathFrom = (absolutePath: string): string => {
    const projectRoot = process.cwd();
    const relativePath = path.relative(projectRoot, absolutePath);
    return relativePath;
};

// Get current date in Indian timezone
const getIndianDate = (): string => {
    const now = new Date();
    const indianTime = new Date(now.toLocaleString("en-US", { timeZone: INDIAN_TIMEZONE }));

    const year = indianTime.getFullYear();
    const month = String(indianTime.getMonth() + 1).padStart(2, '0');
    const day = String(indianTime.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
};

// Get current timestamp in Indian timezone with +0530 format
const getIndianTimestamp = (): string => {
    const now = new Date();
    const indianTime = new Date(now.toLocaleString("en-US", { timeZone: INDIAN_TIMEZONE }));

    const year = indianTime.getFullYear();
    const month = String(indianTime.getMonth() + 1).padStart(2, '0');
    const day = String(indianTime.getDate()).padStart(2, '0');
    const hours = String(indianTime.getHours()).padStart(2, '0');
    const minutes = String(indianTime.getMinutes()).padStart(2, '0');
    const seconds = String(indianTime.getSeconds()).padStart(2, '0');

    return `[${day}-${month}-${year} ${hours}:${minutes}:${seconds} +0530]`;
};

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Clean up old log directories beyond retention period
const cleanupOldLogs = (baseLogPath: string, retentionDays: number = 14): void => {
    try {
        if (!fs.existsSync(baseLogPath)) return;

        const now = new Date();
        const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));

        const entries = fs.readdirSync(baseLogPath, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const dirName = entry.name;
                // Check if directory name matches date pattern (DD-MM-YYYY)
                const dateMatch = dirName.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                
                if (dateMatch) {
                    const [, day, month, year] = dateMatch;
                    if (day && month && year) {
                        const dirDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        
                        if (dirDate < cutoffDate) {
                            const dirPath = path.join(baseLogPath, dirName);
                            console.log(`🗑️  Removing old log directory: ${dirPath}`);
                            fs.rmSync(dirPath, { recursive: true, force: true });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Error cleaning up old logs:', error);
    }
};

// Custom format for logging with Indian timezone
const customFormat = format.printf((info: any) => {
    const { level, message, timestamp, stack, moduleName, includeModule = true } = info;
    // Extracting file path and line number from the stack trace
    const match = stack && stack.split('\n')[3]?.match(/at (.*) \\((.*?):(\\d+):(\\d+)\\)/);
    const filePath = match ? match[2] : 'unknown';
    const normalizePath = normalizePathFrom(filePath);
    const lineNumber = match ? match[3] : 'unknown';
    const module = moduleName || 'general';

    // Include module name only if specified
    const moduleTag = includeModule ? `[${module}] ` : '';

    return `${timestamp} - [${level.toUpperCase()}] ${moduleTag}[${normalizePath}:${lineNumber}] - ${message}`;
});

// Custom format for module-specific logs (without module name)
const moduleFormat = format.printf((info: any) => {
    const { level, message, timestamp, stack } = info;
    const match = stack && stack.split('\n')[3]?.match(/at (.*) \\((.*?):(\\d+):(\\d+)\\)/);
    const filePath = match ? match[2] : 'unknown';
    const normalizePath = normalizePathFrom(filePath);
    const lineNumber = match ? match[3] : 'unknown';

    return `${timestamp} - [${level.toUpperCase()}] - [${normalizePath}:${lineNumber}] - ${message}`;
});

// Custom format for console logs (with module name and colored)
const consoleFormat = format.printf((info: any) => {
    const { level, message, timestamp, stack, moduleName } = info;
    const match = stack && stack.split('\n')[3]?.match(/at (.*) \\((.*?):(\\d+):(\\d+)\\)/);
    const filePath = match ? match[2] : 'unknown';
    const normalizePath = normalizePathFrom(filePath);
    const lineNumber = match ? match[3] : 'unknown';

    return `${timestamp} - [${level}] [${normalizePath}:${lineNumber}] - ${message}`;
});

// Logger factory to create module-specific loggers
class ModuleLogger {
    private moduleName: string;
    private currentDate: string;
    private logger: winston.Logger;
    private rotationConfig: LogRotationConfig;
    private logLevel: string;
    private enableConsole: boolean;

    constructor(config: LoggerConfig) {
        this.moduleName = config.moduleName;
        this.currentDate = getIndianDate();
        this.rotationConfig = { ...DEFAULT_ROTATION_CONFIG, ...config.rotation };
        this.logLevel = config.logLevel || 'debug';
        this.enableConsole = config.enableConsole !== false;
        this.logger = this.createLogger();
        
        // Run cleanup on initialization
        this.cleanupOldLogs();
    }

    private createLogger(): winston.Logger {
        const today = getIndianDate();
        const moduleLogPath = path.join(
            process.cwd(),
            'logs',
            today,
            this.moduleName
        );

        // Ensure directory exists
        ensureDirectoryExists(moduleLogPath);

        const transportsList: winston.transport[] = [];

        // Console transport
        if (this.enableConsole) {
            transportsList.push(
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.timestamp({
                            format: () => getIndianTimestamp()
                        }),
                        format.errors({ stack: true }),
                        consoleFormat
                    ),
                    level: this.logLevel
                })
            );
        }

        // Daily rotate file transports for different log levels
        const logLevels = ['error', 'warn', 'info', 'debug'];
        
        for (const logLevel of logLevels) {
            transportsList.push(
                new (winston.transports as any).DailyRotateFile({
                    filename: path.join(moduleLogPath, `${logLevel}_logs-%DATE%.log`),
                    datePattern: this.rotationConfig.datePattern,
                    zippedArchive: this.rotationConfig.zippedArchive,
                    maxSize: this.rotationConfig.maxSize,
                    maxFiles: this.rotationConfig.maxFiles,
                    level: logLevel,
                    auditFile: path.join(moduleLogPath, `${logLevel}-${this.rotationConfig.auditFile}`),
                    format: format.combine(
                        format.timestamp({
                            format: () => getIndianTimestamp()
                        }),
                        format.errors({ stack: true }),
                        moduleFormat
                    ),
                    // Event handlers for rotation
                    handleExceptions: logLevel === 'error',
                    handleRejections: logLevel === 'error'
                })
            );
        }

        const logger = winston.createLogger({
            level: this.logLevel,
            format: format.combine(
                format.timestamp({
                    format: () => getIndianTimestamp()
                }),
                format.errors({ stack: true }),
                customFormat
            ),
            defaultMeta: { moduleName: this.moduleName },
            transports: transportsList,
            exitOnError: false
        });

        // Add rotation event listeners
        logger.on('rotate', (oldFilename: string, newFilename: string) => {
            console.log(`📄 Log rotated: ${oldFilename} -> ${newFilename}`);
        });

        logger.on('archive', (zipFilename: string) => {
            console.log(`🗜️  Log archived: ${zipFilename}`);
        });

        logger.on('logRemoved', (removedFilename: string) => {
            console.log(`🗑️  Old log removed: ${removedFilename}`);
        });

        return logger;
    }

    // Check if we need to create a new logger for today
    private checkAndRefreshLogger(): void {
        const today = getIndianDate();
        if (this.currentDate !== today) {
            this.currentDate = today;
            this.logger.close();
            this.logger = this.createLogger();
            this.cleanupOldLogs();
        }
    }

    // Clean up old log directories
    private cleanupOldLogs(): void {
        const baseLogPath = path.join(process.cwd(), 'logs');
        const retentionDays = parseInt(this.rotationConfig.maxFiles.replace('d', '')) || 14;
        cleanupOldLogs(baseLogPath, retentionDays);
    }

    // Custom log method to include stack trace and handle multiple parameters
    private custom(level: string, ...args: any[]): void {
        // Check if we need to refresh logger for new day
        this.checkAndRefreshLogger();

        // Convert all arguments to strings and join them
        const message = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                if (arg instanceof Error) {
                    return `${arg.name}: ${arg.message}${arg.stack ? '\\n' + arg.stack : ''}`;
                }
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');

        const stack = new Error().stack;
        this.logger.log({
            level,
            message,
            stack,
            moduleName: this.moduleName
        });
    }

    // Convenience methods that accept multiple parameters
    public info(...args: any[]): void {
        this.custom('info', ...args);
    }

    public debug(...args: any[]): void {
        this.custom('debug', ...args);
    }

    public warn(...args: any[]): void {
        this.custom('warn', ...args);
    }

    public error(...args: any[]): void {
        this.custom('error', ...args);
    }

    // Method to manually trigger log rotation
    public forceRotation(): void {
        console.log(`🔄 Forcing log rotation for module: ${this.moduleName}`);
        this.logger.close();
        this.logger = this.createLogger();
    }

    // Method to get log statistics
    public getLogStats(): { module: string; currentDate: string; logLevel: string; rotationConfig: LogRotationConfig } {
        return {
            module: this.moduleName,
            currentDate: this.currentDate,
            logLevel: this.logLevel,
            rotationConfig: this.rotationConfig
        };
    }

    // Method to update log level dynamically
    public setLogLevel(level: string): void {
        this.logLevel = level;
        this.logger.level = level;
        console.log(`📊 Log level updated to '${level}' for module: ${this.moduleName}`);
    }

    // Method to close logger gracefully
    public close(): void {
        this.logger.close();
    }
}

// Logger manager to handle multiple modules
class LoggerManager {
    private loggers: Map<string, ModuleLogger>;
    private globalRotationConfig: Partial<LogRotationConfig>;

    constructor(globalConfig?: Partial<LogRotationConfig>) {
        this.loggers = new Map();
        this.globalRotationConfig = globalConfig || {};
        
        // Set up daily cleanup schedule (runs at midnight)
        this.scheduleCleanup();
    }

    // Get or create a logger for a specific module
    public getLogger(moduleName: string = 'general', config?: Partial<LoggerConfig>): ModuleLogger {
        if (!this.loggers.has(moduleName)) {
            const loggerConfig: LoggerConfig = {
                moduleName,
                rotation: { ...this.globalRotationConfig, ...config?.rotation },
                ...(config?.logLevel && { logLevel: config.logLevel }),
                ...(config?.enableConsole !== undefined && { enableConsole: config.enableConsole })
            };
            this.loggers.set(moduleName, new ModuleLogger(loggerConfig));
        }
        return this.loggers.get(moduleName)!;
    }

    // Force rotation for all loggers
    public forceRotationAll(): void {
        console.log('🔄 Forcing rotation for all loggers');
        for (const logger of this.loggers.values()) {
            logger.forceRotation();
        }
    }

    // Get all active modules
    public getActiveModules(): string[] {
        return Array.from(this.loggers.keys());
    }

    // Get statistics for all loggers
    public getAllLoggerStats(): Array<{ module: string; currentDate: string; logLevel: string; rotationConfig: LogRotationConfig }> {
        return Array.from(this.loggers.values()).map(logger => logger.getLogStats());
    }

    // Update global rotation configuration
    public updateGlobalRotationConfig(config: Partial<LogRotationConfig>): void {
        this.globalRotationConfig = { ...this.globalRotationConfig, ...config };
        console.log('⚙️  Global rotation config updated:', this.globalRotationConfig);
    }

    // Schedule daily cleanup at midnight
    private scheduleCleanup(): void {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.runDailyCleanup();
            // Schedule for every 24 hours after first run
            setInterval(() => this.runDailyCleanup(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
        
        console.log(`🕒 Scheduled daily log cleanup in ${Math.round(msUntilMidnight / (1000 * 60))} minutes`);
    }

    // Run daily cleanup
    private runDailyCleanup(): void {
        console.log('🧹 Running daily log cleanup...');
        const baseLogPath = path.join(process.cwd(), 'logs');
        const retentionDays = parseInt(this.globalRotationConfig.maxFiles?.replace('d', '') || '14');
        cleanupOldLogs(baseLogPath, retentionDays);
        
        // Force rotation for all loggers to handle date change
        this.forceRotationAll();
    }

    // Gracefully close all loggers
    public closeAll(): void {
        console.log('🔐 Closing all loggers...');
        for (const logger of this.loggers.values()) {
            logger.close();
        }
        this.loggers.clear();
    }
}

// Create singleton instance with default global configuration
const loggerManager = new LoggerManager(DEFAULT_ROTATION_CONFIG);

// Initialize default logger
const logger = loggerManager.getLogger('server-logs');
logger.info('🚀 TypeScript Logger initialized with rotation and archival');

// Export the manager and convenience functions
export {
    LoggerManager,
    ModuleLogger,
    LoggerConfig,
    LogRotationConfig,
    loggerManager as LoggerManagerInstance,
    logger
};

export const getLogger = (moduleName?: string, config?: Partial<LoggerConfig>): ModuleLogger => 
    loggerManager.getLogger(moduleName, config);

export const forceRotationAll = (): void => loggerManager.forceRotationAll();

export const getActiveModules = (): string[] => loggerManager.getActiveModules();

export const getAllLoggerStats = () => loggerManager.getAllLoggerStats();

export const updateGlobalRotationConfig = (config: Partial<LogRotationConfig>): void => 
    loggerManager.updateGlobalRotationConfig(config);

export const closeAllLoggers = (): void => loggerManager.closeAll();

// Default export
export default {
    getLogger,
    forceRotationAll,
    getActiveModules,
    getAllLoggerStats,
    updateGlobalRotationConfig,
    closeAllLoggers,
    logger,
};
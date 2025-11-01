# TypeScript Logger with Rotation and Archival

A comprehensive TypeScript logging solution with automatic rotation, archival, and cleanup features built on Winston.

## 🌟 Features

- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Log Rotation**: Automatic daily rotation with size-based rotation
- **Archival**: Gzip compression of old log files
- **Auto Cleanup**: Automatic deletion of logs older than retention period
- **Module-based Logging**: Separate loggers for different modules
- **Multiple Log Levels**: Error, Warning, Info, Debug with separate files
- **Indian Timezone**: All logs in IST (Asia/Kolkata) timezone
- **File Path Tracking**: Shows normalized file paths and line numbers
- **Console + File Output**: Configurable console and file logging
- **Graceful Shutdown**: Proper cleanup on application exit

## 📦 Installation

```bash
npm install winston winston-daily-rotate-file
```

## 🚀 Quick Start

```typescript
import { getLogger } from './utils/logger';

// Get a logger for your module
const logger = getLogger('my-module');

// Log messages
logger.info('Application started');
logger.error('Something went wrong');
logger.warn('This is a warning');
logger.debug('Debug information');
```

## 📁 Log Directory Structure

```
logs/
├── 04-10-2025/              # Date-based folders (DD-MM-YYYY)
│   ├── server-logs/         # Module folders
│   │   ├── error_logs-2025-10-04.log
│   │   ├── warn_logs-2025-10-04.log
│   │   ├── info_logs-2025-10-04.log
│   │   ├── debug_logs-2025-10-04.log
│   │   ├── error_logs-2025-10-03.log.gz    # Archived logs
│   │   └── error-audit.json                # Rotation audit file
│   ├── api-logs/
│   └── database-logs/
└── 03-10-2025/              # Previous day logs (auto-deleted after retention)
```

## ⚙️ Configuration

### Default Configuration

```typescript
const DEFAULT_ROTATION_CONFIG = {
    maxSize: '20m',          // Maximum size per log file
    maxFiles: '14d',         // Keep logs for 14 days
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,     // Compress old logs
    auditFile: 'audit.json' // Audit file to track rotated logs
};
```

### Custom Configuration

```typescript
import { getLogger, updateGlobalRotationConfig } from './utils/logger';

// Update global rotation settings
updateGlobalRotationConfig({
    maxSize: '50m',
    maxFiles: '30d',
    zippedArchive: true
});

// Create logger with custom config
const logger = getLogger('my-module', {
    logLevel: 'info',
    enableConsole: true,
    rotation: {
        maxSize: '10m',
        maxFiles: '7d'
    }
});
```

## 🔧 Advanced Usage

### Multiple Module Loggers

```typescript
// API logger
const apiLogger = getLogger('api-logs');
apiLogger.info('API request received');

// Database logger
const dbLogger = getLogger('database-logs');
dbLogger.error('Database connection failed');

// Authentication logger  
const authLogger = getLogger('auth-logs');
authLogger.warn('Failed login attempt');
```

### Log Level Management

```typescript
const logger = getLogger('my-module');

// Change log level dynamically
logger.setLogLevel('error'); // Only log errors
logger.setLogLevel('debug'); // Log everything
```

### Manual Operations

```typescript
import { 
    forceRotationAll, 
    getAllLoggerStats, 
    getActiveModules,
    closeAllLoggers 
} from './utils/logger';

// Force rotation for all loggers
forceRotationAll();

// Get statistics for all loggers
const stats = getAllLoggerStats();
console.log(stats);

// Get list of active modules
const modules = getActiveModules();
console.log('Active modules:', modules);

// Graceful shutdown
process.on('SIGINT', () => {
    closeAllLoggers();
    process.exit(0);
});
```

## 📊 Log Format

### Console Output
```
[04-10-2025 15:30:45 +0530] - [INFO] [src/controllers/reportController.ts:25] - Report generated successfully
```

### File Output
```
[04-10-2025 15:30:45 +0530] - [INFO] - [src/controllers/reportController.ts:25] - Report generated successfully
```

## 🔄 Rotation Behavior

### When Rotation Occurs
1. **Size-based**: When log file exceeds `maxSize` (default: 20MB)
2. **Time-based**: Daily rotation at midnight (IST)
3. **Manual**: When `forceRotationAll()` is called

### Archival Process
1. Old log files are compressed with gzip
2. Files older than `maxFiles` period are deleted
3. Audit files track all rotation activities
4. Directory cleanup removes empty date folders

### Cleanup Schedule
- **Daily**: Automatic cleanup at midnight IST
- **Startup**: Cleanup runs when logger initializes
- **Manual**: Can be triggered programmatically

## 🚨 Error Handling

```typescript
const logger = getLogger('error-handling');

try {
    // Some operation
    throw new Error('Something went wrong');
} catch (error) {
    // Log error with stack trace
    logger.error('Operation failed:', error);
    
    // Log additional context
    logger.error('User ID:', userId, 'Action:', action);
}
```

## 📈 Monitoring and Statistics

```typescript
import { getAllLoggerStats } from './utils/logger';

// Get comprehensive statistics
const stats = getAllLoggerStats();
stats.forEach(stat => {
    console.log(`Module: ${stat.module}`);
    console.log(`Log Level: ${stat.logLevel}`);
    console.log(`Current Date: ${stat.currentDate}`);
    console.log(`Rotation Config:`, stat.rotationConfig);
});
```

## 🔧 Integration with Express.js

```typescript
import express from 'express';
import { getLogger } from './utils/logger';

const app = express();
const logger = getLogger('express-app');

// Middleware for request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Express error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
```

## 🎯 Best Practices

1. **Module-specific Loggers**: Create separate loggers for different parts of your application
2. **Appropriate Log Levels**: Use the right level for each message
3. **Structured Logging**: Include relevant context in your log messages
4. **Error Logging**: Always log errors with stack traces
5. **Performance**: Avoid logging in tight loops in production
6. **Cleanup**: Use graceful shutdown to close loggers properly

## 🔍 Troubleshooting

### Log Files Not Created
- Check write permissions on the logs directory
- Ensure the application has permission to create directories

### Large Log Files
- Reduce `maxSize` setting
- Increase rotation frequency
- Review log level settings

### Missing Logs
- Check if cleanup deleted old logs (adjust `maxFiles`)
- Verify log level configuration
- Check console for rotation/cleanup messages

## 🚀 Migration from JavaScript Logger

The TypeScript logger is backward compatible. Update your imports:

```typescript
// Old way (JavaScript)
const { getLogger } = require('./utils/logger');

// New way (TypeScript)
import { getLogger } from './utils/logger';
```

All existing functionality remains the same with added type safety and new rotation features.

## 📝 Environment Variables (Optional)

You can configure the logger using environment variables:

```env
LOG_LEVEL=debug
LOG_MAX_SIZE=50m
LOG_MAX_FILES=30d
LOG_ENABLE_CONSOLE=true
LOG_ENABLE_ARCHIVE=true
```

This TypeScript logger provides enterprise-grade logging with automatic maintenance, making it perfect for production applications that need reliable, organized log management.
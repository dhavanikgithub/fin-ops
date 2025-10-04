import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import version-wise routes
import v1Routes from './v1/routes/index';
import v2Routes from './v2/routes/index';

// Import controllers for non-versioned routes
import { getApiInfo } from './v1/controllers/healthController';

// Import error handling
import { errorHandler, notFoundHandler } from './common/errors/index';

// Import centralized version management
import { getCurrentVersion, getCurrentAppInfo } from './config/index';

// Import TypeScript logger
import { logger, closeAllLoggers } from './utils/logger';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');


// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Version-wise API Routes
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Root endpoint (using controller)
app.get('/', getApiInfo);

// 404 handler (must be after all routes) - use middleware instead of route
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
    
    // Close all loggers
    closeAllLoggers();
    
    // Exit process
    process.exit(0);
};

// Register signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
    const version = getCurrentVersion();
    const appInfo = getCurrentAppInfo();
    
    logger.info(`🚀 ${appInfo.name} v${version} running on port ${PORT}`);
    logger.info(`📋 Health check available at http://localhost:${PORT}/api/v1/health`);
    logger.info(`🌍 Environment: ${appInfo.environment}`);
    logger.info(`🔧 Build: ${appInfo.buildInfo.buildDate} (Node ${appInfo.buildInfo.nodeVersion})`);
});

export default app;
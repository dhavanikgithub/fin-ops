import { Request, Response, NextFunction } from 'express';
import { CustomError } from './CustomError';
import { isStaging } from "../../config/environment.js";
import { logger } from '../../utils/logger'
// Error handler middleware
export const errorHandler = (
    err: Error | CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let error: CustomError;

    // If it's already a CustomError, use it
    if (err instanceof CustomError) {
        error = err;
    } else {
        // Convert regular errors to CustomError
        error = new CustomError(
            err.message || 'Internal Server Error',
            500,
            'INTERNAL_SERVER_ERROR'
        );
    }

    // Set request context
    error.setContext(req.originalUrl, req.method);

    // Log error (you can enhance this with proper logging)
    logger.error(`[${error.timestamp}] ${error.method} ${error.path} - ${error.errorCode}: ${error.message}`);
    if (isStaging() && error.stack) {
        logger.error(error.stack);
    }

    // Send error response
    const errorResponse = error.toJSON();
    res.status(error.statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new CustomError(
        `Route ${req.originalUrl} not found`,
        404,
        'ROUTE_NOT_FOUND',
        {
            availableRoutes: [
                '/api/v1/health',
                '/api/v2/health'
            ]
        }
    );
    
    error.setContext(req.originalUrl, req.method);
    next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
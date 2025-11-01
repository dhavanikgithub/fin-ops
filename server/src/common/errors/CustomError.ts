import { isStaging } from "../../config/environment.js";

// Base error interface
export interface ICustomError {
    statusCode: number;
    message: string;
    errorCode: string;
    details?: any;
    timestamp: string;
    path?: string;
    method?: string;
    stack?: string;
}

// Error response structure
export interface ErrorResponse {
    success: false;
    error: {
        statusCode: number;
        message: string;
        errorCode: string;
        details?: any;
        timestamp: string;
        path?: string;
        method?: string;
        stack?: string;
    };
}

// Custom error class
export class CustomError extends Error implements ICustomError {
    public statusCode: number;
    public errorCode: string;
    public details?: any;
    public timestamp: string;
    public path?: string;
    public method?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode: string = 'INTERNAL_SERVER_ERROR',
        details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Convert error to response format
    toJSON(): ErrorResponse {
        const errorResponse: ErrorResponse = {
            success: false,
            error: {
                statusCode: this.statusCode,
                message: this.message,
                errorCode: this.errorCode,
                timestamp: this.timestamp
            }
        };

        // Add optional properties only if they exist
        if (this.details !== undefined) {
            errorResponse.error.details = this.details;
        }
        if (this.path !== undefined) {
            errorResponse.error.path = this.path;
        }
        if (this.method !== undefined) {
            errorResponse.error.method = this.method;
        }
        if (isStaging() && this.stack) {
            errorResponse.error.stack = this.stack;
        }

        return errorResponse;
    }

    // Set request context
    setContext(path: string, method: string): this {
        this.path = path;
        this.method = method;
        return this;
    }
}
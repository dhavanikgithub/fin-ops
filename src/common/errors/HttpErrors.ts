import { CustomError } from './CustomError.js';

// 400 - Bad Request
export class BadRequestError extends CustomError {
    constructor(message: string = 'Bad Request', details?: any) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

// 401 - Unauthorized
export class UnauthorizedError extends CustomError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

// 403 - Forbidden
export class ForbiddenError extends CustomError {
    constructor(message: string = 'Forbidden', details?: any) {
        super(message, 403, 'FORBIDDEN', details);
    }
}

// 404 - Not Found
export class NotFoundError extends CustomError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

// 409 - Conflict
export class ConflictError extends CustomError {
    constructor(message: string = 'Resource conflict', details?: any) {
        super(message, 409, 'CONFLICT', details);
    }
}

// 422 - Unprocessable Entity
export class ValidationError extends CustomError {
    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 422, 'VALIDATION_ERROR', details);
    }
}

// 429 - Too Many Requests
export class RateLimitError extends CustomError {
    constructor(message: string = 'Too many requests', details?: any) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    }
}

// 500 - Internal Server Error
export class InternalServerError extends CustomError {
    constructor(message: string = 'Internal server error', details?: any) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}

// 502 - Bad Gateway
export class BadGatewayError extends CustomError {
    constructor(message: string = 'Bad gateway', details?: any) {
        super(message, 502, 'BAD_GATEWAY', details);
    }
}

// 503 - Service Unavailable
export class ServiceUnavailableError extends CustomError {
    constructor(message: string = 'Service unavailable', details?: any) {
        super(message, 503, 'SERVICE_UNAVAILABLE', details);
    }
}

// Database related errors
export class DatabaseError extends CustomError {
    constructor(message: string = 'Database operation failed', details?: any) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

// Authentication related errors
export class AuthenticationError extends CustomError {
    constructor(message: string = 'Authentication failed', details?: any) {
        super(message, 401, 'AUTHENTICATION_FAILED', details);
    }
}

// Business logic errors
export class BusinessLogicError extends CustomError {
    constructor(message: string, errorCode: string = 'BUSINESS_LOGIC_ERROR', details?: any) {
        super(message, 400, errorCode, details);
    }
}

// External service errors
export class ExternalServiceError extends CustomError {
    constructor(message: string = 'External service error', details?: any) {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
    }
}

// PDF generation errors
export class PDFGenerationError extends CustomError {
    constructor(message: string = 'PDF generation failed', details?: any) {
        super(message, 500, 'PDF_GENERATION_ERROR', details);
    }
}
// Export base error classes
export * from './CustomError.js';
export * from './HttpErrors.js';
export * from './errorHandler.js';

// Re-export commonly used errors for convenience
export {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError,
    DatabaseError,
    AuthenticationError,
    BusinessLogicError,
    PDFGenerationError
} from './HttpErrors.js';

export {
    errorHandler,
    notFoundHandler,
    asyncHandler
} from './errorHandler.js';
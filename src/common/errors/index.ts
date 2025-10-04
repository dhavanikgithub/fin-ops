// Export base error classes
export * from './CustomError';
export * from './HttpErrors';
export * from './errorHandler';

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
} from './HttpErrors';

export {
    errorHandler,
    notFoundHandler,
    asyncHandler
} from './errorHandler';
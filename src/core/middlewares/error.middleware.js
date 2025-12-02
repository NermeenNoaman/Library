// src/core/middlewares/error.middleware.js
import { Prisma } from '@prisma/client';

export function errorMiddleware(err, req, res, next) {
    console.error('--- Global Error Handler ---');
    console.error(err.stack);

    let statusCode = err.status || 500;
    let message = err.message || 'An unexpected error occurred.';

    // Prisma Error Handling
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') { // Not found
            statusCode = 404;
            message = 'Resource not found in the database.';
        } else if (err.code === 'P2002') { // Unique constraint violation (e.g., ISBN)
            statusCode = 409; 
            const field = err.meta?.target.join(', ') || 'field';
            message = `A record with this ${field} already exists.`;
        } else if (err.code === 'P2003') { // Foreign key constraint violation (e.g., trying to delete Category with existing Books)
             statusCode = 400; 
             message = 'Foreign key constraint violation: Cannot complete action due to related records.';
        } else {
             message = `Database Error: ${err.code}`;
             statusCode = 500;
        }
    } 
    
    // Custom error handling
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'Internal Server Error';
    }

    res.status(statusCode).json({
        error: message,
    });
}
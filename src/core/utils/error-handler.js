
// Express distinguishes error handlers by having 4 selectors: (err, req, res, next)
const globalErrorHandler = (err, req, res, next) => {
// Displaying the error in the console for developers
    console.error(err);

// Determine the error status (Status Code)
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred.';

// Returns a unified response (JSON Response)
    return res.status(status).json({
        success: false,
        message: message,
         // Error details can only be added in development mode:
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = globalErrorHandler;
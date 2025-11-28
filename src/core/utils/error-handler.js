
const { ZodError } = require('zod');

const globalErrorHandler = (err, req, res, next) => {
    console.error(" Error Details:", JSON.stringify(err, null, 2));

    let status = err.status || 500;
    let message = err.message || 'An unexpected error occurred.';


    if (err instanceof ZodError) {
        status = 400; 
        const issues = err.errors || err.issues; 

        if (issues && issues.length > 0) {
            message = issues[0].message;
        } else {
            message = "Validation failed (Check console for details)";
        }
    }


    return res.status(status).json({
        success: false,
        message: message,
    });
};

module.exports = globalErrorHandler;
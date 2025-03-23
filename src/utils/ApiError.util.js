class ApiError extends Error {
    constructor(statusCode, message = "There is a problem (check ApiError.js)", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = statusCode;
        this.errors = errors;

        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);

    }
}

export { ApiError };
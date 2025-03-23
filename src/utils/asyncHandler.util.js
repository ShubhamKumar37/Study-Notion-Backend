const asyncHandler = (fn) => async (req, res, next) => {
    return await Promise.resolve((fn(req, res, next)).catch((error) => next(error)));
}

export { asyncHandler };
import logger from "./logger.js"

export const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        // log error to file
          logger.error({
            message: error.message,
            stack: error.stack,
            method: req.method,
            url: req.originalUrl,
        }, "Unhandled Error");

        res.status(error.statusCode || 500).json({
            success : false,
            message : error.message
        })
    }
}
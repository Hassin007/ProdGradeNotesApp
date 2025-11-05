import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl, body, query } = req;

    logger.info({
      method,
      url: originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      body,
      query,
    }, "Request processed");
  });

  next();
};

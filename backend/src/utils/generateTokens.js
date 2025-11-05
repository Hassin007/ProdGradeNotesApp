import { User } from "../models/user.model.js";
import logger from "./logger.js";

export const generateAccessAndRefereshTokens = async (userId) => {
  logger.info({ userId }, "Starting access and refresh token generation");

  try {
    const user = await User.findById(userId);

    if (!user) {
      logger.error({ userId }, "User not found while generating tokens");
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    logger.debug({ userId }, "Tokens generated successfully (before saving)");

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info({ userId }, "Access and refresh tokens saved successfully");

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error({ userId, error: error.message }, "Error generating tokens");
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};
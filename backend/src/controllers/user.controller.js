import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefereshTokens } from "../utils/generateTokens.js";
import { sendResetEmail } from "../utils/emailService.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import logger from "../utils/logger.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  logger.info({ email, username }, "New user registration attempt received");

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    logger.warn("Registration failed: one or more required fields are empty");
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    logger.warn(
      { email, username },
      "Registration failed: user with same email or username already exists"
    );
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.file?.path;
  let avatar;

  if (avatarLocalPath) {
    try {
      avatar = await uploadOnCloudinary(avatarLocalPath);
      logger.info({ email, username }, "Avatar uploaded to Cloudinary successfully");
    } catch (error) {
      logger.error({ error, email, username }, "Error uploading avatar to Cloudinary");
      throw new ApiError(500, "Error uploading avatar");
    }
  }

  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  logger.info({ userId: user._id, email, username }, "User record created in database");

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    logger.error({ userId: user._id }, "Failed to retrieve created user from database");
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  logger.info({ userId: user._id, email, username }, "User registered successfully");

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered Successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  logger.info(
    { email: email || null, username: username || null },
    "Login attempt received"
  );

  if (!username && !email) {
    logger.warn("Missing credentials: username or email not provided");
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    logger.warn(
      { email, username },
      "Login failed: user does not exist"
    );
    throw new ApiError(404, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    logger.warn(
      { userId: user._id, username: user.username },
      "Invalid user credentials"
    );
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  logger.info(
    { userId: user._id, username: user.username },
    "Tokens generated successfully"
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.info(
    { userId: user._id, username: user.username },
    "User logged in successfully"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    logger.warn("Unauthorized request: Missing refresh token");
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    logger.debug("Verifying incoming refresh token...");

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    logger.debug({ userId: decodedToken?._id }, "Refresh token decoded");

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      logger.warn({ userId: decodedToken?._id }, "User not found for refresh token");
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      logger.warn(
        { userId: user._id },
        "Refresh token mismatch or reused token detected"
      );
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    logger.info(
      { userId: user._id },
      "Access token successfully refreshed"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    logger.error(
      { error: error.message },
      "Failed to refresh access token"
    );
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;

  logger.debug({ userId }, "Initiating password change request");

  if (!newPassword) {
    logger.warn({ userId }, "New password field is empty");
    throw new ApiError(400, "New password field can't be empty");
  }

  if (oldPassword === newPassword) {
    logger.warn({ userId }, "Old and new passwords are identical");
    throw new ApiError(400, "New password must be different from old password");
  }

  const user = await User.findById(userId);

  if (!user) {
    logger.warn({ userId }, "User not found during password change");
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    logger.warn({ userId }, "Invalid old password provided");
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save();

  logger.info({ userId }, "Password changed successfully");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  logger.info({ userId: req.user?._id }, "Account update request received");

  if (!fullName || !email) {
    logger.warn({ userId: req.user?._id }, "Account update failed: missing required fields");
    throw new ApiError(400, "All fields are required");
  } 
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    logger.error({ userId: req.user?._id }, "User not found during account update");
    throw new ApiError(404, "User not found");
  }

  logger.info({ userId: req.user?._id }, "Account details updated successfully");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  logger.info({ email }, "Password reset request received");

  if (!email) {
    logger.warn("Password reset failed: email field is missing");
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    logger.warn(
      { email },
      "Password reset requested for non-existent or unregistered email"
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a reset link has been sent"
        )
      );
  }

  try {
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    logger.info(
      { userId: user._id, email },
      "Password reset token generated and saved successfully"
    );

    if (process.env.NODE_ENV === "production") {
      await sendResetEmail(email, resetToken);
      logger.info(
        { email },
        "Password reset email sent successfully (production environment)"
      );
    } else {
      logger.info(
        {
          email: user.email,
          resetToken,
          resetLink,
          expiry: new Date(user.resetPasswordExpiry).toLocaleString(),
        },
        "Password reset token generated (development mode — email not sent)"
      );
    }

    logger.info(
      { userId: user._id, email },
      "Password reset request completed successfully"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a reset link has been sent"
        )
      );
  } catch (error) {
    logger.error(
      { error, email },
      "Error occurred while processing password reset request"
    );
    throw new ApiError(500, "Error processing password reset request");
  }
});


const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  logger.info("Password reset request received");

  if (!token || !newPassword) {
    logger.warn("Password reset failed: missing token or new password");
    throw new ApiError(400, "Reset token and new password are required");
  }

  if (newPassword.length < 6) {
    logger.warn("Password reset failed: password too short");
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn(
        { token },
        "Password reset failed: invalid or expired reset token"
      );
      throw new ApiError(400, "Invalid or expired reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    logger.info(
      { userId: user._id, email: user.email },
      "Password reset successfully and token cleared from database"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      logger.warn(
        { errorMessage: error.message },
        "Password reset failed with handled ApiError"
      );
      throw error;
    }

    logger.error(
      { error, token },
      "Unexpected error occurred while resetting password"
    );
    throw new ApiError(500, "Error resetting password");
  }
});


const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  logger.info("Password reset token validation request received");

  if (!token) {
    logger.warn("Token validation failed: reset token is missing");
    throw new ApiError(400, "Reset token is required");
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn(
        { token },
        "Token validation failed: invalid or expired reset token"
      );
      throw new ApiError(400, "Invalid or expired reset token");
    }

    logger.info(
      { userId: user._id, email: user.email },
      "Password reset token validated successfully"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { valid: true }, "Reset token is valid"));
  } catch (error) {
    logger.error(
      { error, token },
      "Unexpected error occurred during token validation"
    );
    throw new ApiError(500, "Error validating reset token");
  }
});



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    resetPassword,
    forgotPassword,
    validateResetToken,
}
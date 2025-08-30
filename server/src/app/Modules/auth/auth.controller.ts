/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import passport from "passport";
import { AppError } from "../../errorHelpers/AppError";
import { createUserToken } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookie";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// This function handles user login using credentials (email and password).
const credentialsLogin = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    // const payload = req.body;
    // const result = await AuthService.credentialsLogin(payload);

    // Using Passport.js to authenticate the user with the local strategy
    passport.authenticate(
      "local",
      { session: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, user: any, info: any) => {
        if (err) {
          return next(new AppError(StatusCodes.BAD_REQUEST, err));
        }

        if (!user && info.message === "User not found") {
          return next(new AppError(StatusCodes.NOT_FOUND, info.message));
        }
        if (
          !user &&
          info.message ===
            "You're not verified yet, please verify your email first"
        ) {
          return next(new AppError(StatusCodes.UNAUTHORIZED, info.message));
        }
        if (!user && info.message === "Incorrect password") {
          return next(new AppError(StatusCodes.BAD_REQUEST, info.message));
        }

        if (!user) {
          return next(new AppError(StatusCodes.BAD_REQUEST, info.message));
        }

        const { accessToken, refreshToken } = createUserToken(user);

        setAuthCookie(res, { accessToken, refreshToken });

        sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: "User logged in successfully",
          data: {
            accessToken,
            refreshToken,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              profilePicture: user.profilePicture,
              phoneNumber: user.phoneNumber,
              address: user.address,
              role: user.role,
              isVerified: user.isVerified,
              isActive: user.isActive,
              isDeleted: user.isDeleted,
            },
          },
        });
      }
    )(req, res, next);
  }
);

// This function handles the generation of a new access token using a refresh token.
const getNewAccessToken = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const refreshToken = req?.cookies?.refreshToken;

    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "New access token generated successfully",
      data: tokenInfo,
    });
  }
);

// This function handles log out
const logout = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    res.clearCookie("accessToken", {
      httpOnly: true, // Safer from XSS
      secure: envVars.NODE_ENV === "production", // Only sends over HTTPS on production
      sameSite: "none",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true, // Safer from XSS
      secure: envVars.NODE_ENV === "production", // Only sends over HTTPS on production
      sameSite: "none",
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User Logged Out Successfully",
      data: null,
    });
  }
);

// This function handles changing the user's password.
const changePassword = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { oldPassword, newPassword } = req.body;
    const decodedToken = req.user as JwtPayload;

    await AuthService.changePassword(
      decodedToken.userId,
      oldPassword,
      newPassword
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  }
);

// This function handles setting a new password for the user.
const setPassword = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { password } = req.body;

    const decodedToken = req.user as JwtPayload;

    await AuthService.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password set successfully",
      data: null,
    });
  }
);

// This function handles the forgot password process.
const forgotPassword = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { email } = req.body;

    const resetLink = await AuthService.forgotPassword(email);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password reset link sent successfully",
      data: resetLink,
    });
  }
);

// This function handles resetting the user's password.
const resetPassword = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;

    await AuthService.resetPassword(req.body, decodedToken);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  }
);

// This function handles the Google OAuth callback.
const googleCallbackURL = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    const user = req.user;

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const tokenInfo = createUserToken(user);

    setAuthCookie(res, tokenInfo);

    return res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
  googleCallbackURL,
};

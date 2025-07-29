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

        if (!user) {
          return next(new AppError(StatusCodes.NOT_FOUND, info.message));
        }

        const { accessToken, refreshToken } = createUserToken(user);

        sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: "User logged in successfully",
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user._id,
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
  googleCallbackURL,
};

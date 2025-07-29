import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import { IsActive, IUser } from "../Modules/user/user.interface";
import { generateToken } from "./jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../Modules/user/user.model";

// This function creates a user token containing access and refresh tokens.
// It takes a user object as input, extracts necessary information, and generates tokens using the provided secret and expiration time from environment variables.
// The generated tokens are returned in an object.
export const createUserToken = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  // genrate access tokens
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRATION_TIME
  );

  // genrate  refresh tokens
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_REFRESH_SECRET,
    envVars.JWT.JWT_REFRESH_EXPIRATION_TIME
  );

  return {
    accessToken,
    refreshToken,
  };
};

// This function creates a new access token using the provided refresh token.
// It verifies the refresh token, checks if the user exists, and ensures the user's status is active and not deleted.
// If any checks fail, it throws an appropriate AppError.
export const createAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  // verify the refresh token
  const verifyrefreshToken = jwt.verify(
    refreshToken,
    envVars.JWT.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifyrefreshToken.email });

  // if user does not exist
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "user does not exist");
  }

  // check if user is InActive or Blocked
  if (
    isUserExist.isActive === IsActive.INACTIVE ||
    isUserExist.isActive === IsActive.BLOCKED
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `User is ${isUserExist.isActive}, please contact our support team.`
    );
  }

  // check if user  Deleted
  if (isUserExist.isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, "User is deleted.");
  }


  
  // create jwt payload
  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  // genrate access tokens
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRATION_TIME
  );

  return accessToken;
};

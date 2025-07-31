import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import {
  createAccessTokenWithRefreshToken,
  createUserToken,
} from "../../utils/userToken";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import jwt, { JwtPayload } from "jsonwebtoken"

// This function handles user login using credentials (email and password).
const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(
    password as string,
    isUserExist?.password as string
  );

  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Incorrect password");
  }

  const { accessToken, refreshToken } = createUserToken(isUserExist);

  return {
    accessToken,
    refreshToken,
    user: {
      id: isUserExist._id,
      name: isUserExist.name,
      email: isUserExist.email,
      profilePicture: isUserExist.profilePicture,
      phoneNumber: isUserExist.phoneNumber,
      address: isUserExist.address,
      role: isUserExist.role,
      isVerified: isUserExist.isVerified,
      isActive: isUserExist.isActive,
      isDeleted: isUserExist.isDeleted,
    },
  };
};

// This function handles the generation of a new access token using a refresh token.
const getNewAccessToken = async (refreshToken: string) => {
  // Logic to verify the refresh token and generate a new access token
  if (!refreshToken) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You haven't any refresh token"
    );
  }

  const newAccessToken = await createAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken: newAccessToken,
  };
};

// This function handles changing the user's password.
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!isUserExist.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You haven't set a password yet. Please set a password first."
    );
  }

  if (isUserExist._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to change this password"
    );
  }

  const isOldPasswordMatch = await bcrypt.compare(
    oldPassword,
    isUserExist.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Old password is incorrect");
  }

  isUserExist.password = await bcrypt.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await isUserExist.save();

  return true;
};

// This function handles setting a new password for the user.
const setPassword = async (userId: string, planPassword: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    isUserExist.password &&
    isUserExist.auths?.some((auth) => auth.provider === "google")
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already set a password for your account. Please use the existing password or reset it."
    );
  }

  isUserExist.password = await bcrypt.hash(
    planPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await isUserExist.save();

  return true;
};



// This function handles the forgot password process.
const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!isUserExist.isVerified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Your account is not verified. Please verify your account first."
    );
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

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  // TODO: Send the reset link to the user's email

  return resetUILink;
};

// This function handles resetting the user's password.
const resetPassword = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  decodedToken: JwtPayload
) => {
  if (payload.id !== decodedToken.userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to reset this password"
    );
  }

  const isUserExist = await User.findById(decodedToken.userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  isUserExist.password = await bcrypt.hash(
    payload.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await isUserExist.save();

  return true;
};

// Exporting the AuthService
export const AuthService = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
};

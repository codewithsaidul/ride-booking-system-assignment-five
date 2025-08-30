import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import { IsActive, Role } from "../Modules/user/user.interface";
import { User } from "../Modules/user/user.model";
import { TNext, TRequest, TResponse } from "../types/global";
import { verifyToken } from "./../utils/jwt";
import { Driver } from "../Modules/driver/driver.model";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: TRequest, res: TResponse, next: TNext) => {
    // get the access token from the request headers
    const accessToken = req.headers.authorization || req.cookies.accessToken;

    // if the access token is not present, throw an error
    if (!accessToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Access token is missing");
    }

    // verify the access token
    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT.JWT_ACCESS_SECRET
    ) as JwtPayload;

    // if the token is not verified
    if (!verifiedToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid access token");
    }

    // check if the user's role is allowed to access the resource
    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You do not have permission to access this resource"
      );
    }

    // get the user
    const isUserExist = await User.findOne({ email: verifiedToken.email });

    // if the user does not exist, throw an error
    if (!isUserExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "User does not exist");
    }

    // check if user verified or unVerified
    if (!isUserExist.isVerified) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "You're not verified yet, please verify your email first"
      );
    }

    if (isUserExist.role === Role.DRIVER) {
      const isDriverExist = await Driver.findOne( { driver: isUserExist._id } );

      if (!isDriverExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Driver not found");
      }

      if (isDriverExist.driverStatus === "suspend") {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are suspend. Please contact with our support team");
      }
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

    req.user = verifiedToken;

    next();
  };

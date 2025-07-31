import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constants";
import { IAUTHPROVIDER, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

// Function to create a new user
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  //   Check if user already exists
  if (isUserExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "User already exists with this email"
    );
  }

  //  password hashing
  const hashPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  //   Create auth provider object with credentials
  const authProvider: IAUTHPROVIDER = {
    provider: "credentials",
    providerId: email as string,
  };

  //   Create user with the provided details
  //   Note: The password is hashed before saving to the database
  const user = await User.create({
    email,
    password: hashPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

// Function to get all users with pagination, filtering, searching, and sorting
const getAllUsers = async (query: Record<string, string>) => {
  //   Create a QueryBuilder instance with the User model and the query
  const queryBuilder = new QueryBuilder(User.find(), query);

  //   Apply filters, search, sort, fields, and pagination using the QueryBuilder methods
  const users = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();


    
  //  Execute the query and get the data and metadata
  const [data, meta] = await Promise.all([
    users.build().select("-password -auths"),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};




// Function to get a single user by ID
//  only admin can access this endpoint
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

// Function to update user information
// It uses the User model to find the user by ID and update the provided fields
const updateUserInfo = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.RIDER && decodedToken.role === Role.DRIVER) {
    if (decodedToken.userId !== userId) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authorized for this action"
      );
    }
  }

  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (payload.email) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email cannot be updated");
  }

  if (payload.role) {
    if (decodedToken.role === Role.RIDER && decodedToken.role === Role.DRIVER) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authorized for this action"
      );
    }

    const isSelf = isUserExist.email === decodedToken.email;
    const tryingToDowngradeSelf =
      payload.role === Role.RIDER || payload.role === Role.DRIVER;

    if (isSelf && decodedToken.role === Role.ADMIN && tryingToDowngradeSelf) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You cann't chang your own role"
      );
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.RIDER && decodedToken.role === Role.DRIVER) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authorized for this action"
      );
    }
  }

  const updateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updateUser;
};

// Function to delete a user by ID & Only Admin can access this endpoint
// It sets the isDeleted field to true, effectively soft-deleting the user
const deleteUser = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  //   Check if user exists before attempting to delete
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  //   Delete the user by ID
  //   Note: This will set the isDeleted field to true, effectively soft-deleting the user
  await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { runValidators: true }
  );
  return null;
};

// Exporting the UserService object with methods
export const UserService = {
  createUser,
  getMe,
  getAllUsers,
  updateUserInfo,
  getSingleUser,
  deleteUser,
};

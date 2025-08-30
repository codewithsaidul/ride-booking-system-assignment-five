import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Driver } from "../driver/driver.model";
import { userSearchableFields } from "./user.constants";
import { IAUTHPROVIDER, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import mongoose from "mongoose";
import { Availability, DriverStatus } from "../driver/driver.interface";

// Function to create a new user
const createUser = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { name, email, password, role, licenseNumber, vehicleInfo } = payload;

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
    const user = await User.create(
      [
        {
          name,
          email,
          role,
          password: hashPassword,
          auths: [authProvider],
        },
      ],
      { session }
    );

    if (role === Role.DRIVER) {
      const driverData = {
        driver: user[0]?._id,
        vehicleInfo: {
          vehicleType: vehicleInfo?.vehicleType,
          model: vehicleInfo?.model,
          plate: vehicleInfo?.plate,
        },
        licenseNumber: licenseNumber,
        availability: Availability.ONLINE,
        driverStatus: DriverStatus.APPROVED,
      };

      await Driver.create([driverData], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Function to get all users with pagination, filtering, searching, and sorting
const getAllUsers = async (query: Record<string, string>) => {
  const allDrivers = await Driver.find({}).select("driver driverStatus");

  const driverStatusMap = new Map<string, string>();
  allDrivers.forEach((driver) => {
    driverStatusMap.set(driver.driver.toString(), driver.driverStatus);
  });

  //   Create a QueryBuilder instance with the User model and the query
  const queryBuilder = new QueryBuilder(
    User.find({ isDeleted: { $ne: true }, role: { $ne: "admin" } }),
    query
  );

  //   Apply filters, search, sort, fields, and pagination using the QueryBuilder methods
  const usersQueryBuilder = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  //  Execute the query and get the data and metadata
  const [users, meta] = await Promise.all([
    usersQueryBuilder
      .build()
      .select("-password -auths -isPasswordResetTokenUsed"),
    queryBuilder.getMeta(),
  ]);

  const usersWithFinalStatus = users.map((user) => {
    const userObject = user.toObject();

    if (driverStatusMap.has(userObject._id.toString())) {
      // updating driver status
      userObject.status = driverStatusMap.get(userObject._id.toString());
    } else {
      userObject.status = userObject.isActive;
    }

    // removing unwanted field
    delete userObject.isActive;

    return userObject;
  });

  return {
    data: usersWithFinalStatus,
    meta,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to perform this action"
    );
  }

  return user;
};

// Function to get a single user by ID
//  only admin can access this endpoint
const updateUserStatus = async (
  userId: string,
  status: string,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role !== Role.ADMIN) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this acton"
    );
  }

  const isUserExist = await User.findById(userId).select("-password");
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const updateUser = await User.findByIdAndUpdate(
    userId,
    { isActive: status },
    {
      new: true,
      runValidators: true,
    }
  );

  return updateUser;
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


  if (isUserExist?.role === Role.DRIVER) {
    const driverData = {
      vehicleInfo: {
        vehicleType: payload?.vehicleInfo?.vehicleType,
        model: payload?.vehicleInfo?.model,
        plate: payload?.vehicleInfo?.plate,
      },
      licenseNumber: payload?.licenseNumber,
    };


   await Driver.findOneAndUpdate( { driver: userId }, driverData );
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

  if (isUserExist.isDeleted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This user already has been deleted!"
    );
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
  updateUserStatus,
  deleteUser,
};

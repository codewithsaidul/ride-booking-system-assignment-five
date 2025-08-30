/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

// Function to create a new user
const createUser = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    // logic for creating a user goes here
    const payload = req.body;
    const user = await UserService.createUser(payload);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: `${user.role === "rider" ? "Rider" : "Driver"} account has been created successfully`,
      data: {
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
    });
  }
);

// Function to get all users

const getAllUsers = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    //  logic for getting all users goes here
    const query = req.query;
    const users = await UserService.getAllUsers(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Users retrieved successfully",
      data: users.data,
      meta: users.meta,
    });
  }
);

const getMe = catchAsync(async (req: TRequest, res: TResponse, next: TNext) => {
  // logic for getting a single user goes here
  const decodedToken = req.user as JwtPayload;

  const user = await UserService.getMe(decodedToken.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

// only admin can access this endpoint
const updateUserStatus = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const payload = req.body;
    const decodedToken = req.user as JwtPayload;
    const user = await UserService.updateUserStatus(
      payload.userId,
      payload.isActive,
      decodedToken
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Rider status updated successfully",
      data: user,
    });
  }
);

// Function to update user information
// It uses the UserService to update the user with the provided userId and payload
const updateUserInfo = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    // logic for updating user info goes here
    const { userId } = req.params;
    const payload = req.body;
    const decodedToken = req.user as JwtPayload;

    const updatedUser = await UserService.updateUserInfo(
      userId,
      payload,
      decodedToken
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User has been updated successfully",
      data: updatedUser,
    });
  }
);

// It uses the UserService to delete the user with the provided userId
const deleteUser = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    // logic for deleting a user goes here
    const { userId } = req.params;

    await UserService.deleteUser(userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User has been deleted successfully",
      data: null,
    });
  }
);

// Exporting the UserController object with methods
export const UserController = {
  createUser,
  getMe,
  getAllUsers,
  updateUserStatus,
  updateUserInfo,
  deleteUser,
};

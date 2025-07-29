/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";



const createUser = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    // Your logic for creating a user goes here
    const payload = req.body;

    
    const user = await UserService.createUser(payload);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User has been created successfully",
      data: user,
    });
  }
);

export const UserController = {
  createUser,
};

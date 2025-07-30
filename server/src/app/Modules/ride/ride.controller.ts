/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RideService } from "./ride.service";
import { JwtPayload } from "jsonwebtoken";

const requestRide = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const rideData = req.body;
    const decodedToken = req.user as JwtPayload
    const result = await RideService.requestRide(rideData, decodedToken.userId);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Your ride request successfully",
      data: result,
    });
  }
);



const cancelRide = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { rideStatus } = req.body;
    const { rideId } = req.params
    const decodedToken = req.user as JwtPayload
    const result = await RideService.cancelRide(decodedToken.userId, rideId, rideStatus);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Your ride has been cancelled successfully",
      data: result,
    });
  }
);




export const RideController = {
    requestRide, cancelRide
}

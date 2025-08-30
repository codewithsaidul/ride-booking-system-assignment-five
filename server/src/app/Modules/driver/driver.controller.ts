/* eslint-disable @typescript-eslint/no-unused-vars */
import { Jwt, JwtPayload } from "jsonwebtoken";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { DriverService } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const applyForDriver = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;

    const driver = await DriverService.applyForDriver(req.body, decodedToken);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Your application was successfully sent",
      data: driver,
    });
  }
);

const getAllDriverApplication = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;
    const query = req.query as Record<string, string>;

    const result = await DriverService.getAllDriverApplication(
      decodedToken.userId,
      query
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "All Driver Application has been retrive successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllDriver = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;
    const query = req.query as Record<string, string>;

    const result = await DriverService.getAllDriver(decodedToken.userId, query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "All Driver has been retrive successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);


const getDriverProfile = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverService.getDriverProfile(decodedToken.userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Driver Profile has been retrive successfully",
      data: result,
    });
  }
);


const getIncomingRideRequest = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;
    const query = req.query as Record<string, string>;

    const result = await DriverService.getIncomingRideRequest(decodedToken.userId, query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Incoming Ride Request has been retrive successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const updateDriverApplicationStatus = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { driverStatus } = req.body;
    const { applicationId } = req.params;

    const updateDriver = await DriverService.updateDriverApplicationStatus(
      applicationId,
      driverStatus
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message:
        "Driver application has been approved. Please Login again to use all feature of driver role",
      data: updateDriver,
    });
  }
);

const updateDriverStatus = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { driverStatus, driverId } = req.body;
    const decodedToken = req.user as JwtPayload;

    await DriverService.updateDriverStatus(
      driverId,
      driverStatus,
      decodedToken
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Driver status has been updated successfully",
      data: null,
    });
  }
);

const updateDriverAvailityStatus = catchAsync(
  async (req: TRequest, res: TResponse, next: TNext) => {
    const { availability } = req.body;
    const decodedToken = req.user as JwtPayload;

    const updateDriver = await DriverService.updateDriverAvailityStatus(
      decodedToken.userId,
      availability
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Driver Availability status has been updated successfully",
      data: updateDriver,
    });
  }
);

export const DriverController = {
  applyForDriver,
  getAllDriverApplication,
  getAllDriver,
  getDriverProfile,
  getIncomingRideRequest,
  updateDriverApplicationStatus,
  updateDriverAvailityStatus,
  updateDriverStatus,
};

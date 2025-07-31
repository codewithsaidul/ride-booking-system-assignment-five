/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { DriverService } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";





const applyForDriver = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken =  req.user as JwtPayload;

    const driver = await DriverService.applyForDriver(req.body, decodedToken);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Your application was successfully sent",
        data: driver
    })
});



const getAllDriverApplication = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken =  req.user as JwtPayload;
    const query = req.query as Record<string, string>


    const result = await DriverService.getAllDriverApplication(decodedToken.userId, query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All Driver Application has been retrive successfully",
        data: result.data,
        meta: result.meta
    })
})


const getAllDriver = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken =  req.user as JwtPayload;
    const query = req.query as Record<string, string>


    const result = await DriverService.getAllDriver(decodedToken.userId, query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All Driver has been retrive successfully",
        data: result.data,
        meta: result.meta
    })
})


const updateDriverApplicationStatus = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const { driverStatus } = req.body;
    const { applicationId } = req.params

    const updateDriver = await DriverService.updateDriverApplicationStatus(applicationId, driverStatus);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Driver application has been approved. Please Login again to use all feature of driver role",
        data: updateDriver
    })
});



const updateDriverAvailityStatus = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const { availability } = req.body;
    const { driverId } = req.params;
    const decodedToken = req.user as JwtPayload;

    const updateDriver = await DriverService.updateDriverAvailityStatus(driverId, decodedToken, availability);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Driver Availability status has been updated successfully",
        data: updateDriver
    })
});




export const DriverController = {
    applyForDriver, getAllDriverApplication, getAllDriver, updateDriverApplicationStatus, updateDriverAvailityStatus
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { AnalyticsService } from "./analytics.service";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";



const adminDashboardStats = catchAsync( async (req: TRequest, res: TResponse, next: TNext) => {
    const decodedToken = req.user as JwtPayload;

    const result = await AnalyticsService.adminDashboardStats(decodedToken.userId);



    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Dasboard Stats has been retrive successfully",
        data: result
    })
})




export const AnalyticController = {
    adminDashboardStats
}
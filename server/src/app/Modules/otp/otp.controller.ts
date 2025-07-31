/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import { TNext, TRequest, TResponse } from "../../types/global";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OtpService } from "./otp.service";






const sendOtp = catchAsync (async (req: TRequest, res: TResponse, next: TNext) => {
    const { name, email } = req.body;


    await OtpService.sendOtp(name, email);


    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "OTP Code send successfully",
        data: null
    })
})



const verifyOtp = catchAsync (async (req: TRequest, res: TResponse, next: TNext) => {
    const { email, otp } = req.body;


    await OtpService.verifyOtp(email, otp);


    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "OTP verification successfully",
        data: null
    })
})







export const OtpController = {
    sendOtp, verifyOtp
}
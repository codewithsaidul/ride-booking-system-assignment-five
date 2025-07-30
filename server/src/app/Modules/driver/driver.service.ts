import { JwtPayload } from "jsonwebtoken";
import { IUser, Role } from "../user/user.interface";
import { AppError } from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";




const applyForDriver = async (payload: Partial<IUser>, decodedToken: JwtPayload) => {
    if (decodedToken.role !== Role.RIDER) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to apply for driver")
    }

    const isUserExist = await User.findById(decodedToken.userId);

    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    if (!isUserExist.address) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Please update your address before applying as a driver.");
    }

    const driver = await User.findByIdAndUpdate(decodedToken.userId, payload, { new: true, runValidators: true });

    return driver
}




const updateDriverApplicationStatus = async (userId: string, payload: string) => {
    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    const updateApplicationStatus = await User.findByIdAndUpdate(userId, {
        driverStatus: payload
    }, { new: true, runValidators: true });


    return updateApplicationStatus
}




export const DriverService = {
    applyForDriver, updateDriverApplicationStatus
}
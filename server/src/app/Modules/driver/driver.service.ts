import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { Driver } from "./driver.model";
import { DriverApplication } from "./driverApplication.model";
import { DriverStatus } from "./driver.interface";

const applyForDriver = async (
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role !== Role.RIDER) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to apply for driver"
    );
  }


  const isUserExist = await User.findById(decodedToken.userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!isUserExist.address) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please update your address before applying as a driver."
    );
  }

  if (isUserExist.role === Role.DRIVER) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You have already registred as drive");
  }

  const driver = await DriverApplication.create({...payload, driver: decodedToken.userId});

  return driver;
};

// update driver application status by admin
const updateDriverApplicationStatus = async (
  applicationId: string,
  payload: string
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isApplicationExist = await DriverApplication.findById(applicationId);

    if (!isApplicationExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "This Application not found");
    }

    if (isApplicationExist.driverStatus === DriverStatus.APPROVED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "This application already has been approved"
      );
    }

    const isUserExist = await User.findById(isApplicationExist.driver);

    if (!isUserExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    // update role on User collection
    await User.findByIdAndUpdate(
      isApplicationExist.driver,
      {
        role: Role.DRIVER,
      },
      { runValidators: true, session }
    );

    const updateApplication = await DriverApplication.findByIdAndUpdate(
      applicationId,
      {
        driverStatus: payload,
      },
      { new: true, runValidators: true, session }
    );

    const driverData = {
      driver: updateApplication?.driver,
      vehicleInfo: {
        vehicleType: updateApplication?.vehicleInfo?.vehicleType,
        model: updateApplication?.vehicleInfo?.model,
        plate: updateApplication?.vehicleInfo?.plate,
      },
      licenseNumber: updateApplication?.licenseNumber,
      availability: updateApplication?.availability,
      driverStatus: updateApplication?.driverStatus,
    };

    const updateApplicationStatus = await Driver.create([driverData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return updateApplicationStatus;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const DriverService = {
  applyForDriver,
  updateDriverApplicationStatus,
};

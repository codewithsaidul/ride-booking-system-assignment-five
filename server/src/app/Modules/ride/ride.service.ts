import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { calculateDistanceInKm } from "../../utils/calculateDistanceInKm";
import { calculateFare } from "../../utils/calculateFare";
import { cancelledRideToday } from "../../utils/cancelledRideToday";
import { Availability, DriverStatus } from "../driver/driver.interface";
import { Driver } from "../driver/driver.model";
import { User } from "../user/user.model";
import { IRides, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";
import { DriverActiveRide, rideStatusFlow } from "./ride.status";
import { QueryBuilder } from "../../utils/queryBuilder";
import { rideSearchableFields } from "./ride.constant";

const requestRide = async (payload: Partial<IRides>, userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const todaysCancelledCount = await cancelledRideToday(userId);

  if (todaysCancelledCount >= 3) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot request a ride today as you have cancelled 3 rides already."
    );
  }

  const lat1 = payload.pickedupLocation?.coordinates[0] as number;
  const long1 = payload.pickedupLocation?.coordinates[1] as number;
  const lat2 = payload.destinationLocation?.coordinates[0] as number;
  const long2 = payload.destinationLocation?.coordinates[1] as number;

  const distance = calculateDistanceInKm(lat1, long1, lat2, long2);
  const totalFare = calculateFare(distance);

  const rideData = {
    ...payload,
    rider: userId,
    fare: totalFare,
  };

  const rideRequested = await Ride.create(rideData);

  return rideRequested;
};


const getAllRides = async (userId: string, query: Record<string, string>) => {
  const isUserExist = await User.findById(userId);

  // check user is exist or not
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // check user are valid or not
  if (isUserExist._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this action"
    );
  }

    //   Create a QueryBuilder instance with the User model and the query
    const queryBuilder = new QueryBuilder(Ride.find(), query);
  
    //   Apply filters, search, sort, fields, and pagination using the QueryBuilder methods
    const users = queryBuilder
      .search(rideSearchableFields)
      .filter()
      .sort()
      .fields()
      .paginate()
      .populate("rider", "-password")
      .populate("driver", "-password");
  
  
      
    //  Execute the query and get the data and metadata
    const [data, meta] = await Promise.all([
      users.build().select("-password -auths"),
      queryBuilder.getMeta(),
    ]);
  

  // const allRides = await Ride.find().populate("rider", "-password").populate("driver", "-password");


  return {
    data, meta
  }
};

const viewRideHistroy = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (isUserExist._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this action"
    );
  }

  const rideHistroy = await Ride.find({
    $and: [
      { rider: userId },
      {
        rideStatus: { $nin: ["accepted", "picked_up", "in_transit"] },
      },
    ],
  });

  return rideHistroy;
};

const viewEarningHistory = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (isUserExist._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this action"
    );
  }

  const driverRideHistroy = await Ride.find({
    driver: userId,
    rideStatus: { $in: [RideStatus.COMPLETED] },
  });

  return driverRideHistroy;
};

const updateRideStatus = async (
  userId: string,
  rideId: string,
  newStatus: RideStatus
) => {
  const session = await Ride.startSession();

  try {
    session.startTransaction();

    const isUserExist = await User.findById(userId);

    // check user is exist or not
    if (!isUserExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    // check user are valid or not
    if (isUserExist._id.toString() !== userId) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authorized for this action"
      );
    }

    const isRideExist = await Ride.findById(rideId);

    // checking ride exist or not
    if (!isRideExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "Ride not found");
    }

    const isDriverExist = await Driver.findOne({ driver: userId });

    // checking if driver status pending or rejected or suspend
    if (
      isDriverExist &&
      (isDriverExist.driverStatus === DriverStatus.PENDING ||
        isDriverExist.driverStatus === DriverStatus.REJECTED ||
        isDriverExist.driverStatus === DriverStatus.SUSPEND)
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `You cann't accept any ride request. Because your driving status is ${isDriverExist.driverStatus}`
      );
    }

    // checking driver is online or offline
    if (isDriverExist && isDriverExist.availability === Availability.OFFLINE) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `You cann't update ride status. Because your are offline`
      );
    }

    if (
      RideStatus.REJECTED === newStatus ||
      RideStatus.ACCEPTED === newStatus
    ) {
      const isDriverHaveActiveRide = await Ride.findOne({
        driver: userId,
        rideStatus: { $in: DriverActiveRide },
      });

      // Check if the driver already has an active ride with a non-completed status
      if (isDriverHaveActiveRide) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `You already have an active ride in progress`
        );
      }
    }

    // prevent ride cancell by driver
    if (RideStatus.CANCELLED === newStatus) {
      throw new AppError(StatusCodes.BAD_REQUEST, "You cann't cancel any ride");
    }

    // check if rider already cancelled
    if (isRideExist.rideStatus === RideStatus.CANCELLED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `This ride has already been '${isRideExist.rideStatus}' by the rider.`
      );
    }

    // Ensure the current ride status is allowed to transition to the requested new status
    if (!rideStatusFlow[isRideExist.rideStatus].includes(newStatus)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Invalid status transition from '${isRideExist.rideStatus}' to '${newStatus}'.`
      );
    }

    // Initialize updateRideData and get current timestamp in Dhaka timezone
    let updateRideData;
    const nowInDhaka = dayjs().tz("Asia/Dhaka").format();

    // driver rejeting a ride
    if (RideStatus.REJECTED === newStatus) {
      updateRideData = {
        driver: userId,
        rideStatus: newStatus,
        acceptedAt: nowInDhaka,
      };
    }

    // driver accepting ride
    if (RideStatus.ACCEPTED === newStatus) {
      updateRideData = {
        driver: userId,
        rideStatus: newStatus,
        acceptedAt: nowInDhaka,
      };
    }

    // If the ride is already accepted, verify that the current user is the assigned driver
    if (isRideExist.rideStatus === RideStatus.ACCEPTED) {
      if (isRideExist.driver.toString() !== userId) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `You are not assign to this ride`
        );
      }
    }

    // Set ride status and record timestamp (e.g., pickedUpAt, inTransitAt, completedAt) based on the new status
    switch (newStatus) {
      case RideStatus.PICKED_UP:
        updateRideData = {
          rideStatus: newStatus,
          pickedupAt: nowInDhaka,
        };
        break;
      case RideStatus.IN_TRANSIT:
        updateRideData = {
          rideStatus: newStatus,
          inTransitAt: nowInDhaka,
        };
        break;
      case RideStatus.COMPLETED:
        updateRideData = {
          rideStatus: newStatus,
          completedAt: nowInDhaka,
        };
        await Driver.findOneAndUpdate(
          { driver: userId },
          { earnings: isRideExist?.fare },
          { session }
        );
        break;
      default:
        break;
    }

    // updating ride status
    const rideStatusUpdate = await Ride.findByIdAndUpdate(
      rideId,
      updateRideData,
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    await session.endSession();

    return rideStatusUpdate;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const cancelRide = async (
  userId: string,
  rideId: string,
  cancelStatus: string
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (isUserExist._id.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this action"
    );
  }

  const isRideExist = await Ride.findById(rideId);

  if (!isRideExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ride not found");
  }

  if (
    isRideExist.rideStatus === RideStatus.ACCEPTED ||
    isRideExist.rideStatus === RideStatus.COMPLETED ||
    isRideExist.rideStatus === RideStatus.PICKED_UP ||
    isRideExist.rideStatus === RideStatus.REJECTED ||
    isRideExist.rideStatus === RideStatus.IN_TRANSIT
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `You cann't cancel your ride. Because your ride status is ${isRideExist.rideStatus}`
    );
  }

  if (isRideExist.rideStatus === RideStatus.CANCELLED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You already  cancelled this ride"
    );
  }

  const todaysCancelledCount = await cancelledRideToday(userId);

  if (todaysCancelledCount >= 3) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot cancel this ride — your daily cancel limit (3) has been reached."
    );
  }

  const cancelledRide = await Ride.findByIdAndUpdate(
    rideId,
    { rideStatus: cancelStatus, cancelledAt: Date.now() },
    { new: true, runValidators: true }
  );

  return cancelledRide;
};

export const RideService = {
  requestRide,
  getAllRides,
  viewRideHistroy,
  viewEarningHistory,
  updateRideStatus,
  cancelRide,
};

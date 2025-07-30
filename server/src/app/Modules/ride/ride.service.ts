import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { calculateDistanceInKm } from "../../utils/calculateDistanceInKm";
import { calculateFare } from "../../utils/calculateFare";
import { User } from "../user/user.model";
import { IRides, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";

const requestRide = async (payload: Partial<IRides>, userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
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

const cancelRide = async (
  userId: string,
  rideId: string,
  cancelStatus: string
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isRideExist = await Ride.findById(rideId);

  if (!isRideExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ride not found");
  }

  if (
    isRideExist.rideStatus === RideStatus.ACCEPTED ||
    isRideExist.rideStatus === RideStatus.COMPLETED ||
    isRideExist.rideStatus === RideStatus.PICKED_UP ||
    isRideExist.rideStatus === RideStatus.REJETED ||
    isRideExist.rideStatus === RideStatus.IN_TRANSIT
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, `You cann't cancel your ride. Because your ride status is ${isRideExist.rideStatus}`);
  }

  const cancelledRide = await Ride.findByIdAndUpdate(rideId, { rideStatus: cancelStatus }, { new: true, runValidators: true});

  return cancelledRide;
};

export const RideService = {
  requestRide, cancelRide
};

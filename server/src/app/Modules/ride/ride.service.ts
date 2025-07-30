import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { calculateDistanceInKm } from "../../utils/calculateDistanceInKm"
import { calculateFare } from "../../utils/calculateFare";
import { User } from "../user/user.model";
import { IRides } from "./ride.interface"
import { Ride } from "./ride.model";





const requestRide = async (payload: Partial<IRides>, userId: string) => {
    

    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Rider not found")
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
        fare: totalFare
    }

    const rideRequested = await Ride.create(rideData)

    return rideRequested;
}






export const RideService = {
    requestRide
}




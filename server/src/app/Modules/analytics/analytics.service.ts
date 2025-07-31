import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { User } from "../user/user.model"
import { Role } from "../user/user.interface";
import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";




const adminDashboardStats = async (userId: string) => {
    const isUserExist = await User.findById(userId);


    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    const totalUsers = await User.countDocuments();
    const totalRiders = await User.countDocuments( { role: Role.RIDER } );
    const totalDrivers = await User.countDocuments( { role: Role.DRIVER } );


    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments( { rideStatus: RideStatus.COMPLETED } );
    const cancelledRides = await Ride.countDocuments( { rideStatus: RideStatus.CANCELLED }  );


    const earningsAgg = await Ride.aggregate([
        { $match:  { rideStatus: RideStatus.COMPLETED } },
        { $group: { _id: null, totalFare: { $sum: "$fare" } } }
    ])

    const totalEarnings = earningsAgg[0]?.totalFare;

    return {
        totalUsers: {
            totalUsers,
            totalAdmins: totalUsers - (totalRiders + totalDrivers),
            totalRiders, totalDrivers
        },
        totalRides, completedRides, cancelledRides,
        totalEarnings
    }
}



export const AnalyticsService = {
    adminDashboardStats
}
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Ride } from "../Modules/ride/ride.model";

dayjs.extend(utc)
dayjs.extend(timezone)


export const cancelledRideToday = async (riderId: string) => {
    const startOfDay = dayjs().tz("Asia/Dhaka").startOf("day").format();
    const endOfDay = dayjs().tz("Asia/Dhaka").endOf("day").format();

    const cancelCount = await Ride.countDocuments({
        rider: riderId,
        rideStatus: "cancelled",
        cancelledAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });


    return cancelCount
}


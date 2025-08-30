import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { cancelledRideToday } from "../../utils/cancelledRideToday";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Availability, DriverStatus } from "../driver/driver.interface";
import { Driver } from "../driver/driver.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { rideSearchableFields } from "./ride.constant";
import { IRides, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";
import {
  ActiveRide,
  rideStatusFlow,
  statusesThatNeedVerification,
} from "./ride.status";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { io } from "../../../server";

// Get date from bd time zone
dayjs.extend(utc);
dayjs.extend(timezone);
const nowInDhaka = dayjs().tz("Asia/Dhaka").format();

const requestRide = async (payload: Partial<IRides>, userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const missingFields: string[] = [];

  if (!isUserExist.phoneNumber) {
    missingFields.push("Phone Number");
  }
  if (!isUserExist.address) {
    missingFields.push("Address");
  }

  if (missingFields.length > 0) {
    const message = `To request a ride, please add your ${missingFields.join(
      " and "
    )} to your profile`;

    throw new AppError(StatusCodes.BAD_REQUEST, message);
  }

  const todaysCancelledCount = await cancelledRideToday(userId);

  if (todaysCancelledCount >= 3) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot request a ride today as you have cancelled 3 rides already."
    );
  }

  const activeRide = await Ride.findOne({
    rider: userId,
    rideStatus: { $in: ["requested", "accepted", "picked_up", "in_transit"] },
  });

  if (activeRide) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You already have an active ride."
    );
  }

  const isRiderHaveActiveRide = await Ride.findOne({
    rider: userId,
    rideStatus: { $in: ActiveRide },
  });

  // Check if the rider already has an active ride with a non-completed status
  if (isRiderHaveActiveRide) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `You already have an active ride in progress`
    );
  }

  const rideData = {
    ...payload,
    rider: userId,
    riderName: isUserExist?.name,
    statusLogs: [
      {
        status: RideStatus.REQUESTED,
        timestamp: nowInDhaka,
      },
    ],
    pickupCoordinates: {
      type: "Point",
      coordinates: Array.isArray(payload?.pickupCoordinates)
        ? [...payload.pickupCoordinates]
        : [],
    },
    destinationCoordinates: {
      type: "Point",
      coordinates: Array.isArray(payload.destinationCoordinates)
        ? [...payload.destinationCoordinates]
        : [],
    },
    platformEarnings: Math.ceil((payload?.fare as number) * 0.1),
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
  const rides = queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()
    .populate("rider", "-password -auths")
    .populate("driver", "-password -auths");

  //  Execute the query and get the data and metadata
  const [data, meta] = await Promise.all([
    rides.build().select("-password -auths"),
    queryBuilder.getMeta(),
  ]);

  // const allRides = await Ride.find().populate("rider", "-password").populate("driver", "-password");

  return {
    data,
    meta,
  };
};

const getRideDetails = async (rideId: string, decodedToken: JwtPayload) => {
  // step 1: get the logged in user info
  const { userId, role } = decodedToken;

  // step 2 finding the ride and populate the rider/driver data
  const ride = await Ride.aggregate([
    // step 1: find the ride useing ride id
    {
      $match: { _id: new Types.ObjectId(rideId) },
    },
    // step 2 get the ride user info from users collection
    {
      $lookup: {
        from: "users",
        localField: "rider",
        foreignField: "_id",
        as: "riderInfo",
      },
    },
    // step 3 get the driver user info from users collection
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driverUserInfo",
      },
    },
    // step: 4 get the drvier vehicle info from drivers collection
    {
      $lookup: {
        from: "drivers",
        localField: "driver",
        foreignField: "driver",
        as: "driverVehicleInfo",
      },
    },

    { $unwind: "$riderInfo" },
    { $unwind: { path: "$driverUserInfo", preserveNullAndEmptyArrays: true } },
    {
      $unwind: { path: "$driverVehicleInfo", preserveNullAndEmptyArrays: true },
    },

    {
      $project: {
        _id: 1,
        rideStatus: 1,
        fare: 1,
        statusLogs: 1,
        createdAt: 1,
        pickupAddress: 1,
        pickupCoordinates: 1,
        destinationAddress: 1,
        destinationCoordinates: 1,
        platformEarnings: 1,
        commisionRate: 1,
        rider: {
          _id: "$riderInfo._id",
          name: "$riderInfo.name",
          phoneNumber: "$riderInfo.phoneNumber",
          email: "$riderInfo.email",
          role: "$riderInfo.role",
        },
        driver: {
          $cond: {
            if: { $ifNull: ["$driverUserInfo", false] },
            then: {
              _id: "$driverUserInfo._id",
              name: "$driverUserInfo.name",
              phoneNumber: "$driverUserInfo.phoneNumber",
              email: "$driverUserInfo.email",
              role: "$driverUserInfo.role",
              vehicleInfo: "$driverVehicleInfo.vehicleInfo",
              licenseNumber: "$driverVehicleInfo.licenseNumber",
            },

            else: null,
          },
        },
      },
    },
  ]);

  // যদি রাইড খুঁজে না পাওয়া যায়
  if (!ride[0]) {
    throw new AppError(StatusCodes.NOT_FOUND, "This ride does not exist");
  }

  // 👇 ধাপ ৩: একটিমাত্র পরিষ্কার অথোরাইজেশন চেক
  const isAdmin = role === Role.ADMIN;
  const isRiderOfThisRide = ride[0]?.rider._id?.toString() === userId;
  // 💡 সেফটি চেক: ride.driver null হতে পারে, তাই optional chaining (?.) ব্যবহার করুন
  const isDriverOfThisRide = ride[0]?.driver?._id?.toString() === userId;

  // যদি ব্যবহারকারী অ্যাডমিন না হয়, এবং ওই রাইডের রাইডার বা ড্রাইভারও না4 হয়
  if (!isAdmin && !isRiderOfThisRide && !isDriverOfThisRide) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to view this ride's details."
    );
  }

  // যদি উপরের শর্ত পাস করে, তাহলে ব্যবহারকারী অনুমোদিত
  return ride[0];
};

const viewRideHistroy = async (
  userId: string,
  query: Record<string, string>
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    isUserExist._id.toString() !== userId &&
    isUserExist.role !== Role.RIDER &&
    isUserExist.role !== Role.DRIVER
  ) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized for this action"
    );
  }

  const queryBuilder = new QueryBuilder(
    Ride.find({
      $and: [
        {
          $or: [{ rider: userId }, { driver: userId }],
        },
        {
          rideStatus: {
            $nin: ["accepted", "requested", "picked_up", "in_transit"],
          },
        },
      ],
    }),
    query
  );

  //   Apply filters, search, sort, fields, and pagination using the QueryBuilder methods
  const rides = queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()
    .populate("rider", "-password -auths")
    .populate("driver", "-password -auths");

  //  Execute the query and get the data and metadata
  const [data, meta] = await Promise.all([
    rides.build().select("-password -auths"),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};

const viewEarningHistory = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (isUserExist.role !== Role.DRIVER) {
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

const getMyActiveRide = async (userId: string) => {
  const activeRideDetails = await Ride.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              { rider: new Types.ObjectId(userId) },
              {
                rideStatus: {
                  $in: ["requested", "accepted", "picked_up", "in_transit"],
                },
              },
            ],
          },
          {
            $and: [
              { driver: new Types.ObjectId(userId) },
              {
                rideStatus: {
                  $in: ["accepted", "picked_up", "in_transit"],
                },
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "rider",
        foreignField: "_id",
        as: "riderInfo",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driverUserInfo",
      },
    },
    {
      $lookup: {
        from: "drivers",
        localField: "driver",
        foreignField: "driver",
        as: "driverVehicleInfo",
      },
    },
    { $unwind: "$riderInfo" },
    { $unwind: { path: "$driverUserInfo", preserveNullAndEmptyArrays: true } },
    {
      $unwind: { path: "$driverVehicleInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        rideStatus: 1,
        fare: 1,
        statusLogs: 1,
        createdAt: 1,
        pickupAddress: 1,
        pickupCoordinates: 1,
        destinationAddress: 1,
        destinationCoordinates: 1,
        platformEarnings: 1,
        commisionRate: 1,
        rider: {
          _id: "$riderInfo._id",
          name: "$riderInfo.name",
          phoneNumber: "$riderInfo.phoneNumber",
          email: "$riderInfo.email",
          role: "$riderInfo.role",
        },
        driver: {
          $cond: {
            if: { $ifNull: ["$driverUserInfo", false] },
            then: {
              _id: "$driverUserInfo._id",
              name: "$driverUserInfo.name",
              phoneNumber: "$driverUserInfo.phoneNumber",
              email: "$driverUserInfo.email",
              role: "$driverUserInfo.role",
              vehicleInfo: "$driverVehicleInfo.vehicleInfo",
              licenseNumber: "$driverVehicleInfo.licenseNumber",
            },
            else: null,
          },
        },
      },
    },
  ]);

  if (activeRideDetails.length === 0) {
    return null;
  }

  return activeRideDetails[0];
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
    if (isUserExist.role !== Role.ADMIN && isUserExist.role !== Role.DRIVER) {
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

    if (RideStatus.ACCEPTED === newStatus) {
      const isDriverHaveActiveRide = await Ride.findOne({
        driver: userId,
        rideStatus: { $in: ActiveRide },
      });

      // Check if the driver already has an active ride with a non-completed status
      if (isDriverHaveActiveRide) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `You already have an active ride in progress`
        );
      }
    }

    // check if rider already cancelled
    if (isRideExist.rideStatus === RideStatus.CANCELLED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `This ride has been already '${isRideExist.rideStatus}' by the rider.`
      );
    }
    // check if rider already cancelled
    if (isRideExist.rideStatus === RideStatus.REJECTED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `This ride has been already '${isRideExist.rideStatus}'`
      );
    }

    // Ensure the current ride status is allowed to transition to the requested new status
    if (isUserExist.role !== Role.ADMIN) {
      if (!rideStatusFlow[isRideExist.rideStatus].includes(newStatus)) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid status transition from '${isRideExist.rideStatus}' to '${newStatus}'.`
        );
      }
    }

    // Checking already have any driver assign for this ride
    if (statusesThatNeedVerification.includes(newStatus)) {
      const isAssignedDriver = isRideExist.driver
        ? isRideExist.driver.toString() === userId
        : false;
      const isAdmin = isUserExist.role === Role.ADMIN;
      if (!isAssignedDriver && !isAdmin) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          `You are not assign to this ride`
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQuery: any = {
      $set: {
        rideStatus: newStatus,
        driverName: isUserExist?.name,
      },
      $push: {
        statusLogs: [
          {
            status: newStatus,
            timeStamp: nowInDhaka,
          },
        ],
      },
    };

    //  Assgining a driver for accpeted or rejected status
    if (
      newStatus === RideStatus.ACCEPTED ||
      newStatus === RideStatus.REJECTED ||
      newStatus === RideStatus.CANCELLED
    ) {
      updateQuery.$set.driver = userId;
    }

    // update driver earning when ride is compoeted
    if (newStatus === RideStatus.COMPLETED) {
      await Driver.findOneAndUpdate(
        { driver: isRideExist.driver },
        { $inc: { earnings: isRideExist.fare } },
        { session }
      );
    }

    // updating ride status
    const rideStatusUpdate = await Ride.findByIdAndUpdate(rideId, updateQuery, {
      new: true,
      runValidators: true,
      session,
    });

    if (
      rideStatusUpdate?.rideStatus === "completed" ||
      rideStatusUpdate?.rideStatus === "cancelled"
    ) {
      io.to(rideId).emit("ride_Status_updated", {
        rideId,
        newStatus,
        rideDetails: rideStatusUpdate,
      });
    }

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

  if (isUserExist.role !== Role.RIDER) {
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
  getRideDetails,
  viewRideHistroy,
  viewEarningHistory,
  getMyActiveRide,
  updateRideStatus,
  cancelRide,
};

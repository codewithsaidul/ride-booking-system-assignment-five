import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IsActive, Role } from "../user/user.interface";
import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";
import { startOfDay, subDays } from "date-fns"; //
import { Availability } from "../driver/driver.interface";
import { Driver } from "../driver/driver.model";
import { Types } from "mongoose";

// --- বর্তমান মাসের তারিখ ---
const now = new Date();
const ninetyDaysAgo = startOfDay(subDays(now, 90));

const adminDashboardStats = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  // checking user perm
  if (!isUserExist) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not auhorized");
  }

  const activeUserCountPromise = User.countDocuments({
    role: { $ne: Role.ADMIN },
    isActive: IsActive.ACTIVE,
  });

  const availableDriverPromise = Driver.countDocuments({
    availability: Availability.ONLINE,
  });
  // bhai rider er accoutn blcok r driver suspend tahklle to set r active na

  const completedRidesPromise = Ride.countDocuments({
    rideStatus: RideStatus.COMPLETED,
  });

  const totalEarningsPromise = Ride.aggregate([
    { $match: { rideStatus: RideStatus.COMPLETED } },

    {
      $group: {
        _id: null,
        totalPlatformRevenue: { $sum: "$platformEarnings" },
      },
    },
  ]);

  const dailyRevenueData = await Ride.aggregate([
    // ধাপ ১: শুধুমাত্র গত ৯০ দিনের সম্পন্ন হওয়া রাইডগুলো ফিল্টার করুন
    {
      $match: {
        rideStatus: RideStatus.COMPLETED,
        updatedAt: { $gte: ninetyDaysAgo },
      },
    },
    // ধাপ ২: দিন অনুযায়ী গ্রুপ করুন এবং প্রতিদিনের মোট প্ল্যাটফর্ম আয় গণনা করুন
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        totalPlatformRevenue: { $sum: "$platformEarnings" }, // daily platfomr income from commision
        totalGrossFare: { $sum: "$fare" },
      },
    },
    // ধাপ ৩: তারিখ অনুযায়ী সাজান, যাতে চার্টে ঠিকভাবে দেখানো যায়
    {
      $sort: { _id: 1 },
    },
    // ধাপ ৪: আউটপুটের ফরম্যাট আপনার chartData-এর মতো করে সাজান
    {
      $project: {
        _id: 0, // removeing _id
        date: "$_id", // changing _id to a date
        totalPlatformRevenue: "$totalPlatformRevenue",
        totalGrossFare: "$totalGrossFare",
      },
    },
  ]);

  const [
    totalUsers,
    activeUser,
    availableDriver,
    completedRides,
    totalEarnings,
  ] = await Promise.all([
    User.countDocuments(),
    activeUserCountPromise,
    availableDriverPromise,
    completedRidesPromise,
    totalEarningsPromise,
  ]);

  const totalPlatformRevenue = totalEarnings[0]?.totalPlatformRevenue;

  return {
    totalUsers,
    activeUser,
    availableDriver,
    completedRides,
    totalPlatformRevenue,
    dailyRevenueData,
  };
};

const driverDashboardStats = async (userId: string) => {
  const isUserExist = await User.findById(userId);
  // checking user perm
  if (!isUserExist) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not auhorized");
  }

  const driverProfile = await Driver.findOne({ driver: userId });

  if (!driverProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, "Driver Profile Not found");
  }

  const totalCompletedRides = await Ride.countDocuments({
    driver: userId,
    rideStatus: RideStatus.COMPLETED,
  });

  const driverDailyEarnings = await Ride.aggregate([
    // ধাপ ১: শুধুমাত্র গত ৯০ দিনের সম্পন্ন হওয়া রাইডগুলো ফিল্টার করুন
    {
      $match: {
        rideStatus: RideStatus.COMPLETED,
        updatedAt: { $gte: ninetyDaysAgo },
        driver: new Types.ObjectId(userId)
      },
    },
    // ধাপ ২: দিন অনুযায়ী গ্রুপ করুন এবং প্রতিদিনের মোট প্ল্যাটফর্ম আয় গণনা করুন
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        totalDriverEarnings: { $sum: { $subtract: ["$fare", "$platformEarnings"] } }, // daily platfomr income from commision
      },
    },
    // ধাপ ৩: তারিখ অনুযায়ী সাজান, যাতে চার্টে ঠিকভাবে দেখানো যায়
    {
      $sort: { _id: 1 },
    },
    // ধাপ ৪: আউটপুটের ফরম্যাট আপনার chartData-এর মতো করে সাজান
    {
      $project: {
        _id: 0, // removeing _id
        date: "$_id", // changing _id to a date
        totalDriverEarnings: "$totalDriverEarnings",
      },
    },
  ]);



  return { totalEarnings: driverProfile.earnings, totalCompletedRides, driverDailyEarnings };
};

export const AnalyticsService = {
  adminDashboardStats,
  driverDashboardStats,
};

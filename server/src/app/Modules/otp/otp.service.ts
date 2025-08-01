import crypto from "crypto";
import { User } from "../user/user.model";
import { AppError } from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";

const OTP_EXPIRATION = 2 * 60;

const generateOTP = (length = 6) => {
  //  6 digit otp

  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length);

  return otp;
};

const sendOtp = async (name: string, email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (isUserExist.isVerified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You are already verified user"
    );
  }

  const otp = generateOTP();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name,
      otp,
    },
  });

  return null;
};




const verifyOtp = async (email: string, otp: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }


    if (isUserExist.isVerified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You are already verified user"
    );
  }


  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);


  if (!savedOtp) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You don't have any OTP.")
  }


  if (savedOtp !== otp) {
    throw new AppError(StatusCodes.BAD_REQUEST, "The OTP you entered is not valid.")
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true}),
    redisClient.del(redisKey)
  ])


  return null
};

export const OtpService = {
  sendOtp, verifyOtp
};

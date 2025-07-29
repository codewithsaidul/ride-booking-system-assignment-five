import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { createUserToken } from "../../utils/userToken";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";



// This function handles user login using credentials (email and password).
const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(
    password as string,
    isUserExist?.password as string
  );

  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Incorrect password");
  }

  const { accessToken, refreshToken } = createUserToken(isUserExist);

  return {
    accessToken,
    refreshToken,
    user: {
      id: isUserExist._id,
      name: isUserExist.name,
      email: isUserExist.email,
      profilePicture: isUserExist.profilePicture,
      phoneNumber: isUserExist.phoneNumber,
      address: isUserExist.address,
      role: isUserExist.role,
      isVerified: isUserExist.isVerified,
      isActive: isUserExist.isActive,
      isDeleted: isUserExist.isDeleted,
    },
  };
};



// Exporting the AuthService 
export const AuthService = {
  credentialsLogin,
};

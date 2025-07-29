import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../errorHelpers/AppError";
import { createAccessTokenWithRefreshToken, createUserToken } from "../../utils/userToken";
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


const getNewAccessToken = async (refreshToken: string) => {
  // Logic to verify the refresh token and generate a new access token
  if (!refreshToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You haven't any refresh token");
  }

  const newAccessToken = await createAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken: newAccessToken,
  };  
}



// Exporting the AuthService 
export const AuthService = {
  credentialsLogin,
  getNewAccessToken,
};

import { envVars } from "../../config/env";
import { IAUTHPROVIDER, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  //   Check if user already exists
  if (isUserExist) {
    throw new Error("User already exists with this email");
  }

  //   password hashing
  const hashPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  //   Create auth provider object with credentials
  const authProvider: IAUTHPROVIDER = {
    provider: "credentials",
    providerId: email as string,
  };

  //   Create user with the provided details
  //   Note: The password is hashed before saving to the database
  //   and the auth provider is set to "credentials" with the email as providerId
  const user = await User.create({
    email,
    password: hashPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

export const UserService = {
  createUser,
};

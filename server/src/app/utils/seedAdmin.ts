import { envVars } from "../config/env";
import { IAUTHPROVIDER, IUser, Role } from "../Modules/user/user.interface";
import { User } from "../Modules/user/user.model";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await User.findOne({ role: "admin" });

    if (isAdminExist) {
      console.log("Admin already exists.");
      return null;
    }

    const hashPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD as string,
      parseInt(envVars.BCRYPT_SALT_ROUND as string)
    );

    const authProvider: IAUTHPROVIDER = {
      provider: "credentials",
      providerId: envVars.ADMIN_EMAIL,
    };


    const adminInfo: IUser = {
        name: "Admin",
        email: envVars.ADMIN_EMAIL,
        password: hashPassword,
        role: Role.ADMIN,
        isVerified: true,
        auths: [authProvider],
    }


    await User.create(adminInfo);

    console.log("Admin seeded successfully.");

  } catch (error) {
    console.log(error);
  }
};

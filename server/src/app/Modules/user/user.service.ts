import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constants";
import { IAUTHPROVIDER, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";


// Function to create a new user
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


// Function to get all users with pagination, filtering, searching, and sorting
// It uses the QueryBuilder utility to build the query based on the provided parameters
const getAllUsers = async (query: Record<string, string>) => {
  //   Create a QueryBuilder instance with the User model and the query
  const queryBuilder = new QueryBuilder(User.find().select("-password"), query);

  //   Apply filters, search, sort, fields, and pagination using the QueryBuilder methods
  const users = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  //   Execute the query and get the data and metadata
  //   The data will be an array of users, and the meta will contain pagination info
  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};



// Function to get a single user by ID
//  only admin can access this endpoint
// It retrieves the user from the database and excludes the password field
const getSingleUser = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
};

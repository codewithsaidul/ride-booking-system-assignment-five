export enum Role {
  ADMIN = "admin",
  RIDER = "rider",
  DRIVER = "driver",
}

export enum IsActive {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export interface IAUTHPROVIDER {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role?: Role;
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  isDeleted?: boolean;
  auths?: IAUTHPROVIDER[];
  status?: string;
  isPasswordResetTokenUsed?: boolean;
  licenseNumber?: string;
  vehicleInfo?: IVehicleInfo
}

export interface IVehicleInfo {
  vehicleType?: string;
  model?: string;
  plate?: string;
}

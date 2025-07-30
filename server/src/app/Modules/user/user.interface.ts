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

export enum Availability {
  ONLINE = "online",
  OFFLINE = "offline"
}

export enum DriverStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPEND = "suspend"
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

  // =========== driver related
  vehicleInfo?: {
    vehicleType: string;
    model: string;
    plate: string;
  };
  licenseNumber?: string;
  availability?: Availability;
  driverStatus?: DriverStatus;
}

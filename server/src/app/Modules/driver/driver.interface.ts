import { Types } from "mongoose";





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






export interface IDriver {
 driver: Types.ObjectId;
  vehicleInfo: {
    vehicleType: string;
    model: string;
    plate: string;
  };
  licenseNumber: string;
  availability: Availability;
  driverStatus: DriverStatus;
  earnings?: number;
}

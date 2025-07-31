import { model, Schema } from "mongoose";
import { Availability, DriverStatus, IDriver } from "./driver.interface";

const driverApplicationSchema = new Schema<IDriver>(
  {
    driver: { type: Schema.Types.ObjectId },
    vehicleInfo: {
      vehicleType: { type: String },
      model: { type: String },
      plate: { type: String },
    },
    licenseNumber: { type: String },
    availability: {
      type: String,
      enum: Object.values(Availability),
      default: Availability.OFFLINE,
    },
    driverStatus: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);





export const DriverApplication = model<IDriver>("DriverApplication", driverApplicationSchema)
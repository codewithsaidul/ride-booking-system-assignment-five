import { Schema, model } from "mongoose";
import { RideStatus } from "./ride.interface"; // enum টি import করো
import { IRides } from "./ride.interface";

const rideLocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const rideSchema = new Schema<IRides>(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    pickedupLocation: {
      type: rideLocationSchema,
      required: true,
    },
    destinationLocation: {
      type: rideLocationSchema,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    rideStatus: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    rejectedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    pickedupAt: {
      type: Date,
    },
    inTransitAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Optional: Index for location-based queries
rideSchema.index({ pickedupLocation: "2dsphere" });
rideSchema.index({ destinationLocation: "2dsphere" });

export const Ride = model<IRides>("Ride", rideSchema);

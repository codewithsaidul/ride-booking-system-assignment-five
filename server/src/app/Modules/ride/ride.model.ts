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



const statusLogSchema = new Schema( // ১. স্কিমার নাম পরিবর্তন
  {
    status: { // ২. ফিল্ডের নাম 'status' করা হয়েছে
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED
    },
    timestamp: { // ৩. টাইমস্ট্যাম্প ফিল্ড যোগ করা হয়েছে
      type: Date,
      default: Date.now,
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
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    pickupAddress: { type: String, required: true},
    destinationAddress: { type: String, required: true},
    pickupCoordinates: {
      type: rideLocationSchema,
      required: true,
    },
    destinationCoordinates: {
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
    statusLogs: [statusLogSchema],
    commisionRate: { type: Number, default: 0.10 },
    platformEarnings: { type: Number }
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

import { z } from "zod";
import { RideStatus } from "./ride.interface";

const rideLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z
    .tuple([z.number(), z.number()]) // [longitude, latitude]
    .refine(
      ([lon, lat]) => lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180,
      {
        message: "Invalid coordinates",
      }
    ),
});

export const rideStatusEnum = z.enum([
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELLED",
]);

export const createRideZodSchema = z.object({
  pickedupLocation: rideLocationSchema,
  destinationLocation: rideLocationSchema,
  rideStatus: z.enum(Object.values(RideStatus) as [string], {
    required_error: "Ride status is required",
    invalid_type_error: "Invalid status value",
  }),
  pickupAddress: z
    .string()
    .min(5, { message: "Please enter a valid pickup address." }),
  destinationAddress: z
    .string()
    .min(5, { message: "Please enter a valid destination address." }),
});

// export const cancelledRideZodSchema = z.object({
//   rideStatus: z.enum(RideStatus.CANCELLED, {
//     required_error: "Ride status is required",
//     invalid_type_error: "Invalid status value",
//   }),
// });

import z from "zod";
import { Availability, DriverStatus } from "./driver.interface";

export const driverApplicationZodSchema = z.object({
  licenseNumber: z
    .string()
    .min(6, "License number must be at least 6 characters")
    .max(20, "License number must be at most 20 characters"),

  vehicleInfo: z.object({
    vehicleType: z.string().min(1, "Vehicle type is required"),
    model: z.string().min(1, "Model is required"),
    plate: z
      .string()
      .min(5, "Plate number must be at least 5 characters")
      .max(15, "Plate number must be at most 15 characters"),
  }),
});

export const updateDriverApplicationStatusSchema = z.object({
  driverStatus: z.enum(Object.values(DriverStatus) as [string], {
    required_error: "Application status is required",
    invalid_type_error: "Invalid status value",
  }),
});


export const updateDriveAvailityStatusZodSchema = z.object({
  availability: z.enum(Object.values(Availability) as [string], {
    required_error: "Availability status is required",
    invalid_type_error: "Invalid Availability status value",
  }),
});

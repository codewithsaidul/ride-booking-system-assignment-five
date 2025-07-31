import z from "zod";

export const otpSendZodSchema = z.object({
  name: z
    .string({
      invalid_type_error: "name must be string",
      required_error: "name is required",
    })
    .min(3, { message: "name must be at least 3 charachters long" }),
  email: z
    .string({
      invalid_type_error: "email must be string",
      required_error: "email is required",
    })
    .email(),
});

export const otpVerifyZodSchema = z.object({
  otp: z
    .string({
      invalid_type_error: "otp must be string",
      required_error: "otp is required",
    })
    .min(6, { message: "OTP must be exactly 6 characters long" })
    .max(6, { message: "OTP must be exactly 6 characters long" }),
  email: z
    .string({
      invalid_type_error: "email must be string",
      required_error: "email is required",
    })
    .email(),
});

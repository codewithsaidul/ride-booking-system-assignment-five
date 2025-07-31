import z from "zod";

export const changePasswordZodSchema = z.object({
  oldPassword: z.string({
    invalid_type_error: "Old password must be string",
    required_error: "Old password is required",
  }),
  newPassword: z
    .string({
      invalid_type_error: "New password must be string",
      required_error: "New password is required",
    })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[a-z])/, {
      message: "Password must contain at least 1 lowercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
});

export const setPasswordZodSchema = z.object({
  password: z
    .string({
      invalid_type_error: "Password must be string",
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[a-z])/, {
      message: "Password must contain at least 1 lowercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
});

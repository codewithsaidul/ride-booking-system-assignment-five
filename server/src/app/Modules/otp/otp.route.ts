import { Router } from "express";
import { OtpController } from "./otp.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { otpSendZodSchema, otpVerifyZodSchema } from "./otp.validation";



const router = Router();


router.post("/send", validateRequest(otpSendZodSchema), OtpController.sendOtp)
router.post("/verify", validateRequest(otpVerifyZodSchema), OtpController.verifyOtp)




export const OtpRoutes = router;
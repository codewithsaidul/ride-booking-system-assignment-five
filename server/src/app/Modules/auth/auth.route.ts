import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../user/user.interface";
import { AuthController } from "./auth.controller";
import {
  changePasswordZodSchema,
  setPasswordZodSchema,
} from "./auth.validation";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  validateRequest(changePasswordZodSchema),
  AuthController.changePassword
);
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  validateRequest(setPasswordZodSchema),
  AuthController.setPassword
);
router.post("/reset-password", checkAuth(...Object.values(Role)),  AuthController.resetPassword);
router.post("/forgot-password", AuthController.forgotPassword);

// router.get("/google", async (req: TRequest, res: TResponse, next: TNext) => {
//   const redirect = req.query.redirect || "/";
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     state: redirect as string,
//   })(req, res, next);
// });

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login?error=There are some issues with your account. Please contact with our support team`}),
//   AuthController.googleCallbackURL
// );

export const AuthRoutes = router;


import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import {
  driverApplicationZodSchema,
  updateDriveAvailityStatusZodSchema,
  updateDriverApplicationStatusSchema,
} from "./driver.validation";
import { DriverController } from "./driver.controller";

const router = Router();

router.post(
  "/apply-driver",
  checkAuth(Role.RIDER),
  validateRequest(driverApplicationZodSchema),
  DriverController.applyForDriver
);
router.get(
  "/",
  checkAuth(Role.ADMIN),
  DriverController.getAllDriver
);
router.get(
  "/driver-application",
  checkAuth(Role.ADMIN),
  DriverController.getAllDriverApplication
);
router.get(
  "/me",
  checkAuth(Role.DRIVER),
  DriverController.getDriverProfile
);
router.get(
  "/incoming-request",
  checkAuth(Role.DRIVER),
  DriverController.getIncomingRideRequest
);
router.patch(
  "/driver-application/:applicationId/status",
  checkAuth(Role.ADMIN),
  validateRequest(updateDriverApplicationStatusSchema),
  DriverController.updateDriverApplicationStatus
);
router.patch(
  "/:driverId/driverStatus",
  checkAuth(Role.ADMIN),
  DriverController.updateDriverStatus
);
router.patch(
  "/me/availability",
  checkAuth(Role.DRIVER),
  validateRequest(updateDriveAvailityStatusZodSchema),
  DriverController.updateDriverAvailityStatus
);

export const DriverRoutes = router;

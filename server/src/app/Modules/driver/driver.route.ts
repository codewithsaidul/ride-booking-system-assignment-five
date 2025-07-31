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
  "/driver-application",
  checkAuth(Role.ADMIN),
  DriverController.getAllDriverApplication
);
router.get(
  "/driver",
  checkAuth(Role.ADMIN),
  DriverController.getAllDriver
);
router.patch(
  "/application-status/:applicationId",
  checkAuth(Role.ADMIN),
  validateRequest(updateDriverApplicationStatusSchema),
  DriverController.updateDriverApplicationStatus
);
router.patch(
  "/:driverId/availability",
  checkAuth(Role.DRIVER),
  validateRequest(updateDriveAvailityStatusZodSchema),
  DriverController.updateDriverAvailityStatus
);

export const DriverRoutes = router;

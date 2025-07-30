import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { driverApplicationZodSchema, updateDriverApplicationStatusSchema } from "./driver.validation";
import { DriverController } from "./driver.controller";



const router = Router();


router.patch("/apply-driver", checkAuth(Role.RIDER), validateRequest(driverApplicationZodSchema), DriverController.applyForDriver);
router.patch("/application-status/:userId", checkAuth(Role.ADMIN), validateRequest(updateDriverApplicationStatusSchema), DriverController.updateDriverApplicationStatus);




export const DriverRoutes = router;
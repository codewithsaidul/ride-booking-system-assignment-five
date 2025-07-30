import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";




const router = Router();

router.post("/request-ride", checkAuth(Role.RIDER), RideController.requestRide)
router.patch("/cancel-ride/:rideId", checkAuth(Role.RIDER), RideController.cancelRide)



export const RideRoutes = router;
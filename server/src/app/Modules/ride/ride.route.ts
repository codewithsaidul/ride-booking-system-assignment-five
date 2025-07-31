import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";




const router = Router();

router.post("/", checkAuth(Role.RIDER), RideController.requestRide)
router.get("/histroy", checkAuth(Role.RIDER), RideController.viewRideHistroy)
router.get("/earnings", checkAuth(Role.DRIVER), RideController.viewEarningHistory)
router.patch("/:rideId/rideStatus", checkAuth(Role.DRIVER), RideController.updateRideStatus)
router.patch("/:rideId/cancel", checkAuth(Role.RIDER), RideController.cancelRide)



export const RideRoutes = router;
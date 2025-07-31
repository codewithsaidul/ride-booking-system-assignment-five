import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";




const router = Router();

router.post("/request-ride", checkAuth(Role.RIDER), RideController.requestRide)
router.get("/view-ride-histroy", checkAuth(Role.RIDER), RideController.viewRideHistroy)
router.get("/view-earnings-histroy", checkAuth(Role.DRIVER), RideController.viewEarningHistory)
router.patch("/updateRide/:rideId/rideStatus", checkAuth(Role.DRIVER), RideController.updateRideStatus)
router.patch("/cancel-ride/:rideId", checkAuth(Role.RIDER), RideController.cancelRide)



export const RideRoutes = router;
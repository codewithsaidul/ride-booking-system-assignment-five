import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";




const router = Router();

router.post("/", checkAuth(Role.RIDER), RideController.requestRide)
router.get("/", checkAuth(Role.ADMIN), RideController.getAllRides)
router.get("/:rideId/details", checkAuth(Role.ADMIN, Role.RIDER, Role.DRIVER), RideController.getRideDetails)
router.get("/histroy", checkAuth(Role.RIDER, Role.DRIVER), RideController.viewRideHistroy)
router.get("/earnings", checkAuth(Role.DRIVER), RideController.viewEarningHistory)
router.get("/myActiveRide", checkAuth(Role.RIDER, Role.DRIVER), RideController.getMyActiveRide)
router.patch("/:rideId/rideStatus", checkAuth(Role.DRIVER, Role.ADMIN), RideController.updateRideStatus)
router.patch("/:rideId/cancel", checkAuth(Role.RIDER), RideController.cancelRide)



export const RideRoutes = router;
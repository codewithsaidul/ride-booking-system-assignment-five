import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";




const router = Router();

router.post("/request-ride", checkAuth(Role.RIDER), RideController.requestRide)



export const RideRoutes = router;
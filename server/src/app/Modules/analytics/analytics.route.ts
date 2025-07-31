import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { AnalyticController } from "./analytics.controller";



const router = Router();



router.get("/stats", checkAuth(Role.ADMIN), AnalyticController.adminDashboardStats)



export const AnalyticsRoutes = router;
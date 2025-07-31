import { Router } from "express";
import { AuthRoutes } from "../Modules/auth/auth.route";
import { DriverRoutes } from "../Modules/driver/driver.route";
import { RideRoutes } from "../Modules/ride/ride.route";
import { AnalyticsRoutes } from "../Modules/analytics/analytics.route";
import { OtpRoutes } from "../Modules/otp/otp.route";

export const router = Router();

const modulesRoute = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/drivers",
    route: DriverRoutes,
  },
  {
    path: "/rides",
    route: RideRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
];

modulesRoute.forEach((route) => {
  router.use(route.path, route.route);
});

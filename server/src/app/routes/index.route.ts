import { Router } from "express";
import { UserRoutes } from "../Modules/user/user.route";
import { AuthRoutes } from "../Modules/auth/auth.route";
import { DriverRoutes } from "../Modules/driver/driver.route";
import { RideRoutes } from "../Modules/ride/ride.route";

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
    path: "/driver",
    route: DriverRoutes,
  },
  {
    path: "/rides",
    route: RideRoutes,
  },
];

modulesRoute.forEach((route) => {
  router.use(route.path, route.route);
});

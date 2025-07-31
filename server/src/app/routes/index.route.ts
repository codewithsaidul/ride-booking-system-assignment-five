import { Router } from "express";
import { AuthRoutes } from "../Modules/auth/auth.route";
import { DriverRoutes } from "../Modules/driver/driver.route";


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
];

modulesRoute.forEach((route) => {
  router.use(route.path, route.route);
});

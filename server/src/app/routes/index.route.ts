import { Router } from "express";
import { userRoutes } from "../Modules/user/user.route";



export const router = Router();


const modulesRoute = [
    {
        path: "/user",
        route: userRoutes
    },
]


modulesRoute.forEach(route => {
    router.use(route.path, route.route)
})

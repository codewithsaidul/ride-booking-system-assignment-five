import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";



const router = Router();


// checkAuth middlerware added on auth branch

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.patch("/:userId/userStatus", checkAuth(Role.ADMIN), UserController.updateUserStatus);
router.patch("/:userId", checkAuth(...Object.values(Role)), validateRequest(updateUserZodSchema), UserController.updateUserInfo);
router.delete("/:userId", checkAuth(Role.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
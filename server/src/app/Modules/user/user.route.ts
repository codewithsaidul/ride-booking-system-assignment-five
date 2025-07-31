import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";



const router = Router();


// checkAuth middlerware added on auth branch

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get("/:userId", UserController.getSingleUser);
router.patch("/:userId", validateRequest(updateUserZodSchema), UserController.updateUserInfo);
router.delete("/:userId", UserController.deleteUser);

export const userRoutes = router;
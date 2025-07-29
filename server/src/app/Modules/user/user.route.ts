import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";



const router = Router();


router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", UserController.getAllUsers);
router.get("/:userId", UserController.getSingleUser);
router.patch("/:userId", validateRequest(updateUserZodSchema), UserController.updateUserInfo);

export const userRoutes = router;
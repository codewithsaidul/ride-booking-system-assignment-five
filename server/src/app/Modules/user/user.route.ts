import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema } from "./user.validation";



const router = Router();


router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", UserController.getAllUsers);
router.get("/:userId", UserController.getSingleUser);

export const userRoutes = router;
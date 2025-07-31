import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import {
  driverApplicationZodSchema,
  updateDriveAvailityStatusZodSchema,
  updateDriverApplicationStatusSchema,
} from "./driver.validation";
import { DriverController } from "./driver.controller";

const router = Router();


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import { TErrorSources } from "../types/error.types";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";



export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatus.BAD_REQUEST;
  let message = `Something went wrong!!`;
  let errorSources: TErrorSources[] = [];


  // ================ duplicate error======================================
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }
  // =================== CastError ===============================================
  else if (err.name === "CastError") {
    const simplifiedError = handleCastError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }
  // =============== Zod error======================================
  else if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  }
  // ===================== Mongoose Validation Error================================
  else if (err.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  }
  // =============== Custom Error======================================
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // =============== Default Error===========================================
  else if (err instanceof Error) {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
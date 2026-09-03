import type { ErrorRequestHandler } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { AppError } from "../utils/app-error.js";
import type { ApiResponse } from "../interfaces/api-response.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isAppError = error instanceof AppError;
  const isPrismaKnownError = error instanceof PrismaClientKnownRequestError;
  const statusCode = isAppError ? error.statusCode : isPrismaKnownError ? 400 : 500;

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    message: isAppError || isPrismaKnownError ? error.message : "Internal server error",
    errors: isAppError ? error.details : undefined
  };

  res.status(statusCode).json(response);
};

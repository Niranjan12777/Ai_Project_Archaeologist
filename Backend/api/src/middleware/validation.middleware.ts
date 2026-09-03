import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/app-error.js";

export const validateRequest: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new AppError("Validation failed", 422, result.array()));
    return;
  }
  next();
};

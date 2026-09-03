import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import type { AuthUser } from "../types/auth.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtAccessSecret) as AuthUser;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

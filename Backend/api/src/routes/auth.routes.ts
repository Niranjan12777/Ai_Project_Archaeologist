import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { AuthController } from "../controllers/auth.controller.js";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { loginValidator, refreshValidator, registerValidator } from "../validators/auth.validator.js";

const users = new UserRepository(prisma);
const refreshTokens = new RefreshTokenRepository(prisma);
const service = new AuthService(users, refreshTokens);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.post("/register", registerValidator, validateRequest, controller.register);
authRouter.post("/login", loginValidator, validateRequest, controller.login);
authRouter.post("/refresh", refreshValidator, validateRequest, controller.refresh);

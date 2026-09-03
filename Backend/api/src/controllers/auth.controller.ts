import type { RequestHandler } from "express";
import { sendSuccess } from "../utils/api-response.js";
import type { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register: RequestHandler = async (req, res, next) => {
    try {
      const payload = await this.authService.register(req.body);
      sendSuccess(res, payload, "Account created", 201);
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const payload = await this.authService.login(req.body);
      sendSuccess(res, payload, "Logged in");
    } catch (error) {
      next(error);
    }
  };

  refresh: RequestHandler = async (req, res, next) => {
    try {
      const payload = await this.authService.refresh(req.body.refreshToken);
      sendSuccess(res, payload, "Session refreshed");
    } catch (error) {
      next(error);
    }
  };
}

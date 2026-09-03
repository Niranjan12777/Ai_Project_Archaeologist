import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { User } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import type { AuthUser, TokenPair } from "../types/auth.js";

export class TokenService {
  createAccessToken(user: Pick<User, "id" | "email" | "role">): string {
    const payload: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: env.jwtAccessExpiresIn
    } as SignOptions);
  }

  createRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn
    } as SignOptions);
  }

  createTokenPair(user: Pick<User, "id" | "email" | "role">): TokenPair {
    return {
      accessToken: this.createAccessToken(user),
      refreshToken: this.createRefreshToken(user.id)
    };
  }

  verifyRefreshToken(token: string): { sub: string } {
    return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  refreshExpiryDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }
}

import bcrypt from "bcryptjs";
import type { User } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { AppError } from "../utils/app-error.js";
import { TokenService } from "./token.service.js";

export interface AuthPayload {
  user: Pick<User, "id" | "email" | "name" | "role">;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly tokenService = new TokenService();

  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository
  ) { }

  async register(input: { email: string; name?: string; password: string }): Promise<AuthPayload> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError("An account already exists for this email", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds);
    const user = await this.users.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash
    });

    return this.issueSession(user);
  }

  async login(input: { email: string; password: string }): Promise<AuthPayload> {
    const user = await this.users.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    return this.issueSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthPayload> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const stored = await this.refreshTokens.findActiveByHash(tokenHash);
    if (!stored) {
      throw new AppError("Invalid refresh token", 401);
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    await this.refreshTokens.revoke(stored.id);
    return this.issueSession(user);
  }

  private async issueSession(user: User): Promise<AuthPayload> {
    const tokens = this.tokenService.createTokenPair(user);
    await this.refreshTokens.create({
      tokenHash: this.tokenService.hashToken(tokens.refreshToken),
      userId: user.id,
      expiresAt: this.tokenService.refreshExpiryDate()
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      ...tokens
    };
  }
}

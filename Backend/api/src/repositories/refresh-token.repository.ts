import type { PrismaClient, RefreshToken } from "../generated/prisma/client.js";

export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: { tokenHash: string; userId: string; expiresAt: Date }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  findActiveByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
  }

  revoke(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  }
}

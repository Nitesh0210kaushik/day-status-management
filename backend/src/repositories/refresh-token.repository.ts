import { prisma } from "../config/database";

export function createRefreshToken(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
) {
  return prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
}

export function findActiveRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { select: { id: true, email: true, createdAt: true } } },
  });
}

export function revokeRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export function revokeRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

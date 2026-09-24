import { prisma } from "../config/database";

export function createSession(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
) {
  return prisma.session.create({
    data: { tokenHash, userId, expiresAt },
  });
}

export function findActiveSession(tokenHash: string) {
  return prisma.session.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
}

export function revokeSession(id: string) {
  return prisma.session.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export function revokeSessionByHash(tokenHash: string) {
  return prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

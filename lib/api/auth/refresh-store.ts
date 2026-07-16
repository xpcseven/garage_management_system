import { prisma } from "@/lib/prisma";
import {
  createOpaqueRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
} from "@/lib/api/auth/tokens";

export async function issueRefreshToken(
  userId: string,
  userAgent?: string | null
): Promise<string> {
  const raw = createOpaqueRefreshToken();
  const tokenHash = hashRefreshToken(raw);
  await prisma.apiRefreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: refreshTokenExpiresAt(),
      userAgent: userAgent?.slice(0, 255) ?? null,
    },
  });
  return raw;
}

export async function validateRefreshToken(
  raw: string
): Promise<{ userId: string; id: string } | null> {
  const tokenHash = hashRefreshToken(raw);
  const row = await prisma.apiRefreshToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, revokedAt: true },
  });
  if (!row || row.revokedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return { userId: row.userId, id: row.id };
}

export async function revokeRefreshToken(raw: string): Promise<boolean> {
  const tokenHash = hashRefreshToken(raw);
  const row = await prisma.apiRefreshToken.findUnique({
    where: { tokenHash },
    select: { id: true, revokedAt: true },
  });
  if (!row || row.revokedAt) return false;
  await prisma.apiRefreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return true;
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.apiRefreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** تدوير التوكن: إبطال القديم وإصدار جديد */
export async function rotateRefreshToken(
  oldRaw: string,
  userAgent?: string | null
): Promise<{ refreshToken: string; userId: string } | null> {
  const valid = await validateRefreshToken(oldRaw);
  if (!valid) return null;
  await revokeRefreshToken(oldRaw);
  const refreshToken = await issueRefreshToken(valid.userId, userAgent);
  return { refreshToken, userId: valid.userId };
}

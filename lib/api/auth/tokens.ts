import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";
import { UserRole } from "@/prisma/UserRole.enum";

export type ApiTokenUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

const ACCESS_TTL = process.env.API_ACCESS_TOKEN_TTL?.trim() || "15m";
const REFRESH_TTL_DAYS = Number(process.env.API_REFRESH_TOKEN_DAYS ?? "30");

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(user: ApiTokenUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secretKey());
}

export async function verifyAccessToken(
  token: string
): Promise<ApiTokenUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.typ !== "access") return null;
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    const email = payload.email;
    const name = payload.name;
    const role = payload.role;
    if (typeof email !== "string" || typeof name !== "string") return null;
    if (
      typeof role !== "string" ||
      !Object.values(UserRole).includes(role as UserRole)
    ) {
      return null;
    }
    return {
      id: sub,
      email,
      name,
      role: role as UserRole,
    };
  } catch {
    return null;
  }
}

export function accessTokenExpiresInSeconds(): number {
  const ttl = ACCESS_TTL;
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return 900;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 3600;
    case "d":
      return n * 86400;
    default:
      return 900;
  }
}

export function createOpaqueRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt(): Date {
  const days = Number.isFinite(REFRESH_TTL_DAYS) ? REFRESH_TTL_DAYS : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function bearerFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

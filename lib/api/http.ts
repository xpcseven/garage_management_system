import { NextResponse } from "next/server";
import {
  bearerFromRequest,
  verifyAccessToken,
  type ApiTokenUser,
} from "@/lib/api/auth/tokens";
import { UserRole } from "@/prisma/UserRole.enum";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
  return res;
}

export function apiOk<T>(data: T, status = 200): NextResponse {
  return withCors(NextResponse.json({ ok: true, data }, { status }));
}

export function apiError(
  message: string,
  status = 400,
  code?: string
): NextResponse {
  return withCors(
    NextResponse.json(
      { ok: false, error: message, ...(code ? { code } : {}) },
      { status }
    )
  );
}

export function handleOptions(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function requireApiUser(
  req: Request,
  roles?: UserRole[]
): Promise<{ user: ApiTokenUser } | { response: NextResponse }> {
  const token = bearerFromRequest(req);
  if (!token) {
    return {
      response: apiError("مطلوب Access Token", 401, "UNAUTHORIZED"),
    };
  }
  const user = await verifyAccessToken(token);
  if (!user) {
    return {
      response: apiError("انتهت صلاحية الجلسة — سجّل الدخول مجدداً", 401, "TOKEN_EXPIRED"),
    };
  }
  if (roles && !roles.includes(user.role)) {
    return { response: apiError("لا تملك صلاحية", 403, "FORBIDDEN") };
  }
  return { user };
}

export function getBaseUrl(req?: Request): string {
  const fromEnv =
    process.env.NEXT_WEBSITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (req) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export function toAbsoluteMediaUrl(
  path: string | null | undefined,
  baseUrl: string
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = baseUrl.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export async function parseJsonBody<T extends Record<string, unknown>>(
  req: Request
): Promise<{ body: T } | { response: NextResponse }> {
  try {
    return { body: (await req.json()) as T };
  } catch {
    return { response: apiError("JSON غير صالح", 400) };
  }
}

export function userAgentFromRequest(req: Request): string | null {
  return req.headers.get("user-agent");
}

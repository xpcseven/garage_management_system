import { getUserAuthById } from "@/lib/action/user.action";
import {
  accessTokenExpiresInSeconds,
  signAccessToken,
} from "@/lib/api/auth/tokens";
import { rotateRefreshToken } from "@/lib/api/auth/refresh-store";
import {
  apiError,
  apiOk,
  handleOptions,
  parseJsonBody,
  userAgentFromRequest,
} from "@/lib/api/http";
import { UserRole } from "@/prisma/UserRole.enum";

export function OPTIONS() {
  return handleOptions();
}

/** تجديد Access Token باستخدام Refresh Token (يُدوَّر Refresh عند كل استخدام) */
export async function POST(req: Request) {
  const parsed = await parseJsonBody<{ refreshToken?: string }>(req);
  if ("response" in parsed) return parsed.response;

  const refreshToken = String(parsed.body.refreshToken ?? "").trim();
  if (!refreshToken) {
    return apiError("refreshToken مطلوب", 400);
  }

  const rotated = await rotateRefreshToken(
    refreshToken,
    userAgentFromRequest(req)
  );
  if (!rotated) {
    return apiError("جلسة غير صالحة — سجّل الدخول مجدداً", 401, "INVALID_REFRESH");
  }

  const user = await getUserAuthById(rotated.userId);
  if (!user || user.isDeleted || !user.isActive) {
    return apiError("الحساب غير متاح", 403, "ACCOUNT_DISABLED");
  }

  const profile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };

  const accessToken = await signAccessToken(profile);
  return apiOk({
    accessToken,
    refreshToken: rotated.refreshToken,
    expiresIn: accessTokenExpiresInSeconds(),
    tokenType: "Bearer" as const,
    user: profile,
  });
}

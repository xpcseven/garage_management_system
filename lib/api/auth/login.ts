import bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/lib/action/user.action";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  accessTokenExpiresInSeconds,
  signAccessToken,
  type ApiTokenUser,
} from "@/lib/api/auth/tokens";
import { issueRefreshToken } from "@/lib/api/auth/refresh-store";

export type ApiAuthResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: ApiTokenUser;
};

export async function apiLogin(
  email: string,
  password: string,
  userAgent?: string | null
): Promise<ApiAuthResult | { error: string; code?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const parsed = LoginSchema.safeParse({
    email: normalizedEmail,
    password,
  });
  if (!parsed.success) {
    return { error: "البريد أو كلمة المرور غير صالحة" };
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user?.password || user.isDeleted) {
    return { error: "البريد أو كلمة المرور غير صالحة" };
  }

  const match = await bcrypt.compare(parsed.data.password, user.password);
  if (!match) {
    return { error: "البريد أو كلمة المرور غير صالحة" };
  }

  if (!user.emailVerified || !user.isActive) {
    return {
      error:
        "حسابك غير مفعّل. افتح رابط التفعيل في بريدك ثم حاول تسجيل الدخول مجدداً.",
      code: "EMAIL_NOT_VERIFIED",
    };
  }

  const profile: ApiTokenUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(profile),
    issueRefreshToken(user.id, userAgent),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpiresInSeconds(),
    tokenType: "Bearer",
    user: profile,
  };
}

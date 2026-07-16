import {
  apiError,
  apiOk,
  handleOptions,
  parseJsonBody,
  userAgentFromRequest,
} from "@/lib/api/http";
import { apiLogin } from "@/lib/api/auth/login";

export function OPTIONS() {
  return handleOptions();
}

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody<{ email?: string; password?: string }>(req);
    if ("response" in parsed) return parsed.response;

    const email = String(parsed.body.email ?? "").trim();
    const password = String(parsed.body.password ?? "");
    if (!email || !password) {
      return apiError("البريد وكلمة المرور مطلوبان", 400);
    }

    const result = await apiLogin(email, password, userAgentFromRequest(req));
    if ("error" in result) {
      return apiError(result.error, 401, "INVALID_CREDENTIALS");
    }
    return apiOk(result);
  } catch (e) {
    console.error("[api/v1/auth/login]", e);
    return apiError("خطأ في الخادم", 500, "SERVER_ERROR");
  }
}

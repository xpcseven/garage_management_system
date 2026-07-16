import { revokeRefreshToken } from "@/lib/api/auth/refresh-store";
import {
  apiError,
  apiOk,
  handleOptions,
  parseJsonBody,
} from "@/lib/api/http";

export function OPTIONS() {
  return handleOptions();
}

export async function POST(req: Request) {
  const parsed = await parseJsonBody<{ refreshToken?: string }>(req);
  if ("response" in parsed) return parsed.response;

  const refreshToken = String(parsed.body.refreshToken ?? "").trim();
  if (!refreshToken) {
    return apiError("refreshToken مطلوب", 400);
  }

  await revokeRefreshToken(refreshToken);
  return apiOk({ success: true });
}

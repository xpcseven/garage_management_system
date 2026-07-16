import { apiOk, handleOptions, requireApiUser } from "@/lib/api/http";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(req: Request) {
  const auth = await requireApiUser(req);
  if ("response" in auth) return auth.response;
  return apiOk(auth.user);
}

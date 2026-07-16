import { NextRequest } from "next/server";
import { UserRole } from "@/prisma/UserRole.enum";
import { apiOk, handleOptions, requireApiUser } from "@/lib/api/http";
import { searchTrips } from "@/lib/api/services/passenger-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;

  const sp = req.nextUrl.searchParams;
  const scope = sp.get("scope");
  return apiOk(
    await searchTrips({
      fromCityId: sp.get("fromCityId") ?? undefined,
      toCityId: sp.get("toCityId") ?? undefined,
      q: sp.get("q") ?? undefined,
      scope:
        scope === "garage" || scope === "freelance" || scope === "all"
          ? scope
          : "all",
    })
  );
}

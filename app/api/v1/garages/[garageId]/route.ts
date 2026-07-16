import { UserRole } from "@/prisma/UserRole.enum";
import { apiError, apiOk, handleOptions, requireApiUser } from "@/lib/api/http";
import { fetchGarageById } from "@/lib/api/services/passenger-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: Request,
  { params }: { params: { garageId: string } }
) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;
  const garage = await fetchGarageById(params.garageId);
  if (!garage) return apiError("الكراج غير موجود", 404, "NOT_FOUND");
  return apiOk(garage);
}

import { UserRole } from "@/prisma/UserRole.enum";
import { apiOk, handleOptions, requireApiUser } from "@/lib/api/http";
import { fetchAvailableSeats } from "@/lib/api/services/passenger-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;
  return apiOk(await fetchAvailableSeats(params.tripId));
}

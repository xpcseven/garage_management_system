import { UserRole } from "@/prisma/UserRole.enum";
import type { BookTripLuggagePayload } from "@/lib/luggage-labels";
import {
  apiError,
  apiOk,
  handleOptions,
  parseJsonBody,
  requireApiUser,
} from "@/lib/api/http";
import { bookSeatOnTripForUser } from "@/lib/api/services/booking";

export function OPTIONS() {
  return handleOptions();
}

export async function POST(req: Request) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;

  const parsed = await parseJsonBody<{
    tripId?: string;
    seatId?: string;
    luggage?: BookTripLuggagePayload[];
  }>(req);
  if ("response" in parsed) return parsed.response;

  const tripId = String(parsed.body.tripId ?? "").trim();
  const seatId = String(parsed.body.seatId ?? "").trim();
  if (!tripId || !seatId) {
    return apiError("tripId و seatId مطلوبان", 400);
  }

  const result = await bookSeatOnTripForUser(
    auth.user.id,
    tripId,
    seatId,
    parsed.body.luggage ?? []
  );
  if ("error" in result) return apiError(result.error ?? "تعذر الحجز", 400);
  return apiOk({ success: true });
}

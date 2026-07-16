import { UserRole } from "@/prisma/UserRole.enum";
import { apiError, apiOk, handleOptions, requireApiUser } from "@/lib/api/http";
import { cancelBookingForUser } from "@/lib/api/services/booking";

export function OPTIONS() {
  return handleOptions();
}

export async function DELETE(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;

  const result = await cancelBookingForUser(auth.user.id, params.bookingId);
  if ("error" in result) return apiError(result.error ?? "تعذر الإلغاء", 400);
  return apiOk({ success: true });
}

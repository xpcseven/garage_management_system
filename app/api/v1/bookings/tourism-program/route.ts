import { UserRole } from "@/prisma/UserRole.enum";
import {
  apiError,
  apiOk,
  handleOptions,
  parseJsonBody,
  requireApiUser,
} from "@/lib/api/http";
import { bookTourismProgramForUser } from "@/lib/api/services/booking";

export function OPTIONS() {
  return handleOptions();
}

export async function POST(req: Request) {
  const auth = await requireApiUser(req, [UserRole.USER]);
  if ("response" in auth) return auth.response;

  const parsed = await parseJsonBody<{
    programId?: string;
    passengersCount?: number;
  }>(req);
  if ("response" in parsed) return parsed.response;

  const programId = String(parsed.body.programId ?? "").trim();
  const passengersCount = Number(parsed.body.passengersCount);
  if (!programId) return apiError("programId مطلوب", 400);

  const result = await bookTourismProgramForUser(
    auth.user.id,
    programId,
    passengersCount
  );
  if ("error" in result) return apiError(result.error ?? "تعذر الحجز", 400);
  return apiOk({ success: true });
}

import { prisma } from "@/lib/prisma";
import { apiOk, handleOptions } from "@/lib/api/http";

export function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return apiOk({ status: "ok", database: true });
  } catch {
    return apiOk({ status: "degraded", database: false });
  }
}

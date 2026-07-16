import { apiOk, handleOptions } from "@/lib/api/http";
import { fetchActiveCities } from "@/lib/api/services/public-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  return apiOk(await fetchActiveCities());
}

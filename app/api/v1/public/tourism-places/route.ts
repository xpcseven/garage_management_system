import { apiOk, getBaseUrl, handleOptions } from "@/lib/api/http";
import { fetchPublicTourismPlaces } from "@/lib/api/services/public-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(req: Request) {
  return apiOk(await fetchPublicTourismPlaces(getBaseUrl(req)));
}

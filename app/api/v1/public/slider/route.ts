import { apiOk, getBaseUrl, handleOptions } from "@/lib/api/http";
import { fetchPublicSlider } from "@/lib/api/services/public-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(req: Request) {
  return apiOk(await fetchPublicSlider(getBaseUrl(req)));
}

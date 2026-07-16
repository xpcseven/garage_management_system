import { apiError, apiOk, getBaseUrl, handleOptions } from "@/lib/api/http";
import { fetchPublicTourismPlaceById } from "@/lib/api/services/public-data";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: Request,
  { params }: { params: { placeId: string } }
) {
  try {
    const place = await fetchPublicTourismPlaceById(
      params.placeId,
      getBaseUrl(req)
    );
    if (!place) return apiError("المكان غير موجود", 404, "NOT_FOUND");
    return apiOk(place);
  } catch (err) {
    console.error("[tourism-places/:placeId]", err);
    return apiError("خطأ في الخادم", 500, "INTERNAL_ERROR");
  }
}

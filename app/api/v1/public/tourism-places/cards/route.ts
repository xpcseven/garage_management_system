import { NextRequest } from "next/server";
import { apiOk, getBaseUrl, handleOptions } from "@/lib/api/http";
import { fetchTourismPlaceCards } from "@/lib/api/services/tourism-place-cards";

export function OPTIONS() {
  return handleOptions();
}

/**
 * كاردات الأماكن السياحية — نفس بيانات صفحة /tourism-places
 * GET /api/v1/public/tourism-places/cards
 * GET /api/v1/public/tourism-places/cards?limit=6  (مثل الصفحة الرئيسية)
 */
export async function GET(req: NextRequest) {
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;
  const cards = await fetchTourismPlaceCards(getBaseUrl(req), {
    limit: limit && Number.isFinite(limit) && limit > 0 ? limit : undefined,
  });
  return apiOk(cards);
}

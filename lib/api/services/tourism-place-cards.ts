import { prisma } from "@/lib/prisma";
import {
  resolvePlaceImages,
  tourismPlaceInclude,
} from "@/lib/tourism-place-images";
import { toAbsoluteMediaUrl } from "@/lib/api/http";

/** نفس منطق صفحة /tourism-places */
export function tourismPlaceLocationLabel(p: {
  governorate: string | null;
  cityName: string | null;
  cityRegion: string | null;
}): string {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export type TourismPlaceCard = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  images: string[];
  imageCount: number;
  hasImages: boolean;
  /** تسمية الموقع كما في الكارد (محافظة / مدينة) */
  locationLabel: string;
  governorate: string | null;
  cityName: string | null;
  cityRegion: string | null;
  cityId: string | null;
  /** العنوان النصي — «معلومات الوصول» في صفحة التفاصيل */
  address: string | null;
  /** إحداثيات أو رابط موقع — يُستخدم لفتح Google Maps */
  location: string | null;
  mapsUrl: string | null;
  detailPath: string;
  detailUrl: string;
  createdAt: string;
};

type PlaceRow = {
  id: string;
  name: string;
  governorate: string | null;
  description: string | null;
  address: string | null;
  location: string | null;
  cityId: string | null;
  imageUrl: string | null;
  createdAt: Date;
  city: { name: string; region: string | null } | null;
  images?: { id: string; imageUrl: string; sortOrder: number }[];
};

export function tourismPlaceMapsUrl(location: string | null | undefined): string | null {
  const t = location?.trim();
  if (!t) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(t)}`;
}

function mapToCard(p: PlaceRow, baseUrl: string): TourismPlaceCard {
  const rawImages = resolvePlaceImages(p);
  const images = rawImages.map((u) => toAbsoluteMediaUrl(u, baseUrl)!);
  const cityName = p.city?.name ?? null;
  const cityRegion = p.city?.region ?? null;
  const governorate = p.governorate ?? null;
  const detailPath = `/tourism-places/${p.id}`;

  const location = p.location?.trim() || null;
  const address = p.address?.trim() || null;

  return {
    id: p.id,
    name: p.name,
    description: p.description?.trim() || "بدون وصف",
    imageUrl: images[0] ?? null,
    images,
    imageCount: images.length,
    hasImages: images.length > 0,
    locationLabel: tourismPlaceLocationLabel({
      governorate,
      cityName,
      cityRegion,
    }),
    governorate,
    cityName,
    cityRegion,
    cityId: p.cityId ?? null,
    address,
    location,
    mapsUrl: tourismPlaceMapsUrl(location),
    detailPath,
    detailUrl: `${baseUrl.replace(/\/$/, "")}${detailPath}`,
    createdAt: p.createdAt.toISOString(),
  };
}

/** كاردات صفحة الأماكن السياحية العامة (نفس فلتر الموقع) */
export async function fetchTourismPlaceCards(
  baseUrl: string,
  options?: { limit?: number }
): Promise<TourismPlaceCard[]> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: tourismPlaceInclude,
    take: options?.limit ?? 200,
  });
  return rows.map((p) => mapToCard(p, baseUrl));
}

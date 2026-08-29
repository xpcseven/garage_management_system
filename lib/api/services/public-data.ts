import { prisma } from "@/lib/prisma";
import {
  resolvePlaceImages,
  tourismPlaceInclude,
} from "@/lib/tourism-place-images";
import { toAbsoluteMediaUrl } from "@/lib/api/http";
import {
  tourismPlaceLocationLabel,
  tourismPlaceMapsUrl,
} from "@/lib/api/services/tourism-place-cards";

function normalizeLocationString(location: unknown): string | null {
  if (typeof location === "string") {
    const t = location.trim();
    return t || null;
  }
  return null;
}

export async function fetchPublicSlider(baseUrl: string) {
  const rows = await prisma.tourismSliderSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      sortOrder: true,
      isActive: true,
    },
  });
  return rows.map((r) => ({
    ...r,
    imageUrl: toAbsoluteMediaUrl(r.imageUrl, baseUrl) ?? r.imageUrl,
  }));
}

export async function fetchPublicTourismPlaces(baseUrl: string) {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: tourismPlaceInclude,
    take: 200,
  });
  return rows.map((p) => {
    const images = resolvePlaceImages(p)
      .map((u) => toAbsoluteMediaUrl(u, baseUrl))
      .filter((u): u is string => Boolean(u));
    const cityName = p.city?.name ?? null;
    const cityRegion = p.city?.region ?? null;
    const governorate = p.governorate ?? null;
    const detailPath = `/tourism-places/${p.id}`;
    return {
      id: p.id,
      name: p.name,
      governorate,
      description: p.description,
      descriptionCard: p.description?.trim() || "بدون وصف",
      address: p.address,
      location: p.location,
      imageUrl: images[0] ?? null,
      images,
      imageCount: images.length,
      cityId: p.cityId,
      cityName,
      cityRegion,
      locationLabel: tourismPlaceLocationLabel({
        governorate,
        cityName,
        cityRegion,
      }),
      mapsUrl: tourismPlaceMapsUrl(normalizeLocationString(p.location)),
      detailPath,
      detailUrl: `${baseUrl.replace(/\/$/, "")}${detailPath}`,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

export async function fetchPublicTourismPlaceById(
  placeId: string,
  baseUrl: string
) {
  const p = await prisma.tourismPlace.findFirst({
    where: { id: placeId, isActive: true, approvalStatus: "APPROVED" },
    include: tourismPlaceInclude,
  });
  if (!p) return null;
  const images = resolvePlaceImages(p)
    .map((u) => toAbsoluteMediaUrl(u, baseUrl))
    .filter((u): u is string => Boolean(u));
  const cityName = p.city?.name ?? null;
  const cityRegion = p.city?.region ?? null;
  const governorate = p.governorate ?? null;
  const location = normalizeLocationString(p.location);
  const address = typeof p.address === "string" ? p.address.trim() || null : null;
  const detailPath = `/tourism-places/${p.id}`;

  return {
    id: p.id,
    name: p.name,
    governorate,
    description: p.description,
    descriptionCard: p.description?.trim() || "بدون وصف",
    address,
    location,
    imageUrl: images[0] ?? null,
    images,
    imageCount: images.length,
    cityId: p.cityId,
    cityName,
    cityRegion,
    locationLabel: tourismPlaceLocationLabel({
      governorate,
      cityName,
      cityRegion,
    }),
    mapsUrl: tourismPlaceMapsUrl(location),
    detailPath,
    detailUrl: `${baseUrl.replace(/\/$/, "")}${detailPath}`,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function fetchActiveCities() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ country: "asc" }, { name: "asc" }],
    select: { id: true, name: true, country: true, region: true, isActive: true },
  });
}

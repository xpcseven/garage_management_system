import { deleteImage } from "@/lib/deleteImage";
import { storeImageFile, storeImagesFromFormData } from "@/lib/image-storage";
import { prisma } from "@/lib/prisma";

export type TourismPlaceImageRecord = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type PlaceWithImages = {
  imageUrl: string | null;
  images?: TourismPlaceImageRecord[];
};

export function resolvePlaceImages(place: PlaceWithImages): string[] {
  const fromTable = (place.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.imageUrl);
  if (fromTable.length > 0) return fromTable;
  if (place.imageUrl) return [place.imageUrl];
  return [];
}

export function parseImageUrlsJson(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function resolveImageUrlsFromFormData(
  formData: FormData,
  imageUrlsFromClient?: string[]
): Promise<string[]> {
  const urls: string[] = [];

  if (imageUrlsFromClient?.length) {
    urls.push(...imageUrlsFromClient.filter(Boolean));
  }

  const fromJson = parseImageUrlsJson(String(formData.get("imageUrls") ?? ""));
  for (const u of fromJson) {
    if (!urls.includes(u)) urls.push(u);
  }

  const uploadResults = await storeImagesFromFormData(formData, "placeImages");
  for (const r of uploadResults) {
    if (r.success && !urls.includes(r.path)) urls.push(r.path);
  }

  if (urls.length > 0) return urls;

  const legacy = String(formData.get("imageUrl") ?? "").trim();
  if (legacy) return [legacy];

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const uploaded = await storeImageFile(file);
    if (uploaded.success) return [uploaded.path];
  }

  return [];
}

export async function deleteUploadedImageSafe(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  try {
    await deleteImage(url);
  } catch {
    /* ignore */
  }
}

export async function syncTourismPlaceImages(
  placeId: string,
  targetUrls: string[]
) {
  const existing = await prisma.tourismPlaceImage.findMany({
    where: { tourismPlaceId: placeId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(targetUrls);

  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.tourismPlaceImage.delete({ where: { id: img.id } });
      await deleteUploadedImageSafe(img.imageUrl);
    }
  }

  const refreshed = await prisma.tourismPlaceImage.findMany({
    where: { tourismPlaceId: placeId },
  });
  const urlToId = new Map(refreshed.map((r) => [r.imageUrl, r.id]));

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    const existingId = urlToId.get(url);
    if (existingId) {
      await prisma.tourismPlaceImage.update({
        where: { id: existingId },
        data: { sortOrder: i },
      });
    } else {
      const created = await prisma.tourismPlaceImage.create({
        data: { tourismPlaceId: placeId, imageUrl: url, sortOrder: i },
      });
      urlToId.set(url, created.id);
    }
  }

  await prisma.tourismPlace.update({
    where: { id: placeId },
    data: { imageUrl: targetUrls[0] ?? null },
  });
}

export async function deleteAllTourismPlaceImages(placeId: string) {
  const rows = await prisma.tourismPlaceImage.findMany({
    where: { tourismPlaceId: placeId },
    select: { id: true, imageUrl: true },
  });
  for (const row of rows) {
    await deleteUploadedImageSafe(row.imageUrl);
  }
  await prisma.tourismPlaceImage.deleteMany({ where: { tourismPlaceId: placeId } });
}

export const tourismPlaceInclude = {
  city: { select: { id: true, name: true, region: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, imageUrl: true, sortOrder: true },
  },
};

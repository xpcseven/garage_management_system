import { deleteImage, deleteImages } from "@/lib/deleteImage";
import {
  collectUploadResults,
  storeImageFile,
  storeImagesFromFormData,
} from "@/lib/image-storage";
import { S3_FOLDERS } from "@/lib/s3-folders";
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
): Promise<{ urls: string[]; error?: string }> {
  const kept: string[] = [];

  if (imageUrlsFromClient?.length) {
    kept.push(...imageUrlsFromClient.filter(Boolean));
  }

  const fromJson = parseImageUrlsJson(String(formData.get("imageUrls") ?? ""));
  for (const u of fromJson) {
    if (!kept.includes(u)) kept.push(u);
  }

  const uploadResults = await storeImagesFromFormData(
    formData,
    "placeImages",
    S3_FOLDERS.tourismPlaces
  );
  const collected = collectUploadResults(uploadResults);
  if (collected.error) return { urls: kept, error: collected.error };

  const urls = [...kept];
  for (const u of collected.urls) {
    if (!urls.includes(u)) urls.push(u);
  }

  if (urls.length > 0) return { urls };

  const legacy = String(formData.get("imageUrl") ?? "").trim();
  if (legacy) return { urls: [legacy] };

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const uploaded = await storeImageFile(file, S3_FOLDERS.tourismPlaces);
    if (!uploaded.success) return { urls: [], error: uploaded.error };
    return { urls: [uploaded.path] };
  }

  return { urls: [] };
}

export async function deleteUploadedImageSafe(url: string | null | undefined) {
  if (!url?.trim()) return;
  await deleteImage(url);
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
  const removed: string[] = [];

  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.tourismPlaceImage.delete({ where: { id: img.id } });
      removed.push(img.imageUrl);
    }
  }

  await deleteImages(removed);

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
    select: { imageUrl: true },
  });
  const place = await prisma.tourismPlace.findUnique({
    where: { id: placeId },
    select: { imageUrl: true },
  });

  await prisma.tourismPlaceImage.deleteMany({
    where: { tourismPlaceId: placeId },
  });
  await deleteImages([...rows.map((r) => r.imageUrl), place?.imageUrl]);
}

export const MAX_TOURISM_PLACE_IMAGES = 5;

export const tourismPlaceInclude = {
  city: { select: { id: true, name: true, region: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, imageUrl: true, sortOrder: true },
  },
};

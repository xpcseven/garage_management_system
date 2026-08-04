import { deleteImage } from "@/lib/deleteImage";
import {
  isManagedUploadUrl,
  storeImagesFromFormData,
} from "@/lib/image-storage";
import { prisma } from "@/lib/prisma";

export const MAX_HOTEL_IMAGES = 10;

export type HotelImageRecord = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type HotelWithImages = {
  imageUrl: string | null;
  images?: HotelImageRecord[];
};

export function resolveHotelImages(hotel: HotelWithImages): string[] {
  const fromTable = (hotel.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.imageUrl);
  if (fromTable.length > 0) return fromTable.slice(0, MAX_HOTEL_IMAGES);
  if (hotel.imageUrl) return [hotel.imageUrl];
  return [];
}

export async function resolveHotelImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const urls = [...existingUrls.filter(Boolean)];

  const uploadResults = await storeImagesFromFormData(formData, "hotelImages");
  for (const r of uploadResults) {
    if (r.success && !urls.includes(r.path)) urls.push(r.path);
  }

  if (urls.length > MAX_HOTEL_IMAGES) {
    return {
      urls: urls.slice(0, MAX_HOTEL_IMAGES),
      error: `الحد الأقصى ${MAX_HOTEL_IMAGES} صور للفندق`,
    };
  }

  return { urls };
}

async function deleteUploadedImageSafe(url: string | null | undefined) {
  if (!isManagedUploadUrl(url)) return;
  try {
    await deleteImage(url!);
  } catch {
    /* ignore */
  }
}

export async function syncHotelImages(hotelId: string, targetUrls: string[]) {
  const limited = targetUrls.slice(0, MAX_HOTEL_IMAGES);
  const existing = await prisma.hotelImage.findMany({
    where: { hotelId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(limited);
  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.hotelImage.delete({ where: { id: img.id } });
      await deleteUploadedImageSafe(img.imageUrl);
    }
  }

  const refreshed = await prisma.hotelImage.findMany({ where: { hotelId } });
  const urlToId = new Map(refreshed.map((r) => [r.imageUrl, r.id]));

  for (let i = 0; i < limited.length; i++) {
    const url = limited[i];
    const existingId = urlToId.get(url);
    if (existingId) {
      await prisma.hotelImage.update({
        where: { id: existingId },
        data: { sortOrder: i },
      });
    } else {
      const created = await prisma.hotelImage.create({
        data: { hotelId, imageUrl: url, sortOrder: i },
      });
      urlToId.set(url, created.id);
    }
  }

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { imageUrl: limited[0] ?? null },
  });
}

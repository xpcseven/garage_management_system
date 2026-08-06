import { deleteImage, deleteImages } from "@/lib/deleteImage";
import {
  collectUploadResults,
  isManagedUploadUrl,
  storeImagesFromFormData,
} from "@/lib/image-storage";
import { S3_FOLDERS } from "@/lib/s3-folders";
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

/**
 * عند رفع صور جديدة → استبدال كامل (القديمة تُحذف من S3 عبر sync).
 * بدون ملفات جديدة → الإبقاء على الحالية.
 */
export async function resolveHotelImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const uploadResults = await storeImagesFromFormData(
    formData,
    "hotelImages",
    S3_FOLDERS.hotels
  );
  const collected = collectUploadResults(uploadResults);
  if (collected.error) {
    return { urls: existingUrls, error: collected.error };
  }

  if (collected.urls.length > 0) {
    const urls = collected.urls.slice(0, MAX_HOTEL_IMAGES);
    if (collected.urls.length > MAX_HOTEL_IMAGES) {
      return {
        urls,
        error: `الحد الأقصى ${MAX_HOTEL_IMAGES} صور للفندق`,
      };
    }
    return { urls };
  }

  return { urls: existingUrls.filter(Boolean) };
}

export async function syncHotelImages(hotelId: string, targetUrls: string[]) {
  const limited = targetUrls.slice(0, MAX_HOTEL_IMAGES);
  const existing = await prisma.hotelImage.findMany({
    where: { hotelId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(limited);
  const removed: string[] = [];

  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.hotelImage.delete({ where: { id: img.id } });
      removed.push(img.imageUrl);
    }
  }

  // احذف من AWS الصور التي لم تعد مستخدمة
  await deleteImages(removed);

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

/** حذف كل صور الفندق من DB + AWS */
export async function deleteAllHotelImages(hotelId: string) {
  const rows = await prisma.hotelImage.findMany({
    where: { hotelId },
    select: { imageUrl: true },
  });
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { imageUrl: true },
  });

  await prisma.hotelImage.deleteMany({ where: { hotelId } });
  await deleteImages([
    ...rows.map((r) => r.imageUrl),
    hotel?.imageUrl,
  ]);
}

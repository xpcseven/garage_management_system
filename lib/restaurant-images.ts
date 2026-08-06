import { deleteImages } from "@/lib/deleteImage";
import {
  collectUploadResults,
  storeImagesFromFormData,
} from "@/lib/image-storage";
import { S3_FOLDERS } from "@/lib/s3-folders";
import { prisma } from "@/lib/prisma";

export const MAX_RESTAURANT_IMAGES = 10;

export type RestaurantImageRecord = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type RestaurantWithImages = {
  imageUrl: string | null;
  images?: RestaurantImageRecord[];
};

export function resolveRestaurantImages(
  restaurant: RestaurantWithImages
): string[] {
  const fromTable = (restaurant.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.imageUrl);
  if (fromTable.length > 0) return fromTable.slice(0, MAX_RESTAURANT_IMAGES);
  if (restaurant.imageUrl) return [restaurant.imageUrl];
  return [];
}

/** رفع جديد → استبدال؛ بدون رفع → إبقاء الحالية */
export async function resolveRestaurantImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const uploadResults = await storeImagesFromFormData(
    formData,
    "restaurantImages",
    S3_FOLDERS.restaurants
  );
  const collected = collectUploadResults(uploadResults);
  if (collected.error) {
    return { urls: existingUrls, error: collected.error };
  }

  if (collected.urls.length > 0) {
    const urls = collected.urls.slice(0, MAX_RESTAURANT_IMAGES);
    if (collected.urls.length > MAX_RESTAURANT_IMAGES) {
      return {
        urls,
        error: `الحد الأقصى ${MAX_RESTAURANT_IMAGES} صور للمطعم`,
      };
    }
    return { urls };
  }

  return { urls: existingUrls.filter(Boolean) };
}

export async function syncRestaurantImages(
  restaurantId: string,
  targetUrls: string[]
) {
  const limited = targetUrls.slice(0, MAX_RESTAURANT_IMAGES);
  const existing = await prisma.restaurantImage.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(limited);
  const removed: string[] = [];

  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.restaurantImage.delete({ where: { id: img.id } });
      removed.push(img.imageUrl);
    }
  }

  await deleteImages(removed);

  const refreshed = await prisma.restaurantImage.findMany({
    where: { restaurantId },
  });
  const urlToId = new Map(refreshed.map((r) => [r.imageUrl, r.id]));

  for (let i = 0; i < limited.length; i++) {
    const url = limited[i];
    const existingId = urlToId.get(url);
    if (existingId) {
      await prisma.restaurantImage.update({
        where: { id: existingId },
        data: { sortOrder: i },
      });
    } else {
      const created = await prisma.restaurantImage.create({
        data: { restaurantId, imageUrl: url, sortOrder: i },
      });
      urlToId.set(url, created.id);
    }
  }

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { imageUrl: limited[0] ?? null },
  });
}

export async function deleteAllRestaurantImages(restaurantId: string) {
  const rows = await prisma.restaurantImage.findMany({
    where: { restaurantId },
    select: { imageUrl: true },
  });
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { imageUrl: true },
  });

  await prisma.restaurantImage.deleteMany({ where: { restaurantId } });
  await deleteImages([
    ...rows.map((r) => r.imageUrl),
    restaurant?.imageUrl,
  ]);
}

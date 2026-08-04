import { deleteImage } from "@/lib/deleteImage";
import {
  isManagedUploadUrl,
  storeImagesFromFormData,
} from "@/lib/image-storage";
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

export async function resolveRestaurantImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const urls = [...existingUrls.filter(Boolean)];

  const uploadResults = await storeImagesFromFormData(
    formData,
    "restaurantImages"
  );
  for (const r of uploadResults) {
    if (r.success && !urls.includes(r.path)) urls.push(r.path);
  }

  if (urls.length > MAX_RESTAURANT_IMAGES) {
    return {
      urls: urls.slice(0, MAX_RESTAURANT_IMAGES),
      error: `الحد الأقصى ${MAX_RESTAURANT_IMAGES} صور للمطعم`,
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
  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.restaurantImage.delete({ where: { id: img.id } });
      await deleteUploadedImageSafe(img.imageUrl);
    }
  }

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

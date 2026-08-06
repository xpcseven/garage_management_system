import { deleteImages } from "@/lib/deleteImage";
import {
  collectUploadResults,
  storeImagesFromFormData,
} from "@/lib/image-storage";
import { S3_FOLDERS } from "@/lib/s3-folders";
import { prisma } from "@/lib/prisma";

export const MAX_FARM_IMAGES = 10;

export type FarmImageRecord = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type FarmWithImages = {
  imageUrl: string | null;
  images?: FarmImageRecord[];
};

export function resolveFarmImages(farm: FarmWithImages): string[] {
  const fromTable = (farm.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.imageUrl);
  if (fromTable.length > 0) return fromTable.slice(0, MAX_FARM_IMAGES);
  if (farm.imageUrl) return [farm.imageUrl];
  return [];
}

/** رفع جديد → استبدال؛ بدون رفع → إبقاء الحالية */
export async function resolveFarmImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const uploadResults = await storeImagesFromFormData(
    formData,
    "farmImages",
    S3_FOLDERS.farms
  );
  const collected = collectUploadResults(uploadResults);
  if (collected.error) {
    return { urls: existingUrls, error: collected.error };
  }

  if (collected.urls.length > 0) {
    const urls = collected.urls.slice(0, MAX_FARM_IMAGES);
    if (collected.urls.length > MAX_FARM_IMAGES) {
      return {
        urls,
        error: `الحد الأقصى ${MAX_FARM_IMAGES} صور للمزرعة`,
      };
    }
    return { urls };
  }

  return { urls: existingUrls.filter(Boolean) };
}

export async function syncFarmImages(farmId: string, targetUrls: string[]) {
  const limited = targetUrls.slice(0, MAX_FARM_IMAGES);
  const existing = await prisma.farmImage.findMany({
    where: { farmId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(limited);
  const removed: string[] = [];

  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.farmImage.delete({ where: { id: img.id } });
      removed.push(img.imageUrl);
    }
  }

  await deleteImages(removed);

  const refreshed = await prisma.farmImage.findMany({ where: { farmId } });
  const urlToId = new Map(refreshed.map((r) => [r.imageUrl, r.id]));

  for (let i = 0; i < limited.length; i++) {
    const url = limited[i];
    const existingId = urlToId.get(url);
    if (existingId) {
      await prisma.farmImage.update({
        where: { id: existingId },
        data: { sortOrder: i },
      });
    } else {
      const created = await prisma.farmImage.create({
        data: { farmId, imageUrl: url, sortOrder: i },
      });
      urlToId.set(url, created.id);
    }
  }

  await prisma.farm.update({
    where: { id: farmId },
    data: { imageUrl: limited[0] ?? null },
  });
}

export async function deleteAllFarmImages(farmId: string) {
  const rows = await prisma.farmImage.findMany({
    where: { farmId },
    select: { imageUrl: true },
  });
  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    select: { imageUrl: true },
  });

  await prisma.farmImage.deleteMany({ where: { farmId } });
  await deleteImages([...rows.map((r) => r.imageUrl), farm?.imageUrl]);
}

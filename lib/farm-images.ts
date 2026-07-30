import { deleteImage } from "@/lib/deleteImage";
import { storeImagesFromFormData } from "@/lib/image-storage";
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

export async function resolveFarmImageUrlsFromFormData(
  formData: FormData,
  existingUrls: string[] = []
): Promise<{ urls: string[]; error?: string }> {
  const urls = [...existingUrls.filter(Boolean)];

  const uploadResults = await storeImagesFromFormData(formData, "farmImages");
  for (const r of uploadResults) {
    if (r.success && !urls.includes(r.path)) urls.push(r.path);
  }

  if (urls.length > MAX_FARM_IMAGES) {
    return {
      urls: urls.slice(0, MAX_FARM_IMAGES),
      error: `الحد الأقصى ${MAX_FARM_IMAGES} صور للمزرعة`,
    };
  }

  return { urls };
}

async function deleteUploadedImageSafe(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  try {
    await deleteImage(url);
  } catch {
    /* ignore */
  }
}

export async function syncFarmImages(farmId: string, targetUrls: string[]) {
  const limited = targetUrls.slice(0, MAX_FARM_IMAGES);
  const existing = await prisma.farmImage.findMany({
    where: { farmId },
    orderBy: { sortOrder: "asc" },
  });

  const targetSet = new Set(limited);
  for (const img of existing) {
    if (!targetSet.has(img.imageUrl)) {
      await prisma.farmImage.delete({ where: { id: img.id } });
      await deleteUploadedImageSafe(img.imageUrl);
    }
  }

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

"use server";

import { auth } from "@/auth";
import { deleteImage } from "@/lib/deleteImage";
import { prisma } from "@/lib/prisma";
import { canManageTourismSlider } from "@/lib/permissions";
import { uploadImage } from "@/lib/uploadImage";
import { revalidatePath } from "next/cache";

export type TourismSliderSlideRow = {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function mapRow(
  s: Awaited<ReturnType<typeof prisma.tourismSliderSlide.findMany>>[number]
): TourismSliderSlideRow {
  return {
    id: s.id,
    title: s.title,
    imageUrl: s.imageUrl,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
  };
}

export async function getPublicTourismSliderSlides(): Promise<
  TourismSliderSlideRow[]
> {
  try {
    const rows = await prisma.tourismSliderSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 50,
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function getTourismSliderSlides(): Promise<TourismSliderSlideRow[]> {
  const session = await auth();
  if (!session?.user || !canManageTourismSlider(session.user.role)) return [];

  const rows = await prisma.tourismSliderSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 100,
  });
  return rows.map(mapRow);
}

export async function createTourismSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageTourismSlider(session.user.role)) {
    return { error: "لا تملك صلاحية إضافة صورة للسلايدر" };
  }

  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  const isActive = formData.get("isActive") === "on";

  if (!title) return { error: "العنوان مطلوب" };
  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    return { error: "ترتيب العرض غير صالح" };
  }

  try {
    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
    }
    if (!imageUrl) return { error: "الصورة مطلوبة" };

    await prisma.tourismSliderSlide.create({
      data: { title, imageUrl, sortOrder, isActive },
    });
    revalidatePath("/tourism-slider");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "تعذر الإضافة" };
  }
}

export async function updateTourismSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageTourismSlider(session.user.role)) {
    return { error: "لا تملك صلاحية التعديل" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || undefined;
  const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  const isActive = formData.get("isActive") === "on";

  if (!id) return { error: "معرّف غير صالح" };
  if (!title) return { error: "العنوان مطلوب" };
  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    return { error: "ترتيب العرض غير صالح" };
  }

  try {
    const existing = await prisma.tourismSliderSlide.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existing) return { error: "الشريحة غير موجودة" };

    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;

      if (existing.imageUrl.startsWith("/uploads/")) {
        try {
          await deleteImage(existing.imageUrl);
        } catch {
          // ignore cleanup errors
        }
      }
    }

    await prisma.tourismSliderSlide.update({
      where: { id },
      data: {
        title,
        sortOrder,
        isActive,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
    revalidatePath("/tourism-slider");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export async function deleteTourismSliderSlide(id: string) {
  const session = await auth();
  if (!session?.user || !canManageTourismSlider(session.user.role)) {
    return { error: "لا تملك صلاحية الحذف" };
  }

  try {
    const existing = await prisma.tourismSliderSlide.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existing) return { error: "الشريحة غير موجودة" };

    if (existing.imageUrl.startsWith("/uploads/")) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        // ignore cleanup errors
      }
    }

    await prisma.tourismSliderSlide.delete({ where: { id } });
    revalidatePath("/tourism-slider");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "تعذر الحذف" };
  }
}

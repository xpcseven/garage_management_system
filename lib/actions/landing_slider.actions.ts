"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_LANDING_SLIDER,
  type LandingSliderCard,
} from "@/lib/constants/landing-slider";
import { canManageLandingSlider } from "@/lib/permissions";
import { deleteImage } from "@/lib/deleteImage";
import { uploadImage } from "@/lib/uploadImage";
import { revalidatePath } from "next/cache";

export type LandingSliderSlideRow = {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function mapRow(
  row: {
    id: string;
    title: string;
    imageUrl: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
  }
): LandingSliderSlideRow {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

function mergeWithDefault(slides: LandingSliderCard[]): LandingSliderCard[] {
  return [
    {
      src: DEFAULT_LANDING_SLIDER.src,
      title: DEFAULT_LANDING_SLIDER.title,
      isDefault: true,
    },
    ...slides,
  ];
}

/** شرائح السلايدر للصفحة الرئيسية (عام) */
export async function getPublicLandingSliderSlides(): Promise<LandingSliderCard[]> {
  const rows = await prisma.tourismSliderSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, imageUrl: true },
  });

  const custom = rows.map((r) => ({
    id: r.id,
    src: r.imageUrl,
    title: r.title,
  }));

  return mergeWithDefault(custom);
}

/** إدارة الشرائح (مشرف عام) */
export async function getLandingSliderSlides(): Promise<LandingSliderSlideRow[]> {
  const session = await auth();
  if (!session?.user || !canManageLandingSlider(session.user.role)) {
    return [];
  }

  const rows = await prisma.tourismSliderSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows.map(mapRow);
}

export async function createLandingSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageLandingSlider(session.user.role)) {
    return { error: "لا تملك صلاحية الإضافة" };
  }

  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10) || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!title) return { error: "عنوان الشريحة مطلوب" };

  try {
    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
    }

    if (!imageUrl) return { error: "صورة الشريحة مطلوبة" };

    await prisma.tourismSliderSlide.create({
      data: { title, imageUrl, sortOrder, isActive },
    });

    revalidatePath("/");
    revalidatePath("/landing-slider");
    return { success: true };
  } catch {
    return { error: "تعذر الإنشاء" };
  }
}

export async function updateLandingSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageLandingSlider(session.user.role)) {
    return { error: "لا تملك صلاحية التعديل" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || undefined;
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = sortOrderRaw
    ? Number.parseInt(sortOrderRaw, 10) || 0
    : undefined;
  const isActive = formData.get("isActive") === "true";

  if (!id || !title) return { error: "بيانات غير كاملة" };

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
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/landing-slider");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export async function deleteLandingSliderSlide(id: string) {
  const session = await auth();
  if (!session?.user || !canManageLandingSlider(session.user.role)) {
    return { error: "لا تملك صلاحية الحذف" };
  }

  if (!id) return { error: "معرّف غير صالح" };

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

    revalidatePath("/");
    revalidatePath("/landing-slider");
    return { success: true };
  } catch {
    return { error: "تعذر الحذف" };
  }
}

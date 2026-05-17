"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageHomeSlider } from "@/lib/permissions";
import { uploadImage } from "@/lib/uploadImage";
import { deleteImage } from "@/lib/deleteImage";
import { revalidatePath } from "next/cache";

export type HomeSliderSlideRow = {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const SLIDER_PATHS = ["/", "/home-slider"];

function revalidateSliderPaths() {
  for (const path of SLIDER_PATHS) {
    revalidatePath(path);
  }
}

/** شرائح السلايدر النشطة للصفحة الرئيسية (عام) */
export async function getPublicHomeSliderSlides(): Promise<HomeSliderSlideRow[]> {
  try {
    const rows = await prisma.tourismSliderSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        sortOrder: true,
        isActive: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}

export async function getHomeSliderSlides(): Promise<HomeSliderSlideRow[]> {
  const session = await auth();
  if (!session?.user || !canManageHomeSlider(session.user.role)) {
    return [];
  }
  const rows = await prisma.tourismSliderSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      sortOrder: true,
      isActive: true,
    },
  });
  return rows;
}

export async function createHomeSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHomeSlider(session.user.role)) {
    return { error: "لا تملك صلاحية إضافة شريحة للسلايدر" };
  }

  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!title) return { error: "العنوان مطلوب" };

  const file = formData.get("file");
  try {
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
    revalidateSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر إضافة الشريحة" };
  }
}

export async function updateHomeSliderSlide(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHomeSlider(session.user.role)) {
    return { error: "لا تملك صلاحية التعديل" };
  }

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const imageUrlFromForm = String(formData.get("imageUrl") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") === "true";

  if (!id || !title) return { error: "بيانات غير كاملة" };

  const file = formData.get("file");
  try {
    const existing = await prisma.tourismSliderSlide.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existing) return { error: "الشريحة غير موجودة" };

    let imageUrl: string | undefined = imageUrlFromForm || undefined;

    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
      if (existing.imageUrl.startsWith("/uploads/")) {
        try {
          await deleteImage(existing.imageUrl);
        } catch {
          /* ignore */
        }
      }
    } else if (
      imageUrl &&
      existing.imageUrl &&
      imageUrl !== existing.imageUrl &&
      existing.imageUrl.startsWith("/uploads/")
    ) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        /* ignore */
      }
    }

    await prisma.tourismSliderSlide.update({
      where: { id },
      data: {
        title,
        sortOrder,
        isActive,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
    });
    revalidateSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export async function deleteHomeSliderSlide(id: string) {
  const session = await auth();
  if (!session?.user || !canManageHomeSlider(session.user.role)) {
    return { error: "لا تملك صلاحية الحذف" };
  }
  if (!id) return { error: "معرّف غير صالح" };

  try {
    const existing = await prisma.tourismSliderSlide.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existing) return { error: "الشريحة غير موجودة" };

    await prisma.tourismSliderSlide.delete({ where: { id } });

    if (existing.imageUrl.startsWith("/uploads/")) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        /* ignore */
      }
    }

    revalidateSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر الحذف" };
  }
}

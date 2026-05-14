"use server";

import { auth } from "@/auth";
import { deleteImage } from "@/lib/deleteImage";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/uploadImage";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/prisma/UserRole.enum";

export type HomeSliderImageRow = {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function mapHomeSliderImage(row: {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}): HomeSliderImageRow {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

function ensureSuperAdmin(
  session:
    | {
        user?: {
          role?: UserRole | string | null;
        } | null;
      }
    | null
    | undefined
) {
  return session?.user?.role === UserRole.SUPER_ADMIN;
}

function parseSortOrder(rawValue: FormDataEntryValue | null) {
  const parsed = Number(String(rawValue ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function revalidateHomeSliderPaths() {
  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/home-slider");
}

export async function getHomeSliderImages(): Promise<HomeSliderImageRow[]> {
  const session = await auth();
  if (!ensureSuperAdmin(session)) return [];

  const rows = await prisma.homeSliderImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(mapHomeSliderImage);
}

export async function getPublicHomeSliderImages(): Promise<HomeSliderImageRow[]> {
  const rows = await prisma.homeSliderImage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 20,
  });

  return rows.map(mapHomeSliderImage);
}

export async function hasConfiguredHomeSliderImages(): Promise<boolean> {
  const count = await prisma.homeSliderImage.count();
  return count > 0;
}

export async function createHomeSliderImage(formData: FormData) {
  const session = await auth();
  if (!ensureSuperAdmin(session)) {
    return { error: "لا تملك صلاحية إضافة صور السلايدر" };
  }

  const title = String(formData.get("title") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sortOrder = parseSortOrder(formData.get("sortOrder"));
  const isActive = formData.get("isActive") !== "false";

  if (!title) return { error: "عنوان الصورة مطلوب" };

  try {
    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
    }

    if (!imageUrl) return { error: "الصورة مطلوبة" };

    const { _max } = await prisma.homeSliderImage.aggregate({
      _max: { sortOrder: true },
    });

    await prisma.homeSliderImage.create({
      data: {
        title,
        imageUrl,
        sortOrder: sortOrder ?? (_max.sortOrder ?? -1) + 1,
        isActive,
      },
    });

    revalidateHomeSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر إضافة صورة السلايدر" };
  }
}

export async function updateHomeSliderImage(formData: FormData) {
  const session = await auth();
  if (!ensureSuperAdmin(session)) {
    return { error: "لا تملك صلاحية تعديل صور السلايدر" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const imageUrlFromForm = String(formData.get("imageUrl") ?? "").trim();
  let imageUrl: string | undefined = imageUrlFromForm || undefined;
  const sortOrder = parseSortOrder(formData.get("sortOrder"));
  const isActive = formData.get("isActive") !== "false";

  if (!id || !title) return { error: "بيانات غير مكتملة" };

  try {
    const existing = await prisma.homeSliderImage.findUnique({
      where: { id },
      select: { imageUrl: true, sortOrder: true },
    });

    if (!existing) return { error: "الصورة غير موجودة" };

    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
    }

    if (!imageUrl) {
      imageUrl = existing.imageUrl;
    }

    await prisma.homeSliderImage.update({
      where: { id },
      data: {
        title,
        imageUrl,
        sortOrder: sortOrder ?? existing.sortOrder,
        isActive,
      },
    });

    if (
      imageUrl !== existing.imageUrl &&
      existing.imageUrl.startsWith("/uploads/")
    ) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        // ignore cleanup errors to avoid blocking the update
      }
    }

    revalidateHomeSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر تعديل صورة السلايدر" };
  }
}

export async function deleteHomeSliderImage(id: string) {
  const session = await auth();
  if (!ensureSuperAdmin(session)) {
    return { error: "لا تملك صلاحية حذف صور السلايدر" };
  }

  if (!id) return { error: "المعرف غير صالح" };

  try {
    const existing = await prisma.homeSliderImage.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existing) return { error: "الصورة غير موجودة" };

    await prisma.homeSliderImage.delete({ where: { id } });

    if (existing.imageUrl.startsWith("/uploads/")) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        // ignore cleanup errors to avoid blocking the delete
      }
    }

    revalidateHomeSliderPaths();
    return { success: true };
  } catch {
    return { error: "تعذر حذف صورة السلايدر" };
  }
}

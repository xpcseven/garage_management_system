"use server";

import { auth } from "@/auth";
import { deleteImage } from "@/lib/deleteImage";
import { prisma } from "@/lib/prisma";
import { canManageTourismPlaces, canUsePassengerPortal } from "@/lib/permissions";
import { uploadImage } from "@/lib/uploadImage";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/prisma/UserRole.enum";

export type TourismPlaceRow = {
  id: string;
  name: string;
  governorate: string | null;
  description: string | null;
  address: string | null;
  location: string | null;
  imageUrl: string | null;
  cityId: string | null;
  cityName: string | null;
  cityRegion: string | null;
  ownerId: string;
  isActive: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: string | null;
  createdAt: string;
};

export async function getTourismPlaces(): Promise<TourismPlaceRow[]> {
  const session = await auth();
  if (!session?.user || !canManageTourismPlaces(session.user.role)) return [];

  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? {}
      : { ownerId: session.user.id };

  const rows = await prisma.tourismPlace.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: { city: { select: { id: true, name: true, region: true } } },
    take: 200,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

/** عرض الأماكن النشطة للمسافر (قراءة فقط) */
export async function getPublicTourismPlacesForPassenger(): Promise<
  TourismPlaceRow[]
> {
  const session = await auth();
  if (!session?.user || !canUsePassengerPortal(session.user.role)) return [];

  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: { city: { select: { id: true, name: true, region: true } } },
    take: 200,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

/** عرض الأماكن النشطة للعامة (بدون تسجيل دخول) */
export async function getPublicTourismPlacesForLanding(): Promise<
  TourismPlaceRow[]
> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: { city: { select: { id: true, name: true, region: true } } },
    take: 6,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

/** صفحة عامة: كل الأماكن النشطة بدون تسجيل دخول */
export async function getPublicTourismPlacesForGuest(): Promise<
  TourismPlaceRow[]
> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: { city: { select: { id: true, name: true, region: true } } },
    take: 200,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getPublicTourismPlaceByIdForPassenger(
  placeId: string
): Promise<TourismPlaceRow | null> {
  const session = await auth();
  if (!session?.user || !canUsePassengerPortal(session.user.role)) return null;

  const p = await prisma.tourismPlace.findFirst({
    where: { id: placeId, isActive: true, approvalStatus: "APPROVED" },
    include: { city: { select: { id: true, name: true, region: true } } },
  });
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  };
}

/** صفحة عامة: تفاصيل مكان نشط بالمعرف بدون تسجيل دخول */
export async function getPublicTourismPlaceByIdForGuest(
  placeId: string
): Promise<TourismPlaceRow | null> {
  const p = await prisma.tourismPlace.findFirst({
    where: { id: placeId, isActive: true, approvalStatus: "APPROVED" },
    include: { city: { select: { id: true, name: true, region: true } } },
  });
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function createTourismPlace(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageTourismPlaces(session.user.role)) {
    return { error: "لا تملك صلاحية إضافة مكان سياحي" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const governorate = String(formData.get("governorate") ?? "").trim() || null;
  const cityIdRaw = String(formData.get("cityId") ?? "").trim();
  const cityId = cityIdRaw || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  if (!name) return { error: "اسم المكان مطلوب" };

  if (cityId) {
    const ok = await prisma.city.findFirst({ where: { id: cityId } });
    if (!ok) return { error: "المدينة المختارة غير صالحة" };
  }

  try {
    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;
    }

    const autoApprove = session.user.role === UserRole.SUPER_ADMIN;
    await prisma.tourismPlace.create({
      data: {
        name,
        governorate,
        cityId,
        description,
        address,
        location,
        imageUrl,
        ownerId: session.user.id,
        isActive: true,
        approvalStatus: autoApprove ? "APPROVED" : "PENDING",
        reviewedAt: autoApprove ? new Date() : null,
      },
    });
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    return {
      success: true,
      pendingApproval: !autoApprove,
    };
  } catch {
    return { error: "تعذر الإنشاء" };
  }
}

export async function updateTourismPlace(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageTourismPlaces(session.user.role)) {
    return { error: "لا تملك صلاحية التعديل" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const governorate = String(formData.get("governorate") ?? "").trim() || null;
  const cityIdRaw = String(formData.get("cityId") ?? "").trim();
  const cityId = cityIdRaw || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const imageUrlFromForm = String(formData.get("imageUrl") ?? "").trim();
  let imageUrl: string | null | undefined = imageUrlFromForm || undefined;
  const isActive = formData.get("isActive") === "true";

  if (!id || !name) return { error: "بيانات غير كاملة" };

  if (cityId) {
    const ok = await prisma.city.findFirst({ where: { id: cityId } });
    if (!ok) return { error: "المدينة المختارة غير صالحة" };
  }

  try {
    const existing = await prisma.tourismPlace.findUnique({
      where: { id },
      select: { ownerId: true, imageUrl: true },
    });
    if (!existing) return { error: "المكان غير موجود" };
    if (
      session.user.role !== UserRole.SUPER_ADMIN &&
      existing.ownerId !== session.user.id
    ) {
      return { error: "لا يمكنك تعديل هذا المكان" };
    }

    const file = formData.get("file");
    if (!imageUrl && file instanceof File && file.size > 0) {
      const imageFd = new FormData();
      imageFd.set("file", file);
      const uploaded = await uploadImage(imageFd);
      imageUrl = uploaded.path;

      if (existing.imageUrl?.startsWith("/uploads/")) {
        try {
          await deleteImage(existing.imageUrl);
        } catch {
          // ignore file cleanup errors to avoid blocking update
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
        // ignore file cleanup errors to avoid blocking update
      }
    }

    await prisma.tourismPlace.update({
      where: { id },
      data: {
        name,
        governorate,
        cityId,
        description,
        address,
        location,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        isActive,
        ...(session.user.role === UserRole.SUPER_ADMIN
          ? {
              approvalStatus:
                isActive ? "APPROVED" : "REJECTED",
              reviewedAt: new Date(),
            }
          : {
              approvalStatus: "PENDING",
              reviewedAt: null,
            }),
      },
    });
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export async function deleteTourismPlace(id: string) {
  const session = await auth();
  if (!session?.user || !canManageTourismPlaces(session.user.role)) {
    return { error: "لا تملك صلاحية الحذف" };
  }

  try {
    const existing = await prisma.tourismPlace.findUnique({
      where: { id },
      select: { ownerId: true, imageUrl: true },
    });
    if (!existing) return { error: "المكان غير موجود" };
    if (
      session.user.role !== UserRole.SUPER_ADMIN &&
      existing.ownerId !== session.user.id
    ) {
      return { error: "لا يمكنك حذف هذا المكان" };
    }

    if (existing.imageUrl?.startsWith("/uploads/")) {
      try {
        await deleteImage(existing.imageUrl);
      } catch {
        // ignore file cleanup errors to avoid blocking delete
      }
    }

    await prisma.tourismPlace.delete({ where: { id } });
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الحذف" };
  }
}

export async function getTourismPlaceRequests(): Promise<TourismPlaceRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) return [];

  const rows = await prisma.tourismPlace.findMany({
    where: { approvalStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { city: { select: { id: true, name: true, region: true } } },
    take: 300,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: p.imageUrl ?? null,
    cityId: p.cityId ?? null,
    cityName: p.city?.name ?? null,
    cityRegion: p.city?.region ?? null,
    ownerId: p.ownerId,
    isActive: p.isActive,
    approvalStatus: p.approvalStatus,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function approveTourismPlaceRequest(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    return { error: "لا تملك صلاحية الموافقة" };
  }
  try {
    await prisma.tourismPlace.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        isActive: true,
        reviewedAt: new Date(),
      },
    });
    revalidatePath("/tourism-requests");
    revalidatePath("/tourism_places");
    revalidatePath("/tourism-places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر تنفيذ الموافقة" };
  }
}

export async function rejectTourismPlaceRequest(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    return { error: "لا تملك صلاحية الرفض" };
  }
  try {
    await prisma.tourismPlace.update({
      where: { id },
      data: {
        approvalStatus: "REJECTED",
        isActive: false,
        reviewedAt: new Date(),
      },
    });
    revalidatePath("/tourism-requests");
    revalidatePath("/tourism_places");
    revalidatePath("/tourism-places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر تنفيذ الرفض" };
  }
}


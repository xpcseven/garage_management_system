"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteAllTourismPlaceImages,
  MAX_TOURISM_PLACE_IMAGES,
  resolveImageUrlsFromFormData,
  resolvePlaceImages,
  syncTourismPlaceImages,
  tourismPlaceInclude,
} from "@/lib/tourism-place-images";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/prisma/UserRole.enum";
import { notifyAllPassengers } from "@/lib/actions/notification.actions";
import {
  canManageTourismPlaces,
  canSuggestTourismPlaces,
  canUsePassengerPortal,
} from "@/lib/permissions";

export type TourismPlaceRow = {
  id: string;
  name: string;
  governorate: string | null;
  description: string | null;
  address: string | null;
  location: string | null;
  /** صورة الغلاف (الأولى) */
  imageUrl: string | null;
  /** جميع صور المكان */
  images: string[];
  cityId: string | null;
  cityName: string | null;
  cityRegion: string | null;
  ownerId: string;
  isActive: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: string | null;
  createdAt: string;
};

type PlaceDbRow = {
  id: string;
  name: string;
  governorate: string | null;
  description: string | null;
  address: string | null;
  location: string | null;
  imageUrl: string | null;
  cityId: string | null;
  ownerId: string;
  isActive: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: Date | null;
  createdAt: Date;
  city: { name: string; region: string | null } | null;
  images?: { id: string; imageUrl: string; sortOrder: number }[];
};

function mapTourismPlaceRow(p: PlaceDbRow): TourismPlaceRow {
  const images = resolvePlaceImages(p);
  return {
    id: p.id,
    name: p.name,
    governorate: p.governorate ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    location: p.location ?? null,
    imageUrl: images[0] ?? null,
    images,
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

function revalidateTourismPaths() {
  revalidatePath("/tourism_places");
  revalidatePath("/tourism-places");
  revalidatePath("/home");
  revalidatePath("/");
}

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
    include: tourismPlaceInclude,
    take: 200,
  });

  return rows.map(mapTourismPlaceRow);
}

/** عرض الأماكن النشطة للمسافر والزائر (قراءة فقط) */
export async function getPublicTourismPlacesForPassenger(): Promise<
  TourismPlaceRow[]
> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: tourismPlaceInclude,
    take: 200,
  });

  return rows.map(mapTourismPlaceRow);
}

/** عرض الأماكن النشطة للعامة (بدون تسجيل دخول) */
export async function getPublicTourismPlacesForLanding(): Promise<
  TourismPlaceRow[]
> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: tourismPlaceInclude,
    take: 6,
  });

  return rows.map(mapTourismPlaceRow);
}

/** صفحة عامة: كل الأماكن النشطة بدون تسجيل دخول */
export async function getPublicTourismPlacesForGuest(): Promise<
  TourismPlaceRow[]
> {
  const rows = await prisma.tourismPlace.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    include: tourismPlaceInclude,
    take: 200,
  });

  return rows.map(mapTourismPlaceRow);
}

export async function getPublicTourismPlaceByIdForPassenger(
  placeId: string
): Promise<TourismPlaceRow | null> {
  const p = await prisma.tourismPlace.findFirst({
    where: { id: placeId, isActive: true, approvalStatus: "APPROVED" },
    include: tourismPlaceInclude,
  });
  if (!p) return null;

  return mapTourismPlaceRow(p);
}

/** صفحة عامة: تفاصيل مكان نشط بالمعرف بدون تسجيل دخول */
export async function getPublicTourismPlaceByIdForGuest(
  placeId: string
): Promise<TourismPlaceRow | null> {
  const p = await prisma.tourismPlace.findFirst({
    where: { id: placeId, isActive: true, approvalStatus: "APPROVED" },
    include: tourismPlaceInclude,
  });
  if (!p) return null;

  return mapTourismPlaceRow(p);
}

export async function createTourismPlace(
  formData: FormData,
  imageUrlsFromClient?: string[]
) {
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

  if (!name) return { error: "اسم المكان مطلوب" };

  if (cityId) {
    const ok = await prisma.city.findFirst({ where: { id: cityId } });
    if (!ok) return { error: "المدينة المختارة غير صالحة" };
  }

  try {
    const resolved = await resolveImageUrlsFromFormData(
      formData,
      imageUrlsFromClient
    );
    if (resolved.error) return { error: resolved.error };
    const imageUrls = resolved.urls.slice(0, MAX_TOURISM_PLACE_IMAGES);
    const autoApprove = session.user.role === UserRole.SUPER_ADMIN;

    const place = await prisma.tourismPlace.create({
      data: {
        name,
        governorate,
        cityId,
        description,
        address,
        location,
        imageUrl: imageUrls[0] ?? null,
        ownerId: session.user.id,
        isActive: true,
        approvalStatus: autoApprove ? "APPROVED" : "PENDING",
        reviewedAt: autoApprove ? new Date() : null,
        images:
          imageUrls.length > 0
            ? {
                create: imageUrls.map((url, i) => ({
                  imageUrl: url,
                  sortOrder: i,
                })),
              }
            : undefined,
      },
    });
    revalidateTourismPaths();

    if (autoApprove) {
      try {
        await notifyAllPassengers({
          type: "NEW_TOURISM_PLACE",
          title: "مكان سياحي جديد",
          body: `أُضيف المعلم «${name}» إلى دليل المعالم.`,
          data: {
            placeId: place.id,
            href: `/passenger/tourism-places/${place.id}`,
          },
        });
      } catch (e) {
        console.error("notify passengers place", e);
      }
    }

    return {
      success: true,
      pendingApproval: !autoApprove,
    };
  } catch (e) {
    console.error("createTourismPlace", e);
    return {
      error:
        e instanceof Error ? e.message : "تعذر الإنشاء",
    };
  }
}

/** مسافر (USER): اقتراح مكان زاره — يظهر للعامة فقط بعد موافقة السوبر أدمن */
export async function suggestTourismPlaceByPassenger(
  formData: FormData,
  imageUrlsFromClient?: string[]
) {
  const session = await auth();
  if (!session?.user || !canSuggestTourismPlaces(session.user.role)) {
    return { error: "يجب تسجيل الدخول كمسافر لاقتراح مكان سياحي" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const governorate = String(formData.get("governorate") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!name) return { error: "اسم المكان مطلوب" };
  if (!description) return { error: "أضف وصفاً قصيراً عن المكان الذي زرته" };

  try {
    const resolved = await resolveImageUrlsFromFormData(
      formData,
      imageUrlsFromClient
    );
    if (resolved.error) return { error: resolved.error };
    const imageUrls = resolved.urls.slice(0, MAX_TOURISM_PLACE_IMAGES);
    if (imageUrls.length === 0) {
      return { error: "أضف صورة واحدة على الأقل (حتى 5 صور)" };
    }
    if (resolved.urls.length > MAX_TOURISM_PLACE_IMAGES) {
      return { error: `الحد الأقصى ${MAX_TOURISM_PLACE_IMAGES} صور للمكان` };
    }

    await prisma.tourismPlace.create({
      data: {
        name,
        governorate,
        description,
        address,
        location,
        imageUrl: imageUrls[0] ?? null,
        ownerId: session.user.id,
        isActive: true,
        approvalStatus: "PENDING",
        reviewedAt: null,
        images: {
          create: imageUrls.map((url, i) => ({
            imageUrl: url,
            sortOrder: i,
          })),
        },
      },
    });

    revalidatePath("/tourism-requests");
    revalidateTourismPaths();

    return {
      success: true,
      pendingApproval: true as const,
    };
  } catch (e) {
    console.error("suggestTourismPlaceByPassenger", e);
    return {
      error: e instanceof Error ? e.message : "تعذر إرسال الاقتراح",
    };
  }
}

export async function updateTourismPlace(
  formData: FormData,
  imageUrlsFromClient?: string[]
) {
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
  const isActive = formData.get("isActive") === "true";

  if (!id || !name) return { error: "بيانات غير كاملة" };

  if (cityId) {
    const ok = await prisma.city.findFirst({ where: { id: cityId } });
    if (!ok) return { error: "المدينة المختارة غير صالحة" };
  }

  try {
    const existing = await prisma.tourismPlace.findUnique({
      where: { id },
      select: { ownerId: true, imageUrl: true, approvalStatus: true },
    });
    if (!existing) return { error: "المكان غير موجود" };
    if (
      session.user.role !== UserRole.SUPER_ADMIN &&
      existing.ownerId !== session.user.id
    ) {
      return { error: "لا يمكنك تعديل هذا المكان" };
    }

    const resolved = await resolveImageUrlsFromFormData(
      formData,
      imageUrlsFromClient
    );
    if (resolved.error) return { error: resolved.error };
    const imageUrls = resolved.urls;

    await prisma.tourismPlace.update({
      where: { id },
      data: {
        name,
        governorate,
        cityId,
        description,
        address,
        location,
        isActive,
        ...(session.user.role === UserRole.SUPER_ADMIN
          ? {
              approvalStatus: isActive ? "APPROVED" : "REJECTED",
              reviewedAt: new Date(),
            }
          : {
              approvalStatus: "PENDING",
              reviewedAt: null,
            }),
      },
    });

    await syncTourismPlaceImages(id, imageUrls);

    revalidateTourismPaths();

    if (
      session.user.role === UserRole.SUPER_ADMIN &&
      isActive &&
      existing.approvalStatus !== "APPROVED"
    ) {
      try {
        await notifyAllPassengers({
          type: "NEW_TOURISM_PLACE",
          title: "مكان سياحي جديد",
          body: `أُضيف المعلم «${name}» إلى دليل المعالم.`,
          data: {
            placeId: id,
            href: `/passenger/tourism-places/${id}`,
          },
        });
      } catch (e) {
        console.error("notify passengers place update", e);
      }
    }

    return { success: true };
  } catch (e) {
    console.error("updateTourismPlace", e);
    return {
      error:
        e instanceof Error ? e.message : "تعذر التحديث",
    };
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

    await deleteAllTourismPlaceImages(id);

    await prisma.tourismPlace.delete({ where: { id } });
    revalidateTourismPaths();
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
    include: tourismPlaceInclude,
    take: 300,
  });

  return rows.map(mapTourismPlaceRow);
}

export async function approveTourismPlaceRequest(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    return { error: "لا تملك صلاحية الموافقة" };
  }
  try {
    const place = await prisma.tourismPlace.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        isActive: true,
        reviewedAt: new Date(),
      },
      select: { id: true, name: true },
    });
    revalidatePath("/tourism-requests");
    revalidateTourismPaths();

    try {
      await notifyAllPassengers({
        type: "NEW_TOURISM_PLACE",
        title: "مكان سياحي جديد",
        body: `أُضيف المعلم «${place.name}» إلى دليل المعالم.`,
        data: {
          placeId: place.id,
          href: `/passenger/tourism-places/${place.id}`,
        },
      });
    } catch (e) {
      console.error("notify passengers place approve", e);
    }

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
    revalidateTourismPaths();
    return { success: true };
  } catch {
    return { error: "تعذر تنفيذ الرفض" };
  }
}

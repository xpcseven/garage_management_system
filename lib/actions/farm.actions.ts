"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  BookingStatus,
  FarmOccasionType,
  TourismApprovalStatus,
} from "@prisma/client";
import { canManageFarms } from "@/lib/permissions";
import { FARM_OCCASION_LABELS } from "@/lib/farm-labels";
import {
  MAX_FARM_IMAGES,
  resolveFarmImageUrlsFromFormData,
  resolveFarmImages,
  syncFarmImages,
} from "@/lib/farm-images";
import { revalidatePath } from "next/cache";

export type FarmRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  imageUrl: string | null;
  capacity: number;
  amenities: string | null;
  isActive: boolean;
  approvalStatus: TourismApprovalStatus;
  images: string[];
};

export type FarmBookingRow = {
  id: string;
  farmName: string;
  guestName: string;
  startAt: string;
  endAt: string;
  occasionType: FarmOccasionType;
  occasionLabel: string;
  occasionOther: string | null;
  guests: number;
  status: BookingStatus;
  notes: string | null;
};

function parseOccasion(raw: string): FarmOccasionType {
  if (raw === "YOUTH" || raw === "WEDDING" || raw === "OTHER" || raw === "FAMILY") {
    return raw;
  }
  return FarmOccasionType.FAMILY;
}

export async function getFarmsForOwner(): Promise<FarmRow[]> {
  const session = await auth();
  if (!session?.user || !canManageFarms(session.user.role)) return [];
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false }
      : { isDeleted: false, ownerId: session.user.id };
  const list = await prisma.farm.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  return list.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    phone: f.phone,
    address: f.address,
    location: f.location,
    imageUrl: f.imageUrl,
    capacity: f.capacity,
    amenities: f.amenities,
    isActive: f.isActive,
    approvalStatus: f.approvalStatus,
    images: resolveFarmImages(f),
  }));
}

export async function createFarm(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageFarms(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!name || !address) return { error: "الاسم والعنوان مطلوبان" };

  const { urls, error: imgError } = await resolveFarmImageUrlsFromFormData(
    formData
  );
  if (imgError) {
    return { error: imgError };
  }

  const farm = await prisma.farm.create({
    data: {
      name,
      address,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      amenities: String(formData.get("amenities") ?? "").trim() || null,
      capacity: Number(formData.get("capacity") ?? 30) || 30,
      ownerId: session.user.id,
      approvalStatus:
        session.user.role === UserRole.SUPER_ADMIN
          ? TourismApprovalStatus.APPROVED
          : TourismApprovalStatus.PENDING,
      isActive: true,
      imageUrl: urls[0] ?? null,
    },
  });

  if (urls.length) {
    await syncFarmImages(farm.id, urls);
  }

  revalidatePath("/farms");
  revalidatePath("/passenger/farms");
  return { success: true };
}

export async function updateFarm(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageFarms(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const id = String(formData.get("id") ?? "");
  const row = await prisma.farm.findFirst({
    where: { id, isDeleted: false },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  if (!row) return { error: "المزرعة غير موجودة" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    row.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!name || !address) return { error: "الاسم والعنوان مطلوبان" };

  const keepExisting = formData.get("keepExistingImages") !== "false";
  const existingUrls = keepExisting ? resolveFarmImages(row) : [];
  const { urls, error: imgError } = await resolveFarmImageUrlsFromFormData(
    formData,
    existingUrls
  );
  if (imgError) {
    return { error: imgError };
  }

  await prisma.farm.update({
    where: { id },
    data: {
      name,
      address,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      amenities: String(formData.get("amenities") ?? "").trim() || null,
      capacity: Number(formData.get("capacity") ?? row.capacity) || row.capacity,
      isActive: formData.get("isActive") === "true",
      imageUrl: urls[0] ?? null,
    },
  });

  await syncFarmImages(id, urls);

  revalidatePath("/farms");
  revalidatePath("/passenger/farms");
  revalidatePath(`/passenger/farms/${id}`);
  return { success: true };
}

export async function getFarmBookingsForOwner(): Promise<FarmBookingRow[]> {
  const session = await auth();
  if (!session?.user || !canManageFarms(session.user.role)) return [];
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { farm: { isDeleted: false } }
      : { farm: { isDeleted: false, ownerId: session.user.id } };
  const list = await prisma.farmBooking.findMany({
    where,
    orderBy: { startAt: "desc" },
    include: {
      farm: { select: { name: true } },
      user: { select: { name: true } },
    },
  });
  return list.map((b) => ({
    id: b.id,
    farmName: b.farm.name,
    guestName: b.user.name,
    startAt: b.startAt.toISOString(),
    endAt: b.endAt.toISOString(),
    occasionType: b.occasionType,
    occasionLabel:
      b.occasionType === FarmOccasionType.OTHER && b.occasionOther
        ? b.occasionOther
        : FARM_OCCASION_LABELS[b.occasionType],
    occasionOther: b.occasionOther,
    guests: b.guests,
    status: b.status,
    notes: b.notes,
  }));
}

export async function updateFarmBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  const session = await auth();
  if (!session?.user || !canManageFarms(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const booking = await prisma.farmBooking.findUnique({
    where: { id: bookingId },
    include: { farm: true },
  });
  if (!booking) return { error: "الحجز غير موجود" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    booking.farm.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }
  await prisma.farmBooking.update({
    where: { id: bookingId },
    data: {
      status,
      cancelledAt: status === BookingStatus.CANCELLED ? new Date() : null,
    },
  });
  revalidatePath("/farm-bookings");
  return { success: true };
}

export async function getApprovedFarmsForPassenger() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];
  const list = await prisma.farm.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
    orderBy: { name: "asc" },
    include: {
      city: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  return list.map((f) => ({
    ...f,
    images: resolveFarmImages(f),
  }));
}

export async function getFarmDetailForPassenger(farmId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return null;

  const farm = await prisma.farm.findFirst({
    where: {
      id: farmId,
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
    include: {
      city: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: MAX_FARM_IMAGES,
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  if (!farm) return null;
  return {
    ...farm,
    images: resolveFarmImages(farm),
  };
}

export async function bookFarm(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح للمسافرين فقط" };
  }
  const farmId = String(formData.get("farmId") ?? "").trim();
  const startAt = new Date(String(formData.get("startAt") ?? ""));
  const endAt = new Date(String(formData.get("endAt") ?? ""));
  const occasionType = parseOccasion(String(formData.get("occasionType") ?? "FAMILY"));
  const occasionOther = String(formData.get("occasionOther") ?? "").trim() || null;
  const guests = Number(formData.get("guests") ?? 2);

  if (!farmId || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "أكمل فترة الحجز (من / إلى)" };
  }
  if (endAt <= startAt) {
    return { error: "وقت الانتهاء يجب أن يكون بعد وقت البداية" };
  }
  if (occasionType === FarmOccasionType.OTHER && !occasionOther) {
    return { error: "اذكر نوع المناسبة الأخرى" };
  }

  const farm = await prisma.farm.findFirst({
    where: {
      id: farmId,
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
  });
  if (!farm) return { error: "المزرعة غير متاحة" };
  if (guests > farm.capacity) {
    return { error: `السعة القصوى ${farm.capacity}` };
  }

  const overlap = await prisma.farmBooking.findFirst({
    where: {
      farmId,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  if (overlap) {
    return { error: "المزرعة محجوزة في هذه الفترة" };
  }

  await prisma.farmBooking.create({
    data: {
      userId: session.user.id,
      farmId,
      startAt,
      endAt,
      occasionType,
      occasionOther:
        occasionType === FarmOccasionType.OTHER ? occasionOther : null,
      guests: guests > 0 ? guests : 2,
      status: BookingStatus.PENDING,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/passenger/farms");
  revalidatePath(`/passenger/farms/${farmId}`);
  revalidatePath("/farm-bookings");
  return { success: true };
}

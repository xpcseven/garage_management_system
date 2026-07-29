"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { BookingStatus, TourismApprovalStatus } from "@prisma/client";
import { canManageRestaurants } from "@/lib/permissions";
import {
  MAX_RESTAURANT_IMAGES,
  resolveRestaurantImageUrlsFromFormData,
  resolveRestaurantImages,
  syncRestaurantImages,
} from "@/lib/restaurant-images";
import { revalidatePath } from "next/cache";

export type RestaurantRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  imageUrl: string | null;
  capacity: number;
  openHours: string | null;
  isActive: boolean;
  approvalStatus: TourismApprovalStatus;
  images: string[];
};

export type RestaurantBookingRow = {
  id: string;
  restaurantName: string;
  guestName: string;
  reservedAt: string;
  guests: number;
  status: BookingStatus;
  notes: string | null;
};

export async function getRestaurantsForOwner(): Promise<RestaurantRow[]> {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) return [];
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false }
      : { isDeleted: false, ownerId: session.user.id };
  const list = await prisma.restaurant.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  return list.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    phone: r.phone,
    address: r.address,
    location: r.location,
    imageUrl: r.imageUrl,
    capacity: r.capacity,
    openHours: r.openHours,
    isActive: r.isActive,
    approvalStatus: r.approvalStatus,
    images: resolveRestaurantImages(r),
  }));
}

export async function createRestaurant(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!name || !address) return { error: "الاسم والعنوان مطلوبان" };

  const { urls, error: imgError } = await resolveRestaurantImageUrlsFromFormData(
    formData
  );
  if (imgError) {
    return { error: imgError };
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      address,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      openHours: String(formData.get("openHours") ?? "").trim() || null,
      capacity: Number(formData.get("capacity") ?? 20) || 20,
      ownerId: session.user.id,
      approvalStatus: TourismApprovalStatus.APPROVED,
      isActive: true,
      imageUrl: urls[0] ?? null,
    },
  });

  if (urls.length) {
    await syncRestaurantImages(restaurant.id, urls);
  }

  revalidatePath("/restaurants");
  revalidatePath("/passenger/restaurants");
  return { success: true };
}

export async function updateRestaurant(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const id = String(formData.get("id") ?? "");
  const row = await prisma.restaurant.findFirst({
    where: { id, isDeleted: false },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  if (!row) return { error: "المطعم غير موجود" };
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
  const existingUrls = keepExisting ? resolveRestaurantImages(row) : [];
  const { urls, error: imgError } =
    await resolveRestaurantImageUrlsFromFormData(formData, existingUrls);
  if (imgError) {
    return { error: imgError };
  }

  await prisma.restaurant.update({
    where: { id },
    data: {
      name,
      address,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      openHours: String(formData.get("openHours") ?? "").trim() || null,
      capacity: Number(formData.get("capacity") ?? row.capacity) || row.capacity,
      isActive: formData.get("isActive") === "true",
      imageUrl: urls[0] ?? null,
    },
  });

  await syncRestaurantImages(id, urls);

  revalidatePath("/restaurants");
  revalidatePath("/passenger/restaurants");
  revalidatePath(`/passenger/restaurants/${id}`);
  return { success: true };
}

export async function getRestaurantBookingsForOwner(): Promise<
  RestaurantBookingRow[]
> {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) return [];
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { restaurant: { isDeleted: false } }
      : { restaurant: { isDeleted: false, ownerId: session.user.id } };
  const list = await prisma.restaurantBooking.findMany({
    where,
    orderBy: { reservedAt: "desc" },
    include: {
      restaurant: { select: { name: true } },
      user: { select: { name: true } },
    },
  });
  return list.map((b) => ({
    id: b.id,
    restaurantName: b.restaurant.name,
    guestName: b.user.name,
    reservedAt: b.reservedAt.toISOString(),
    guests: b.guests,
    status: b.status,
    notes: b.notes,
  }));
}

export async function updateRestaurantBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const booking = await prisma.restaurantBooking.findUnique({
    where: { id: bookingId },
    include: { restaurant: true },
  });
  if (!booking) return { error: "الحجز غير موجود" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    booking.restaurant.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }
  await prisma.restaurantBooking.update({
    where: { id: bookingId },
    data: {
      status,
      cancelledAt: status === BookingStatus.CANCELLED ? new Date() : null,
    },
  });
  revalidatePath("/restaurant-bookings");
  return { success: true };
}

export async function getApprovedRestaurantsForPassenger() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];
  const list = await prisma.restaurant.findMany({
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
  return list.map((r) => ({
    ...r,
    images: resolveRestaurantImages(r),
  }));
}

export async function getRestaurantDetailForPassenger(restaurantId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return null;

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
    include: {
      city: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: MAX_RESTAURANT_IMAGES,
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  if (!restaurant) return null;
  return {
    ...restaurant,
    images: resolveRestaurantImages(restaurant),
  };
}

export async function bookRestaurant(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح للمسافرين فقط" };
  }
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();
  const reservedAt = new Date(String(formData.get("reservedAt") ?? ""));
  const guests = Number(formData.get("guests") ?? 2);
  if (!restaurantId || Number.isNaN(reservedAt.getTime())) {
    return { error: "أكمل بيانات الحجز" };
  }
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
  });
  if (!restaurant) return { error: "المطعم غير متاح" };
  if (guests > restaurant.capacity) {
    return { error: `السعة القصوى ${restaurant.capacity}` };
  }

  await prisma.restaurantBooking.create({
    data: {
      userId: session.user.id,
      restaurantId,
      reservedAt,
      guests: guests > 0 ? guests : 2,
      status: BookingStatus.PENDING,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/passenger/restaurants");
  revalidatePath(`/passenger/restaurants/${restaurantId}`);
  revalidatePath("/restaurant-bookings");
  return { success: true };
}

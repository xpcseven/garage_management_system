"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { BookingStatus, Prisma, TourismApprovalStatus } from "@prisma/client";
import { canManageRestaurants } from "@/lib/permissions";
import {
  MAX_RESTAURANT_IMAGES,
  resolveRestaurantImageUrlsFromFormData,
  resolveRestaurantImages,
  syncRestaurantImages,
} from "@/lib/restaurant-images";
import { storeImageFile } from "@/lib/image-storage";
import { deleteImage } from "@/lib/deleteImage";
import { S3_FOLDERS } from "@/lib/s3-folders";
import { revalidatePath } from "next/cache";
import { notifyAllPassengers } from "@/lib/actions/notification.actions";

export type RestaurantMenuItemRow = {
  id: string;
  restaurantId: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

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
  menuItems: RestaurantMenuItemRow[];
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

function parseMoney(raw: string): Prisma.Decimal | null {
  const n = Number(String(raw).replace(/,/g, "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return new Prisma.Decimal(n);
}

function mapMenuItem(item: {
  id: string;
  restaurantId: string;
  name: string;
  price: Prisma.Decimal | { toString(): string };
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}): RestaurantMenuItemRow {
  return {
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    price: item.price.toString(),
    imageUrl: item.imageUrl,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  };
}

function revalidateRestaurantPaths(restaurantId?: string) {
  revalidatePath("/restaurants");
  revalidatePath("/passenger/restaurants");
  if (restaurantId) {
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath(`/passenger/restaurants/${restaurantId}`);
  }
}

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
      menuItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
    menuItems: r.menuItems.map(mapMenuItem),
  }));
}

export async function getRestaurantForOwner(
  restaurantId: string
): Promise<RestaurantRow | null> {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) return null;
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { id: restaurantId, isDeleted: false }
      : { id: restaurantId, isDeleted: false, ownerId: session.user.id };
  const r = await prisma.restaurant.findFirst({
    where,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
      menuItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!r) return null;
  return {
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
    menuItems: r.menuItems.map(mapMenuItem),
  };
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
      approvalStatus:
        session.user.role === UserRole.SUPER_ADMIN
          ? TourismApprovalStatus.APPROVED
          : TourismApprovalStatus.PENDING,
      isActive: true,
      imageUrl: urls[0] ?? null,
    },
  });

  if (urls.length) {
    await syncRestaurantImages(restaurant.id, urls);
  }

  revalidatePath("/restaurants");
  revalidatePath("/passenger/restaurants");

  if (restaurant.approvalStatus === TourismApprovalStatus.APPROVED) {
    try {
      await notifyAllPassengers({
        type: "NEW_RESTAURANT",
        title: "مطعم جديد",
        body: `أُضيف مطعم «${restaurant.name}» ويمكنك حجز زيارة فيه.`,
        data: {
          restaurantId: restaurant.id,
          href: `/passenger/restaurants/${restaurant.id}`,
        },
      });
    } catch (e) {
      console.error("notify passengers restaurant", e);
    }
  }

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

  const existingUrls = resolveRestaurantImages(row);
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
  revalidatePath(`/restaurants/${id}`);
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
      menuItems: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  return list.map((r) => ({
    ...r,
    images: resolveRestaurantImages(r),
    menuItems: r.menuItems.map(mapMenuItem),
  }));
}

export async function getRestaurantDetailForPassenger(restaurantId: string) {
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
      menuItems: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!restaurant) return null;
  return {
    ...restaurant,
    images: resolveRestaurantImages(restaurant),
    menuItems: restaurant.menuItems.map(mapMenuItem),
  };
}

async function assertRestaurantOwnerAccess(restaurantId: string) {
  const session = await auth();
  if (!session?.user || !canManageRestaurants(session.user.role)) {
    return { error: "غير مصرح" as const, session: null, restaurant: null };
  }
  const restaurant = await prisma.restaurant.findFirst({
    where:
      session.user.role === UserRole.SUPER_ADMIN
        ? { id: restaurantId, isDeleted: false }
        : { id: restaurantId, isDeleted: false, ownerId: session.user.id },
  });
  if (!restaurant) {
    return { error: "المطعم غير موجود" as const, session, restaurant: null };
  }
  return { error: null, session, restaurant };
}

export async function createRestaurantMenuItem(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = parseMoney(String(formData.get("price") ?? ""));
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!restaurantId || !name) return { error: "اسم الصنف مطلوب" };
  if (!price) return { error: "السعر غير صالح" };

  const access = await assertRestaurantOwnerAccess(restaurantId);
  if (access.error) return { error: access.error };

  let imageUrl: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const uploaded = await storeImageFile(file, S3_FOLDERS.menu);
    if (!uploaded.success) return { error: uploaded.error };
    imageUrl = uploaded.path;
  }

  await prisma.restaurantMenuItem.create({
    data: {
      restaurantId,
      name,
      price,
      imageUrl,
      sortOrder,
      isActive,
    },
  });

  revalidateRestaurantPaths(restaurantId);
  return { success: true };
}

export async function updateRestaurantMenuItem(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = parseMoney(String(formData.get("price") ?? ""));
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") === "true";

  if (!id || !name) return { error: "بيانات غير كاملة" };
  if (!price) return { error: "السعر غير صالح" };

  const existing = await prisma.restaurantMenuItem.findUnique({
    where: { id },
  });
  if (!existing) return { error: "الصنف غير موجود" };

  const access = await assertRestaurantOwnerAccess(existing.restaurantId);
  if (access.error) return { error: access.error };

  let imageUrl = existing.imageUrl;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const uploaded = await storeImageFile(file, S3_FOLDERS.menu);
    if (!uploaded.success) return { error: uploaded.error };
    if (existing.imageUrl) {
      await deleteImage(existing.imageUrl);
    }
    imageUrl = uploaded.path;
  }

  await prisma.restaurantMenuItem.update({
    where: { id },
    data: {
      name,
      price,
      imageUrl,
      sortOrder,
      isActive,
    },
  });

  revalidateRestaurantPaths(existing.restaurantId);
  return { success: true };
}

export async function deleteRestaurantMenuItem(id: string) {
  if (!id) return { error: "معرّف غير صالح" };

  const existing = await prisma.restaurantMenuItem.findUnique({
    where: { id },
  });
  if (!existing) return { error: "الصنف غير موجود" };

  const access = await assertRestaurantOwnerAccess(existing.restaurantId);
  if (access.error) return { error: access.error };

  await prisma.restaurantMenuItem.delete({ where: { id } });
  if (existing.imageUrl) {
    await deleteImage(existing.imageUrl);
  }

  revalidateRestaurantPaths(existing.restaurantId);
  return { success: true };
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

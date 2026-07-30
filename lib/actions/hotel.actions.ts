"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  BookingStatus,
  HotelRoomType,
  Prisma,
  TourismApprovalStatus,
} from "@prisma/client";
import { canManageHotels } from "@/lib/permissions";
import {
  resolveHotelImageUrlsFromFormData,
  resolveHotelImages,
  syncHotelImages,
} from "@/lib/hotel-images";
import { revalidatePath } from "next/cache";

export type HotelRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  imageUrl: string | null;
  isActive: boolean;
  approvalStatus: TourismApprovalStatus;
  roomsCount: number;
  images: string[];
};

export type HotelRoomRow = {
  id: string;
  hotelId: string;
  hotelName: string;
  roomNumber: string;
  roomType: HotelRoomType;
  capacity: number;
  pricePerNight: string;
  amenities: string | null;
  isActive: boolean;
};

export type HotelBookingRow = {
  id: string;
  hotelName: string;
  roomNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  priceAtBooking: string;
};

function parseMoney(raw: string): Prisma.Decimal | null {
  const n = Number(String(raw).replace(/,/g, "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return new Prisma.Decimal(n);
}

export async function getHotelsForOwner(): Promise<HotelRow[]> {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) return [];
  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false }
      : { isDeleted: false, ownerId: session.user.id };
  const list = await prisma.hotel.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { rooms: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  return list.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    phone: h.phone,
    address: h.address,
    location: h.location,
    imageUrl: h.imageUrl,
    isActive: h.isActive,
    approvalStatus: h.approvalStatus,
    roomsCount: h._count.rooms,
    images: resolveHotelImages(h),
  }));
}

export async function createHotel(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "اسم الفندق مطلوب" };
  const address = String(formData.get("address") ?? "").trim();
  if (!address) return { error: "العنوان مطلوب" };

  const { urls, error: imgError } = await resolveHotelImageUrlsFromFormData(
    formData
  );
  if (imgError) return { error: imgError };

  const hotel = await prisma.hotel.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address,
      location: String(formData.get("location") ?? "").trim() || null,
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
    await syncHotelImages(hotel.id, urls);
  }

  revalidatePath("/hotels");
  revalidatePath("/passenger/hotels");
  return { success: true };
}

export async function updateHotel(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const id = String(formData.get("id") ?? "");
  const hotel = await prisma.hotel.findFirst({
    where: { id, isDeleted: false },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, sortOrder: true },
      },
    },
  });
  if (!hotel) return { error: "الفندق غير موجود" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    hotel.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!name || !address) return { error: "الاسم والعنوان مطلوبان" };

  const keepExisting = formData.get("keepExistingImages") !== "false";
  const existingUrls = keepExisting ? resolveHotelImages(hotel) : [];
  const { urls, error: imgError } = await resolveHotelImageUrlsFromFormData(
    formData,
    existingUrls
  );
  if (imgError) return { error: imgError };

  await prisma.hotel.update({
    where: { id },
    data: {
      name,
      address,
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      isActive: formData.get("isActive") === "true",
      imageUrl: urls[0] ?? null,
    },
  });

  await syncHotelImages(id, urls);

  revalidatePath("/hotels");
  revalidatePath("/passenger/hotels");
  revalidatePath(`/passenger/hotels/${id}`);
  return { success: true };
}

export async function getHotelRoomsForOwner(): Promise<HotelRoomRow[]> {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) return [];
  const hotelWhere =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false }
      : { isDeleted: false, ownerId: session.user.id };
  const rooms = await prisma.hotelRoom.findMany({
    where: { hotel: hotelWhere },
    orderBy: [{ hotelId: "asc" }, { roomNumber: "asc" }],
    include: { hotel: { select: { name: true } } },
  });
  return rooms.map((r) => ({
    id: r.id,
    hotelId: r.hotelId,
    hotelName: r.hotel.name,
    roomNumber: r.roomNumber,
    roomType: r.roomType,
    capacity: r.capacity,
    pricePerNight: r.pricePerNight.toString(),
    amenities: r.amenities,
    isActive: r.isActive,
  }));
}

export async function getHotelOptionsForRooms(): Promise<
  { id: string; name: string }[]
> {
  const hotels = await getHotelsForOwner();
  return hotels.map((h) => ({ id: h.id, name: h.name }));
}

export async function createHotelRoom(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const hotelId = String(formData.get("hotelId") ?? "").trim();
  const roomNumber = String(formData.get("roomNumber") ?? "").trim();
  const roomType = String(formData.get("roomType") ?? "DOUBLE") as HotelRoomType;
  const capacity = Number(formData.get("capacity") ?? 2);
  const price = parseMoney(String(formData.get("pricePerNight") ?? ""));
  if (!hotelId || !roomNumber || !price) {
    return { error: "أكمل بيانات الغرفة والسعر" };
  }
  const hotel = await prisma.hotel.findFirst({
    where: { id: hotelId, isDeleted: false },
  });
  if (!hotel) return { error: "الفندق غير موجود" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    hotel.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }

  try {
    await prisma.hotelRoom.create({
      data: {
        hotelId,
        roomNumber,
        roomType,
        capacity: capacity > 0 ? capacity : 2,
        pricePerNight: price,
        amenities: String(formData.get("amenities") ?? "").trim() || null,
        description: String(formData.get("description") ?? "").trim() || null,
        isActive: true,
      },
    });
    revalidatePath("/hotel-rooms");
    return { success: true };
  } catch {
    return { error: "تعذر الإضافة (ربما رقم الغرفة مكرر)" };
  }
}

export async function updateHotelRoom(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const id = String(formData.get("id") ?? "");
  const room = await prisma.hotelRoom.findUnique({
    where: { id },
    include: { hotel: true },
  });
  if (!room || room.hotel.isDeleted) return { error: "الغرفة غير موجودة" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    room.hotel.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }
  const price = parseMoney(String(formData.get("pricePerNight") ?? ""));
  if (!price) return { error: "سعر غير صالح" };

  await prisma.hotelRoom.update({
    where: { id },
    data: {
      roomNumber: String(formData.get("roomNumber") ?? room.roomNumber).trim(),
      roomType: String(formData.get("roomType") ?? room.roomType) as HotelRoomType,
      capacity: Number(formData.get("capacity") ?? room.capacity) || room.capacity,
      pricePerNight: price,
      amenities: String(formData.get("amenities") ?? "").trim() || null,
      isActive: formData.get("isActive") === "true",
    },
  });
  revalidatePath("/hotel-rooms");
  return { success: true };
}

export async function getHotelBookingsForOwner(): Promise<HotelBookingRow[]> {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) return [];
  const hotelWhere =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false }
      : { isDeleted: false, ownerId: session.user.id };
  const list = await prisma.hotelBooking.findMany({
    where: { hotel: hotelWhere },
    orderBy: { checkIn: "desc" },
    include: {
      hotel: { select: { name: true } },
      room: { select: { roomNumber: true } },
      user: { select: { name: true } },
    },
  });
  return list.map((b) => ({
    id: b.id,
    hotelName: b.hotel.name,
    roomNumber: b.room.roomNumber,
    guestName: b.user.name,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    guests: b.guests,
    status: b.status,
    priceAtBooking: b.priceAtBooking.toString(),
  }));
}

export async function updateHotelBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  const session = await auth();
  if (!session?.user || !canManageHotels(session.user.role)) {
    return { error: "غير مصرح" };
  }
  const booking = await prisma.hotelBooking.findUnique({
    where: { id: bookingId },
    include: { hotel: true },
  });
  if (!booking) return { error: "الحجز غير موجود" };
  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    booking.hotel.ownerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية" };
  }
  await prisma.hotelBooking.update({
    where: { id: bookingId },
    data: {
      status,
      cancelledAt: status === BookingStatus.CANCELLED ? new Date() : null,
    },
  });
  revalidatePath("/hotel-bookings");
  return { success: true };
}

/** للمسافر — قائمة كروت الفنادق */
export async function getApprovedHotelsForPassenger() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];
  const list = await prisma.hotel.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
    orderBy: { name: "asc" },
    include: {
      city: { select: { name: true } },
      _count: {
        select: { rooms: { where: { isActive: true } } },
      },
    },
  });
  return list.map((h) => ({
    id: h.id,
    name: h.name,
    address: h.address,
    location: h.location,
    phone: h.phone,
    description: h.description,
    imageUrl: h.imageUrl,
    city: h.city,
    roomsCount: h._count.rooms,
  }));
}

/** للمسافر — تفاصيل فندق + غرفه */
export async function getHotelDetailForPassenger(hotelId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return null;

  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
    },
    include: {
      city: { select: { name: true } },
      rooms: {
        where: { isActive: true },
        orderBy: { roomNumber: "asc" },
      },
    },
  });
}

export async function bookHotelRoom(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح للمسافرين فقط" };
  }
  const roomId = String(formData.get("roomId") ?? "").trim();
  const checkIn = new Date(String(formData.get("checkIn") ?? ""));
  const checkOut = new Date(String(formData.get("checkOut") ?? ""));
  const guests = Number(formData.get("guests") ?? 1);
  if (!roomId || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { error: "أكمل تواريخ الحجز والغرفة" };
  }
  if (checkOut <= checkIn) return { error: "تاريخ المغادرة يجب أن يكون بعد الوصول" };

  const room = await prisma.hotelRoom.findFirst({
    where: {
      id: roomId,
      isActive: true,
      hotel: {
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
      },
    },
    include: { hotel: true },
  });
  if (!room) return { error: "الغرفة غير متاحة" };
  if (guests > room.capacity) {
    return { error: `سعة الغرفة ${room.capacity} ضيوف كحد أقصى` };
  }

  const overlap = await prisma.hotelBooking.findFirst({
    where: {
      roomId,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (overlap) return { error: "الغرفة محجوزة في هذه الفترة" };

  const nights = Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000))
  );
  const price = room.pricePerNight.mul(nights);

  await prisma.hotelBooking.create({
    data: {
      userId: session.user.id,
      hotelId: room.hotelId,
      roomId: room.id,
      checkIn,
      checkOut,
      guests: guests > 0 ? guests : 1,
      status: BookingStatus.PENDING,
      priceAtBooking: price,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/passenger/hotels");
  revalidatePath("/hotel-bookings");
  revalidatePath("/bookings");
  return { success: true };
}

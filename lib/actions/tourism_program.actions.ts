"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { BookingStatus, GarageRole, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type TourismProgramCreatePack = {
  garages: {
    id: string;
    name: string;
    vehicles: { id: string; label: string; totalSeats: number }[];
    drivers: { id: string; name: string }[];
  }[];
  places: { id: string; name: string; governorate: string | null }[];
};

export type TourismProgramManageRow = {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  garageId: string;
  vehicleId: string;
  driverId: string;
  garageName: string;
  vehicleLabel: string;
  driverName: string;
  startAt: string;
  endAt: string | null;
  basePrice: string;
  maxSeats: number;
  availableSeats: number;
  status: string;
  isActive: boolean;
  places: { id: string; name: string; order: number }[];
};

export type TourismProgramPassengerRow = TourismProgramManageRow;

export async function getTourismProgramCreatePack(): Promise<TourismProgramCreatePack> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.SUPER_ADMIN &&
      session.user.role !== UserRole.GARAGE_OWNER)
  ) {
    return { garages: [], places: [] };
  }

  const garageWhere =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false, isActive: true }
      : { isDeleted: false, isActive: true, ownerId: session.user.id };

  const [garages, places] = await Promise.all([
    prisma.garage.findMany({
      where: garageWhere,
      orderBy: { name: "asc" },
      include: {
        owner: { select: { id: true, name: true } },
        vehicles: {
          where: { isActive: true },
          select: {
            id: true,
            brand: true,
            model: true,
            plateNumber: true,
            totalSeats: true,
          },
          orderBy: { plateNumber: "asc" },
        },
        members: {
          where: { role: GarageRole.DRIVER },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.tourismPlace.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, governorate: true },
      take: 300,
    }),
  ]);

  return {
    garages: garages.map((g) => {
      const driverMap = new Map<string, string>();
      driverMap.set(g.owner.id, `${g.owner.name} (مالك)`);
      for (const m of g.members) driverMap.set(m.user.id, m.user.name);
      return {
        id: g.id,
        name: g.name,
        vehicles: g.vehicles.map((v) => ({
          id: v.id,
          label: `${v.brand} ${v.model} — ${v.plateNumber}`,
          totalSeats: v.totalSeats,
        })),
        drivers: Array.from(driverMap.entries()).map(([id, name]) => ({
          id,
          name,
        })),
      };
    }),
    places,
  };
}

export async function createTourismProgram(formData: FormData) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.SUPER_ADMIN &&
      session.user.role !== UserRole.GARAGE_OWNER)
  ) {
    return { error: "لا تملك صلاحية إنشاء برنامج سياحي" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const garageId = String(formData.get("garageId") ?? "").trim();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const driverId = String(formData.get("driverId") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const maxSeats = Number(formData.get("maxSeats"));
  const placeIds = formData
    .getAll("placeIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (
    !title ||
    !garageId ||
    !vehicleId ||
    !driverId ||
    !startAtRaw ||
    !basePriceRaw ||
    !maxSeats ||
    placeIds.length === 0
  ) {
    return { error: "أكمل الحقول المطلوبة، وحدد مكاناً سياحياً واحداً على الأقل" };
  }

  const basePriceNum = Number(basePriceRaw.replace(/,/g, ""));
  if (!Number.isFinite(basePriceNum) || basePriceNum < 0) {
    return { error: "سعر البرنامج غير صالح" };
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return { error: "تاريخ البداية غير صالح" };
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAtRaw && (!endAt || Number.isNaN(endAt.getTime()))) {
    return { error: "تاريخ النهاية غير صالح" };
  }
  if (endAt && endAt < startAt) {
    return { error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" };
  }

  const uniquePlaceIds = Array.from(new Set(placeIds));

  try {
    await prisma.$transaction(async (tx) => {
      const garage = await tx.garage.findFirst({
        where: { id: garageId, isDeleted: false, isActive: true },
        select: { id: true, ownerId: true },
      });
      if (!garage) throw new Error("garage");
      if (
        session.user.role === UserRole.GARAGE_OWNER &&
        garage.ownerId !== session.user.id
      ) {
        throw new Error("ownership");
      }

      const vehicle = await tx.vehicle.findFirst({
        where: { id: vehicleId, garageId: garage.id, isActive: true },
        select: { id: true, totalSeats: true },
      });
      if (!vehicle) throw new Error("vehicle");

      if (maxSeats < 1 || maxSeats > vehicle.totalSeats) {
        throw new Error("seats");
      }

      const driverAllowed =
        driverId === garage.ownerId ||
        (await tx.garageMember.findFirst({
          where: { garageId: garage.id, userId: driverId, role: GarageRole.DRIVER },
          select: { id: true },
        }));
      if (!driverAllowed) throw new Error("driver");

      const placesCount = await tx.tourismPlace.count({
        where: { id: { in: uniquePlaceIds }, isActive: true },
      });
      if (placesCount !== uniquePlaceIds.length) throw new Error("places");

      const program = await tx.tourismProgram.create({
        data: {
          title,
          description,
          notes,
          garageId: garage.id,
          vehicleId: vehicle.id,
          driverId,
          startAt,
          endAt,
          basePrice: new Prisma.Decimal(basePriceNum.toFixed(2)),
          maxSeats,
          availableSeats: maxSeats,
          status: "SCHEDULED",
          isActive: true,
        },
      });

      await tx.tourismProgramPlace.createMany({
        data: uniquePlaceIds.map((pid, idx) => ({
          programId: program.id,
          tourismPlaceId: pid,
          stopOrder: idx + 1,
        })),
      });
    });

    revalidatePath("/trips");
    revalidatePath("/tourism-programs");
    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "unknown";
    if (msg === "garage") return { error: "الشركة السياحية غير صالحة" };
    if (msg === "ownership") return { error: "لا يمكنك إنشاء برنامج في هذه الشركة" };
    if (msg === "vehicle") return { error: "المركبة غير مرتبطة بهذه الشركة" };
    if (msg === "driver") return { error: "السائق غير مصرح له لهذه الشركة" };
    if (msg === "places") return { error: "بعض الأماكن السياحية المحددة غير صالحة" };
    if (msg === "seats") return { error: "عدد المقاعد يتجاوز سعة المركبة المختارة" };
    return { error: "تعذر إنشاء البرنامج السياحي" };
  }
}

function mapProgramRow(p: {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  garageId: string;
  vehicleId: string;
  driverId: string;
  startAt: Date;
  endAt: Date | null;
  basePrice: Prisma.Decimal;
  maxSeats: number;
  availableSeats: number;
  status: string;
  isActive: boolean;
  garage: { name: string };
  vehicle: { brand: string; model: string; plateNumber: string };
  driver: { name: string };
  places: {
    stopOrder: number;
    place: { id: string; name: string };
  }[];
}): TourismProgramManageRow {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    notes: p.notes,
    garageId: p.garageId,
    vehicleId: p.vehicleId,
    driverId: p.driverId,
    garageName: p.garage.name,
    vehicleLabel: `${p.vehicle.brand} ${p.vehicle.model} — ${p.vehicle.plateNumber}`,
    driverName: p.driver.name,
    startAt: p.startAt.toISOString(),
    endAt: p.endAt ? p.endAt.toISOString() : null,
    basePrice: String(p.basePrice),
    maxSeats: p.maxSeats,
    availableSeats: p.availableSeats,
    status: p.status,
    isActive: p.isActive,
    places: p.places
      .map((x) => ({
        id: x.place.id,
        name: x.place.name,
        order: x.stopOrder,
      }))
      .sort((a, b) => a.order - b.order),
  };
}

export async function getManagedTourismPrograms(): Promise<TourismProgramManageRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  const where =
    session.user.role === UserRole.SUPER_ADMIN
      ? {}
      : session.user.role === UserRole.GARAGE_OWNER
      ? { garage: { ownerId: session.user.id, isDeleted: false } }
      : session.user.role === UserRole.DRIVER
      ? { driverId: session.user.id }
      : { id: "__none__" };

  const rows = await prisma.tourismProgram.findMany({
    where,
    orderBy: [{ startAt: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      garage: { select: { name: true } },
      vehicle: { select: { brand: true, model: true, plateNumber: true } },
      driver: { select: { name: true } },
      places: {
        select: {
          stopOrder: true,
          place: { select: { id: true, name: true } },
        },
      },
    },
  });
  return rows.map(mapProgramRow);
}

export async function getTourismProgramsForPassenger(): Promise<
  TourismProgramPassengerRow[]
> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];

  const rows = await prisma.tourismProgram.findMany({
    where: {
      isActive: true,
      status: "SCHEDULED",
      availableSeats: { gt: 0 },
      startAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      garage: { isDeleted: false, isActive: true },
    },
    orderBy: { startAt: "asc" },
    take: 200,
    include: {
      garage: { select: { name: true } },
      vehicle: { select: { brand: true, model: true, plateNumber: true } },
      driver: { select: { name: true } },
      places: {
        select: {
          stopOrder: true,
          place: { select: { id: true, name: true } },
        },
      },
    },
  });
  return rows.map(mapProgramRow);
}

export async function bookTourismProgram(programId: string, passengersCount: number) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح للمسافر فقط" };
  }

  const id = programId.trim();
  if (!id) return { error: "معرف البرنامج غير صالح" };
  if (!Number.isInteger(passengersCount) || passengersCount < 1) {
    return { error: "عدد الأفراد يجب أن يكون 1 أو أكثر" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.tourismProgram.findFirst({
        where: {
          id,
          isActive: true,
          status: "SCHEDULED",
          availableSeats: { gte: passengersCount },
        },
        select: { id: true, basePrice: true },
      });
      if (!p) throw new Error("program");

      const exists = await tx.tourismProgramBooking.findFirst({
        where: {
          programId: p.id,
          userId: session.user.id,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
        select: { id: true },
      });
      if (exists) throw new Error("duplicate");

      await tx.tourismProgramBooking.create({
        data: {
          programId: p.id,
          userId: session.user.id,
          status: BookingStatus.PENDING,
          priceAtBooking: p.basePrice,
          passengersCount,
        },
      });

      await tx.tourismProgram.update({
        where: { id: p.id },
        data: { availableSeats: { decrement: passengersCount } },
      });
    });

    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/bookings");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "duplicate") return { error: "لقد حجزت هذا البرنامج مسبقاً" };
    return { error: "تعذر الحجز على البرنامج السياحي" };
  }
}

export async function updateTourismProgram(formData: FormData) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.SUPER_ADMIN &&
      session.user.role !== UserRole.GARAGE_OWNER)
  ) {
    return { error: "لا تملك صلاحية تعديل البرنامج السياحي" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const garageId = String(formData.get("garageId") ?? "").trim();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const driverId = String(formData.get("driverId") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const maxSeats = Number(formData.get("maxSeats"));
  const status = String(formData.get("status") ?? "SCHEDULED");
  const isActive = String(formData.get("isActive") ?? "true") === "true";
  const placeIds = formData
    .getAll("placeIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!id || !title || !garageId || !vehicleId || !driverId || !startAtRaw || !basePriceRaw || !maxSeats || placeIds.length === 0) {
    return { error: "أكمل الحقول المطلوبة، وحدد مكاناً سياحياً واحداً على الأقل" };
  }

  if (!["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
    return { error: "حالة البرنامج غير صالحة" };
  }

  const basePriceNum = Number(basePriceRaw.replace(/,/g, ""));
  if (!Number.isFinite(basePriceNum) || basePriceNum < 0) {
    return { error: "سعر البرنامج غير صالح" };
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return { error: "تاريخ البداية غير صالح" };
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAtRaw && (!endAt || Number.isNaN(endAt.getTime()))) {
    return { error: "تاريخ النهاية غير صالح" };
  }
  if (endAt && endAt < startAt) {
    return { error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" };
  }

  const uniquePlaceIds = Array.from(new Set(placeIds));

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.tourismProgram.findUnique({
        where: { id },
        select: { id: true, garageId: true, maxSeats: true, availableSeats: true },
      });
      if (!existing) throw new Error("program");

      const garage = await tx.garage.findFirst({
        where: { id: garageId, isDeleted: false, isActive: true },
        select: { id: true, ownerId: true },
      });
      if (!garage) throw new Error("garage");
      if (
        session.user.role === UserRole.GARAGE_OWNER &&
        garage.ownerId !== session.user.id
      ) {
        throw new Error("ownership");
      }

      const vehicle = await tx.vehicle.findFirst({
        where: { id: vehicleId, garageId: garage.id, isActive: true },
        select: { id: true, totalSeats: true },
      });
      if (!vehicle) throw new Error("vehicle");

      const bookedSeats = existing.maxSeats - existing.availableSeats;
      if (maxSeats < bookedSeats || maxSeats > vehicle.totalSeats) {
        throw new Error("seats");
      }

      const driverAllowed =
        driverId === garage.ownerId ||
        (await tx.garageMember.findFirst({
          where: { garageId: garage.id, userId: driverId, role: GarageRole.DRIVER },
          select: { id: true },
        }));
      if (!driverAllowed) throw new Error("driver");

      const placesCount = await tx.tourismPlace.count({
        where: { id: { in: uniquePlaceIds }, isActive: true },
      });
      if (placesCount !== uniquePlaceIds.length) throw new Error("places");

      await tx.tourismProgram.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          notes,
          garageId: garage.id,
          vehicleId: vehicle.id,
          driverId,
          startAt,
          endAt,
          basePrice: new Prisma.Decimal(basePriceNum.toFixed(2)),
          maxSeats,
          availableSeats: maxSeats - bookedSeats,
          status: status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
          isActive,
        },
      });

      await tx.tourismProgramPlace.deleteMany({ where: { programId: existing.id } });
      await tx.tourismProgramPlace.createMany({
        data: uniquePlaceIds.map((pid, idx) => ({
          programId: existing.id,
          tourismPlaceId: pid,
          stopOrder: idx + 1,
        })),
      });
    });

    revalidatePath("/trips");
    revalidatePath("/tourism-programs");
    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "program") return { error: "البرنامج السياحي غير موجود" };
    if (msg === "garage") return { error: "الشركة السياحية غير صالحة" };
    if (msg === "ownership") return { error: "لا يمكنك تعديل برنامج لا يتبع شركتك" };
    if (msg === "vehicle") return { error: "المركبة غير مرتبطة بهذه الشركة" };
    if (msg === "driver") return { error: "السائق غير مصرح له لهذه الشركة" };
    if (msg === "places") return { error: "بعض الأماكن السياحية المحددة غير صالحة" };
    if (msg === "seats") return { error: "عدد المقاعد غير صالح مقارنة بالحجوزات أو سعة المركبة" };
    return { error: "تعذر تعديل البرنامج السياحي" };
  }
}

export async function deleteTourismProgram(programId: string) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.SUPER_ADMIN &&
      session.user.role !== UserRole.GARAGE_OWNER)
  ) {
    return { error: "لا تملك صلاحية حذف البرنامج السياحي" };
  }

  const id = programId.trim();
  if (!id) return { error: "معرف البرنامج غير صالح" };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.tourismProgram.findUnique({
        where: { id },
        include: { garage: { select: { ownerId: true } } },
      });
      if (!existing) throw new Error("program");
      if (
        session.user.role === UserRole.GARAGE_OWNER &&
        existing.garage.ownerId !== session.user.id
      ) {
        throw new Error("ownership");
      }

      const activeBookings = await tx.tourismProgramBooking.count({
        where: {
          programId: id,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
      });
      if (activeBookings > 0) throw new Error("bookings");

      await tx.tourismProgram.delete({ where: { id } });
    });

    revalidatePath("/trips");
    revalidatePath("/tourism-programs");
    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "program") return { error: "البرنامج السياحي غير موجود" };
    if (msg === "ownership") return { error: "لا يمكنك حذف برنامج لا يتبع شركتك" };
    if (msg === "bookings") return { error: "لا يمكن حذف برنامج عليه حجوزات فعالة" };
    return { error: "تعذر حذف البرنامج السياحي" };
  }
}


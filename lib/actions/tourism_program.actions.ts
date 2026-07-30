"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  BookingStatus,
  BusinessPartnerType,
  FarmOccasionType,
  GarageRole,
  PartnershipStatus,
  Prisma,
} from "@prisma/client";
import { createNotification } from "@/lib/actions/notification.actions";
import { revalidatePath } from "next/cache";

export type TourismProgramCreatePack = {
  garages: {
    id: string;
    name: string;
    vehicles: { id: string; label: string; totalSeats: number }[];
    drivers: { id: string; name: string }[];
    partners: {
      id: string;
      partnerType: string;
      partnerName: string;
    }[];
  }[];
  places: { id: string; name: string; governorate: string | null }[];
};

export type TourismProgramPartnerRow = {
  partnershipId: string;
  partnerType: string;
  partnerName: string;
  partnerId: string;
  order: number;
  priceAddon: string;
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
  partners: TourismProgramPartnerRow[];
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

  const [garages, places, acceptedPartnerships] = await Promise.all([
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
    prisma.businessPartnership.findMany({
      where: {
        status: PartnershipStatus.ACCEPTED,
        garage: garageWhere,
      },
      include: {
        hotel: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true } },
        farm: { select: { id: true, name: true } },
      },
    }),
  ]);

  const partnersByGarage = new Map<
    string,
    { id: string; partnerType: string; partnerName: string }[]
  >();
  for (const p of acceptedPartnerships) {
    const name = p.hotel?.name ?? p.restaurant?.name ?? p.farm?.name ?? "—";
    const list = partnersByGarage.get(p.garageId) ?? [];
    list.push({
      id: p.id,
      partnerType: p.partnerType,
      partnerName: name,
    });
    partnersByGarage.set(p.garageId, list);
  }

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
        partners: partnersByGarage.get(g.id) ?? [],
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
  const partnershipIds = formData
    .getAll("partnershipIds")
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
  const uniquePartnershipIds = Array.from(new Set(partnershipIds));

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

      if (uniquePartnershipIds.length > 0) {
        const accepted = await tx.businessPartnership.findMany({
          where: {
            id: { in: uniquePartnershipIds },
            garageId: garage.id,
            status: PartnershipStatus.ACCEPTED,
          },
          select: { id: true, partnerType: true },
        });
        if (accepted.length !== uniquePartnershipIds.length) {
          throw new Error("partners");
        }
      }

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

      if (uniquePartnershipIds.length > 0) {
        const accepted = await tx.businessPartnership.findMany({
          where: {
            id: { in: uniquePartnershipIds },
            garageId: garage.id,
            status: PartnershipStatus.ACCEPTED,
          },
          select: { id: true, partnerType: true },
        });
        await tx.tourismProgramPartner.createMany({
          data: accepted.map((p, idx) => ({
            programId: program.id,
            partnershipId: p.id,
            partnerType: p.partnerType,
            stopOrder: idx + 1,
          })),
        });
      }
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
    if (msg === "partners") return { error: "بعض الشركاء المحددين غير مقبولين لهذه الشركة" };
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
  partners?: {
    stopOrder: number;
    partnershipId: string;
    partnerType: string;
    priceAddon: Prisma.Decimal;
    partnership: {
      hotelId: string | null;
      restaurantId: string | null;
      farmId: string | null;
      hotel: { id: string; name: string } | null;
      restaurant: { id: string; name: string } | null;
      farm: { id: string; name: string } | null;
    };
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
    partners: (p.partners ?? [])
      .map((x) => {
        const partner =
          x.partnership.hotel ??
          x.partnership.restaurant ??
          x.partnership.farm;
        return {
          partnershipId: x.partnershipId,
          partnerType: x.partnerType,
          partnerName: partner?.name ?? "—",
          partnerId: partner?.id ?? "",
          order: x.stopOrder,
          priceAddon: String(x.priceAddon),
        };
      })
      .sort((a, b) => a.order - b.order),
  };
}

const programPartnerInclude = {
  stopOrder: true,
  partnershipId: true,
  partnerType: true,
  priceAddon: true,
  partnership: {
    select: {
      hotelId: true,
      restaurantId: true,
      farmId: true,
      hotel: { select: { id: true, name: true } },
      restaurant: { select: { id: true, name: true } },
      farm: { select: { id: true, name: true } },
    },
  },
} as const;

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
      partners: { select: programPartnerInclude },
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
      partners: { select: programPartnerInclude },
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
    const notifyTargets: { userId: string; title: string; body: string }[] = [];

    await prisma.$transaction(async (tx) => {
      const p = await tx.tourismProgram.findFirst({
        where: {
          id,
          isActive: true,
          status: "SCHEDULED",
          availableSeats: { gte: passengersCount },
        },
        select: {
          id: true,
          title: true,
          basePrice: true,
          startAt: true,
          endAt: true,
          partners: {
            include: {
              partnership: {
                include: {
                  hotel: { select: { id: true, ownerId: true, name: true } },
                  restaurant: { select: { id: true, ownerId: true, name: true } },
                  farm: { select: { id: true, ownerId: true, name: true } },
                },
              },
            },
            orderBy: { stopOrder: "asc" },
          },
        },
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

      let totalAddon = new Prisma.Decimal(0);
      for (const link of p.partners) {
        totalAddon = totalAddon.add(link.priceAddon);
      }
      const priceAtBooking = p.basePrice.add(totalAddon);

      await tx.tourismProgramBooking.create({
        data: {
          programId: p.id,
          userId: session.user.id,
          status: BookingStatus.PENDING,
          priceAtBooking,
          passengersCount,
        },
      });

      await tx.tourismProgram.update({
        where: { id: p.id },
        data: { availableSeats: { decrement: passengersCount } },
      });

      const checkIn = p.startAt;
      const checkOut =
        p.endAt && p.endAt > p.startAt
          ? p.endAt
          : new Date(p.startAt.getTime() + 24 * 60 * 60 * 1000);
      const packageNote = `حجز ضمن الباقة السياحية: ${p.title}`;

      for (const link of p.partners) {
        const ps = link.partnership;
        if (ps.hotel) {
          const room = await tx.hotelRoom.findFirst({
            where: { hotelId: ps.hotel.id, isActive: true },
            orderBy: { roomNumber: "asc" },
            select: { id: true, pricePerNight: true },
          });
          if (room) {
            await tx.hotelBooking.create({
              data: {
                userId: session.user.id,
                hotelId: ps.hotel.id,
                roomId: room.id,
                checkIn,
                checkOut,
                guests: passengersCount,
                status: BookingStatus.PENDING,
                priceAtBooking: room.pricePerNight,
                notes: packageNote,
              },
            });
            notifyTargets.push({
              userId: ps.hotel.ownerId,
              title: "طلب حجز فندق ضمن باقة",
              body: `تم إنشاء طلب حجز في ${ps.hotel.name} ضمن البرنامج «${p.title}».`,
            });
          }
        } else if (ps.restaurant) {
          await tx.restaurantBooking.create({
            data: {
              userId: session.user.id,
              restaurantId: ps.restaurant.id,
              reservedAt: checkIn,
              guests: passengersCount,
              status: BookingStatus.PENDING,
              notes: packageNote,
            },
          });
          notifyTargets.push({
            userId: ps.restaurant.ownerId,
            title: "طلب حجز مطعم ضمن باقة",
            body: `تم إنشاء طلب حجز في ${ps.restaurant.name} ضمن البرنامج «${p.title}».`,
          });
        } else if (ps.farm) {
          await tx.farmBooking.create({
            data: {
              userId: session.user.id,
              farmId: ps.farm.id,
              startAt: checkIn,
              endAt: checkOut,
              occasionType: FarmOccasionType.FAMILY,
              guests: passengersCount,
              status: BookingStatus.PENDING,
              notes: packageNote,
            },
          });
          notifyTargets.push({
            userId: ps.farm.ownerId,
            title: "طلب حجز مزرعة ضمن باقة",
            body: `تم إنشاء طلب حجز في ${ps.farm.name} ضمن البرنامج «${p.title}».`,
          });
        }
      }
    });

    await Promise.all(
      notifyTargets.map((n) =>
        createNotification({
          userId: n.userId,
          type: "PACKAGE_INCLUDED",
          title: n.title,
          body: n.body,
          data: { programId: id },
        })
      )
    );

    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/bookings");
    revalidatePath("/hotel-bookings");
    revalidatePath("/restaurant-bookings");
    revalidatePath("/farm-bookings");
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
  const partnershipIds = formData
    .getAll("partnershipIds")
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
  const uniquePartnershipIds = Array.from(new Set(partnershipIds));

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

      let acceptedPartners: { id: string; partnerType: BusinessPartnerType }[] =
        [];
      if (uniquePartnershipIds.length > 0) {
        acceptedPartners = await tx.businessPartnership.findMany({
          where: {
            id: { in: uniquePartnershipIds },
            garageId: garage.id,
            status: PartnershipStatus.ACCEPTED,
          },
          select: { id: true, partnerType: true },
        });
        if (acceptedPartners.length !== uniquePartnershipIds.length) {
          throw new Error("partners");
        }
      }

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

      await tx.tourismProgramPartner.deleteMany({ where: { programId: existing.id } });
      if (acceptedPartners.length > 0) {
        await tx.tourismProgramPartner.createMany({
          data: acceptedPartners.map((p, idx) => ({
            programId: existing.id,
            partnershipId: p.id,
            partnerType: p.partnerType,
            stopOrder: idx + 1,
          })),
        });
      }
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
    if (msg === "partners") return { error: "بعض الشركاء المحددين غير مقبولين لهذه الشركة" };
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


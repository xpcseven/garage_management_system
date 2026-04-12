"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  GarageRole,
  Prisma,
  SeatStatus,
  TransportType,
  TripStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type TripManageRow = {
  id: string;
  fromCity: string;
  toCity: string;
  fromRegion: string | null;
  toRegion: string | null;
  departureTime: string;
  basePrice: string;
  maxSeats: number;
  availableSeats: number;
  status: TripStatus;
  transportType: TransportType;
  garageName: string | null;
  isFreelance: boolean;
  driverName: string;
};

export type GarageTripPack = {
  id: string;
  name: string;
  vehicles: {
    id: string;
    label: string;
    totalSeats: number;
    transportType: TransportType;
  }[];
  drivers: { id: string; name: string }[];
};

function parseDecimal(v: string) {
  const n = Number(String(v).replace(/,/g, ""));
  if (Number.isNaN(n) || n < 0) return null;
  return new Prisma.Decimal(n.toFixed(2));
}

export async function getGaragesPackForTripCreation(): Promise<
  GarageTripPack[]
> {
  const session = await auth();
  if (!session?.user) return [];

  const garageWhere: Prisma.GarageWhereInput =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false, isActive: true }
      : {
          isDeleted: false,
          isActive: true,
          ownerId: session.user.id,
        };

  const garages = await prisma.garage.findMany({
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
          transportType: true,
          driverName: true,
        },
      },
      members: {
        where: { role: GarageRole.DRIVER },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  return garages.map((g) => {
    const driverIds = new Set<string>();
    const drivers: { id: string; name: string }[] = [];

    if (!driverIds.has(g.owner.id)) {
      driverIds.add(g.owner.id);
      drivers.push({
        id: g.owner.id,
        name: `${g.owner.name} (مالك)`,
      });
    }

    for (const m of g.members) {
      if (!driverIds.has(m.user.id)) {
        driverIds.add(m.user.id);
        drivers.push({ id: m.user.id, name: m.user.name });
      }
    }

    return {
      id: g.id,
      name: g.name,
      vehicles: g.vehicles.map((v) => ({
        id: v.id,
        label: `${v.brand} ${v.model} — ${v.plateNumber}${
          v.driverName ? ` — ${v.driverName}` : ""
        }`,
        totalSeats: v.totalSeats,
        transportType: v.transportType,
      })),
      drivers,
    };
  });
}

export async function getOwnVehiclesForFreelanceTrip(): Promise<
  GarageTripPack["vehicles"]
> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.DRIVER) return [];
  const list = await prisma.vehicle.findMany({
    where: { ownerId: session.user.id, isActive: true },
    orderBy: { plateNumber: "asc" },
    select: {
      id: true,
      brand: true,
      model: true,
      plateNumber: true,
      totalSeats: true,
      transportType: true,
      driverName: true,
    },
  });
  return list.map((v) => ({
    id: v.id,
    label: `${v.brand} ${v.model} — ${v.plateNumber}${
      v.driverName ? ` — ${v.driverName}` : ""
    }`,
    totalSeats: v.totalSeats,
    transportType: v.transportType,
  }));
}

export async function getManagedTrips(): Promise<TripManageRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  let where: Prisma.TripWhereInput = {};
  if (session.user.role === UserRole.SUPER_ADMIN) {
    where = {};
  } else if (session.user.role === UserRole.GARAGE_OWNER) {
    const ids = (
      await prisma.garage.findMany({
        where: { ownerId: session.user.id, isDeleted: false },
        select: { id: true },
      })
    ).map((g) => g.id);
    if (ids.length === 0) return [];
    where = { garageId: { in: ids } };
  } else if (session.user.role === UserRole.DRIVER) {
    where = { driverId: session.user.id };
  } else {
    return [];
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { departureTime: "desc" },
    take: 80,
    include: {
      fromCity: { select: { name: true, region: true } },
      toCity: { select: { name: true, region: true } },
      garage: { select: { name: true } },
      driver: { select: { name: true } },
    },
  });

  return trips.map((t) => ({
    id: t.id,
    fromCity: t.fromCity.name,
    toCity: t.toCity.name,
    fromRegion: t.fromCity.region,
    toRegion: t.toCity.region,
    departureTime: t.departureTime.toISOString(),
    basePrice: String(t.basePrice),
    maxSeats: t.maxSeats,
    availableSeats: t.availableSeats,
    status: t.status,
    transportType: t.transportType,
    garageName: t.garage?.name ?? null,
    isFreelance: !t.garageId,
    driverName: t.driver.name,
  }));
}

export async function createGarageTrip(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };
  if (
    session.user.role !== UserRole.GARAGE_OWNER &&
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    return { error: "فقط مالك الكراج أو المشرف يمكنه إنشاء رحلة باسم الكراج" };
  }

  const garageId = String(formData.get("garageId") ?? "").trim();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const driverId = String(formData.get("driverId") ?? "").trim();
  const fromCityId = String(formData.get("fromCityId") ?? "").trim();
  const toCityId = String(formData.get("toCityId") ?? "").trim();
  const departureTime = String(formData.get("departureTime") ?? "").trim();
  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const maxSeats = Number(formData.get("maxSeats"));

  if (
    !garageId ||
    !vehicleId ||
    !driverId ||
    !fromCityId ||
    !toCityId ||
    !departureTime ||
    !basePriceRaw ||
    !maxSeats
  ) {
    return { error: "أكمل جميع الحقول، بما فيها وجهة السفر (من / إلى)" };
  }

  if (fromCityId === toCityId) {
    return {
      error:
        "يجب أن تختلف وجهة الوصول عن نقطة الانطلاق — حدد «من» و«إلى» مدينتين مختلفتين",
    };
  }

  const garage = await prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false },
  });
  if (!garage) return { error: "الكراج غير موجود" };
  if (
    session.user.role === UserRole.GARAGE_OWNER &&
    garage.ownerId !== session.user.id
  ) {
    return { error: "هذا ليس كراجك" };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, garageId, isActive: true },
  });
  if (!vehicle) return { error: "المركبة غير مرتبطة بهذا الكراج" };

  const driverOk =
    driverId === garage.ownerId ||
    (await prisma.garageMember.findFirst({
      where: {
        garageId,
        userId: driverId,
        role: GarageRole.DRIVER,
      },
    }));
  if (!driverOk) return { error: "السائق غير مصرح له بالقيادة لهذا الكراج" };

  if (maxSeats < 1 || maxSeats > vehicle.totalSeats) {
    return { error: `عدد المقاعد بين 1 و ${vehicle.totalSeats}` };
  }

  const basePrice = parseDecimal(basePriceRaw);
  if (!basePrice) return { error: "سعر غير صالح" };

  const dep = new Date(departureTime);
  if (Number.isNaN(dep.getTime())) return { error: "تاريخ المغادرة غير صالح" };

  try {
    await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          garageId,
          vehicleId,
          driverId,
          fromCityId,
          toCityId,
          departureTime: dep,
          basePrice,
          priceMultiplier: 1,
          maxSeats,
          availableSeats: maxSeats,
          transportType: vehicle.transportType,
          status: TripStatus.SCHEDULED,
        },
      });
      await tx.seat.createMany({
        data: Array.from({ length: maxSeats }, (_, i) => ({
          tripId: trip.id,
          seatNumber: i + 1,
          status: SeatStatus.AVAILABLE,
          priceModifier: new Prisma.Decimal(0),
        })),
      });
    });
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "تعذر إنشاء الرحلة" };
  }
}

export async function createFreelanceTrip(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.DRIVER) {
    return { error: "فقط السائق يمكنه إنشاء رحلة مستقلة" };
  }

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const fromCityId = String(formData.get("fromCityId") ?? "").trim();
  const toCityId = String(formData.get("toCityId") ?? "").trim();
  const departureTime = String(formData.get("departureTime") ?? "").trim();
  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const maxSeats = Number(formData.get("maxSeats"));

  if (
    !vehicleId ||
    !fromCityId ||
    !toCityId ||
    !departureTime ||
    !basePriceRaw ||
    !maxSeats ||
    fromCityId === toCityId
  ) {
    return { error: "أكمل الحقول وتأكد أن نقطة الانطلاق والوصول مختلفة" };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      ownerId: session.user.id,
      isActive: true,
    },
  });
  if (!vehicle) return { error: "المركبة غير مملوكة لك" };

  if (maxSeats < 1 || maxSeats > vehicle.totalSeats) {
    return { error: `عدد المقاعد بين 1 و ${vehicle.totalSeats}` };
  }

  const basePrice = parseDecimal(basePriceRaw);
  if (!basePrice) return { error: "سعر غير صالح" };
  const dep = new Date(departureTime);
  if (Number.isNaN(dep.getTime())) return { error: "تاريخ المغادرة غير صالح" };

  try {
    await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          garageId: null,
          vehicleId,
          driverId: session.user.id,
          fromCityId,
          toCityId,
          departureTime: dep,
          basePrice,
          priceMultiplier: 1,
          maxSeats,
          availableSeats: maxSeats,
          transportType: vehicle.transportType,
          status: TripStatus.SCHEDULED,
        },
      });
      await tx.seat.createMany({
        data: Array.from({ length: maxSeats }, (_, i) => ({
          tripId: trip.id,
          seatNumber: i + 1,
          status: SeatStatus.AVAILABLE,
          priceModifier: new Prisma.Decimal(0),
        })),
      });
    });
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    revalidatePath("/home");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "تعذر إنشاء الرحلة" };
  }
}

type TripForAuth = {
  driverId: string;
  garageId: string | null;
  garage: { ownerId: string } | null;
};

function canManageTripLifecycle(
  session: { user: { id: string; role: string } },
  trip: TripForAuth
): boolean {
  if (session.user.role === UserRole.SUPER_ADMIN) return true;
  if (
    session.user.role === UserRole.GARAGE_OWNER &&
    trip.garageId &&
    trip.garage?.ownerId === session.user.id
  )
    return true;
  if (session.user.role === UserRole.DRIVER && trip.driverId === session.user.id)
    return true;
  return false;
}

/** عند اكتمال حجز المقاعد: تسجيل أن الرحلة بدأت (قبل أو بعد المغادرة). */
export async function startTripInProgress(tripId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { garage: { select: { ownerId: true } } },
  });
  if (!trip) return { error: "الرحلة غير موجودة" };
  if (!canManageTripLifecycle(session, trip)) {
    return { error: "لا تملك صلاحية تحديث هذه الرحلة" };
  }
  if (trip.status !== TripStatus.SCHEDULED) {
    return { error: "لا يمكن بدء الرحلة إلا وهي مجدولة" };
  }
  if (trip.availableSeats > 0) {
    return {
      error: "اكتمل حجز جميع المقاعد أولاً قبل بدء الرحلة",
    };
  }

  try {
    await prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.IN_PROGRESS },
    });
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    revalidatePath("/passenger/garages");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر تحديث حالة الرحلة" };
  }
}

/** عند الوصول للوجهة: إكمال الرحلة (بعد بدءها، أو مباشرة إن تجاوز موعد المغادرة ولم تُسجَّل كـ جارية). */
export async function completeTripAtDestination(tripId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { garage: { select: { ownerId: true } } },
  });
  if (!trip) return { error: "الرحلة غير موجودة" };
  if (!canManageTripLifecycle(session, trip)) {
    return { error: "لا تملك صلاحية إكمال هذه الرحلة" };
  }
  if (trip.status === TripStatus.COMPLETED) {
    return { error: "الرحلة مكتملة مسبقاً" };
  }
  if (trip.status === TripStatus.CANCELLED) {
    return { error: "لا يمكن إكمال رحلة ملغاة" };
  }
  if (trip.availableSeats > 0) {
    return {
      error: "أكمل حجز جميع المقاعد قبل تسجيل الوصول وإنهاء الرحلة",
    };
  }

  const now = new Date();
  const mayCompleteFromScheduled =
    trip.status === TripStatus.SCHEDULED && trip.departureTime <= now;
  const mayCompleteFromInProgress = trip.status === TripStatus.IN_PROGRESS;

  if (!mayCompleteFromScheduled && !mayCompleteFromInProgress) {
    if (trip.status === TripStatus.SCHEDULED) {
      return {
        error:
          "سجّل بدء الرحلة أولاً، أو انتظر حتى موعد المغادرة ثم سجّل الوصول",
      };
    }
    return { error: "حالة الرحلة لا تسمح بالإكمال" };
  }

  try {
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        arrivalTime: now,
      },
    });
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    revalidatePath("/passenger/garages");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر إكمال الرحلة" };
  }
}

export async function cancelTrip(tripId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { garage: { select: { ownerId: true } } },
  });
  if (!trip) return { error: "الرحلة غير موجودة" };

  let allowed = false;
  if (session.user.role === UserRole.SUPER_ADMIN) allowed = true;
  else if (
    session.user.role === UserRole.GARAGE_OWNER &&
    trip.garageId &&
    trip.garage.ownerId === session.user.id
  )
    allowed = true;
  else if (
    session.user.role === UserRole.DRIVER &&
    trip.driverId === session.user.id &&
    !trip.garageId
  )
    allowed = true;

  if (!allowed) return { error: "لا تملك صلاحية إلغاء هذه الرحلة" };

  if (trip.status !== TripStatus.SCHEDULED) {
    return { error: "يمكن إلغاء الرحلة فقط وهي مجدولة" };
  }

  try {
    await prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED },
    });
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    revalidatePath("/passenger/garages");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الإلغاء" };
  }
}

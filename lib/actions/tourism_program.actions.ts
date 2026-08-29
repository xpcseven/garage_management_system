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
  SeatStatus,
  TripStatus,
  TourismProgramStopKind,
  type VehicleCategory,
} from "@prisma/client";
import { createNotification, notifyAllPassengers } from "@/lib/actions/notification.actions";
import { revalidatePath } from "next/cache";
import {
  parseSeatLayout,
  seatsForVehicleCreate,
} from "@/lib/vehicle-seat-layouts";
import { resolveVehicleSeatLayout } from "@/lib/vehicle-models";
import {
  normalizeProgramCurrency,
  type ProgramCurrency,
} from "@/lib/program-currency";

type VehicleSeatSource = {
  brand: string;
  model: string;
  totalSeats: number;
  seatLayoutJson: unknown;
  category: VehicleCategory;
};

function resolveProgramVehicleLayout(vehicle: VehicleSeatSource) {
  return (
    parseSeatLayout(vehicle.seatLayoutJson) ??
    resolveVehicleSeatLayout({
      brand: vehicle.brand,
      model: vehicle.model,
      category: vehicle.category,
    })
  );
}

async function createProgramSeatsInTx(
  tx: Prisma.TransactionClient,
  programId: string,
  vehicle: VehicleSeatSource,
  maxSeats: number
) {
  const layout = resolveProgramVehicleLayout(vehicle);
  const rows = seatsForVehicleCreate({ programId }, layout, maxSeats).map(
    (s) => ({
      ...s,
      status: SeatStatus.AVAILABLE,
      priceModifier: new Prisma.Decimal(0),
    })
  );
  if (rows.length > 0) {
    await tx.seat.createMany({ data: rows });
  }
  return rows.length;
}

type ParsedProgramStop = {
  kind: TourismProgramStopKind;
  tourismPlaceId: string | null;
  cityId: string | null;
  key: string;
};

function parseProgramStopEntries(
  formData: FormData
): { stops: ParsedProgramStop[] } | { error: string } {
  const rawEntries = formData
    .getAll("stopEntries")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const legacyPlaceIds = formData
    .getAll("placeIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const entries =
    rawEntries.length > 0
      ? rawEntries
      : legacyPlaceIds.map((id) => `TOURISM:${id}`);

  if (entries.length === 0) {
    return { error: "أضف محطة سفر أو سياحة واحدة على الأقل" };
  }

  const stops: ParsedProgramStop[] = [];
  const seen = new Set<string>();

  for (const raw of entries) {
    const sep = raw.indexOf(":");
    if (sep <= 0) return { error: "بيانات المحطات غير صالحة" };
    const kindRaw = raw.slice(0, sep).toUpperCase();
    const id = raw.slice(sep + 1).trim();
    if (!id) return { error: "بيانات المحطات غير صالحة" };

    if (kindRaw === "TRAVEL") {
      const key = `TRAVEL:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stops.push({
        kind: TourismProgramStopKind.TRAVEL,
        tourismPlaceId: null,
        cityId: id,
        key,
      });
    } else if (kindRaw === "TOURISM") {
      const key = `TOURISM:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stops.push({
        kind: TourismProgramStopKind.TOURISM,
        tourismPlaceId: id,
        cityId: null,
        key,
      });
    } else {
      return { error: "نوع المحطة غير صالح (سفر أو سياحة)" };
    }
  }

  if (stops.length === 0) {
    return { error: "أضف محطة سفر أو سياحة واحدة على الأقل" };
  }
  return { stops };
}

async function assertProgramStopsValid(
  tx: Prisma.TransactionClient,
  stops: ParsedProgramStop[]
) {
  const placeIds = stops
    .filter((s) => s.kind === TourismProgramStopKind.TOURISM)
    .map((s) => s.tourismPlaceId!)
    .filter(Boolean);
  const cityIds = stops
    .filter((s) => s.kind === TourismProgramStopKind.TRAVEL)
    .map((s) => s.cityId!)
    .filter(Boolean);

  if (placeIds.length > 0) {
    const placesCount = await tx.tourismPlace.count({
      where: { id: { in: placeIds }, isActive: true },
    });
    if (placesCount !== placeIds.length) throw new Error("places");
  }
  if (cityIds.length > 0) {
    const citiesCount = await tx.city.count({
      where: { id: { in: cityIds }, isActive: true },
    });
    if (citiesCount !== cityIds.length) throw new Error("cities");
  }
}

function cityStopLabel(city: {
  name: string;
  country: string | null;
  region: string | null;
}) {
  const parts = [city.name];
  if (city.region?.trim()) parts.push(city.region.trim());
  if (city.country?.trim()) parts.push(city.country.trim());
  return parts.join(" — ");
}

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
  cities: {
    id: string;
    name: string;
    country: string | null;
    region: string | null;
  }[];
};

export type TourismProgramStopKindValue = "TRAVEL" | "TOURISM";

export type TourismProgramStopRow = {
  id: string;
  name: string;
  order: number;
  kind: TourismProgramStopKindValue;
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
  currency: ProgramCurrency;
  maxSeats: number;
  availableSeats: number;
  status: string;
  isActive: boolean;
  places: TourismProgramStopRow[];
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
    return { garages: [], places: [], cities: [] };
  }

  const garageWhere =
    session.user.role === UserRole.SUPER_ADMIN
      ? { isDeleted: false, isActive: true }
      : { isDeleted: false, isActive: true, ownerId: session.user.id };

  const [garages, places, cities, acceptedPartnerships] = await Promise.all([
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
      where: { isActive: true, approvalStatus: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, governorate: true },
      take: 300,
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ country: "asc" }, { name: "asc" }],
      select: { id: true, name: true, country: true, region: true },
      take: 500,
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
    cities,
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
  const currency = normalizeProgramCurrency(
    String(formData.get("currency") ?? "IQD")
  );
  const maxSeats = Number(formData.get("maxSeats"));
  const stopsParsed = parseProgramStopEntries(formData);
  if ("error" in stopsParsed) return { error: stopsParsed.error };
  const stops = stopsParsed.stops;
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
    stops.length === 0
  ) {
    return { error: "أكمل الحقول المطلوبة، وأضف محطة سفر أو سياحة واحدة على الأقل" };
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

  const uniquePartnershipIds = Array.from(new Set(partnershipIds));

  try {
    const createdProgram = await prisma.$transaction(async (tx) => {
      const garage = await tx.garage.findFirst({
        where: { id: garageId, isDeleted: false, isActive: true },
        select: { id: true, ownerId: true, name: true },
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
        select: {
          id: true,
          totalSeats: true,
          brand: true,
          model: true,
          seatLayoutJson: true,
          category: true,
        },
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

      await assertProgramStopsValid(tx, stops);

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
          currency,
          maxSeats,
          availableSeats: maxSeats,
          status: "SCHEDULED",
          isActive: true,
        },
      });

      await createProgramSeatsInTx(tx, program.id, vehicle, maxSeats);
      await tx.tourismProgramPlace.createMany({
        data: stops.map((s, idx) => ({
          programId: program.id,
          stopKind: s.kind,
          tourismPlaceId: s.tourismPlaceId,
          cityId: s.cityId,
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

      return { id: program.id, title: program.title, garageName: garage.name };
    });

    revalidatePath("/trips");
    revalidatePath("/tourism-programs");
    revalidatePath("/passenger/tourism-programs");
    revalidatePath("/home");

    try {
      await notifyAllPassengers({
        type: "NEW_TOURISM_PROGRAM",
        title: "برنامج سياحي جديد",
        body: `أُضيف برنامج «${createdProgram.title}» من ${createdProgram.garageName} — يمكنك الحجز الآن.`,
        data: {
          programId: createdProgram.id,
          href: "/passenger/tourism-programs",
        },
      });
    } catch (e) {
      console.error("notify passengers program", e);
    }

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
    if (msg === "cities") return { error: "بعض مدن السفر المحددة غير صالحة" };
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
  currency?: string | null;
  maxSeats: number;
  availableSeats: number;
  status: string;
  isActive: boolean;
  garage: { name: string };
  vehicle: { brand: string; model: string; plateNumber: string };
  driver: { name: string };
  places: {
    stopOrder: number;
    stopKind?: TourismProgramStopKind | string | null;
    tourismPlaceId?: string | null;
    cityId?: string | null;
    place: { id: string; name: string } | null;
    city?: {
      id: string;
      name: string;
      country: string | null;
      region: string | null;
    } | null;
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
    currency: normalizeProgramCurrency(p.currency),
    maxSeats: p.maxSeats,
    availableSeats: p.availableSeats,
    status: p.status,
    isActive: p.isActive,
    places: p.places
      .map((x) => {
        const kind: TourismProgramStopKindValue =
          x.stopKind === TourismProgramStopKind.TRAVEL || x.stopKind === "TRAVEL"
            ? "TRAVEL"
            : "TOURISM";
        if (kind === "TRAVEL" && x.city) {
          return {
            id: x.city.id,
            name: cityStopLabel(x.city),
            order: x.stopOrder,
            kind,
          };
        }
        return {
          id: x.place?.id ?? x.tourismPlaceId ?? "",
          name: x.place?.name ?? "—",
          order: x.stopOrder,
          kind: "TOURISM" as const,
        };
      })
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

const programStopInclude = {
  stopOrder: true,
  stopKind: true,
  tourismPlaceId: true,
  cityId: true,
  place: { select: { id: true, name: true } },
  city: {
    select: { id: true, name: true, country: true, region: true },
  },
} as const;

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
      places: { select: programStopInclude },
      partners: { select: programPartnerInclude },
    },
  });
  return rows.map(mapProgramRow);
}

export async function getTourismProgramsForPassenger(): Promise<
  TourismProgramPassengerRow[]
> {
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
      places: { select: programStopInclude },
      partners: { select: programPartnerInclude },
    },
  });
  return rows.map(mapProgramRow);
}

export async function getTourismProgramsForGaragePassenger(
  garageId: string
): Promise<TourismProgramPassengerRow[]> {
  const id = garageId.trim();
  if (!id) return [];

  const garageOk = await prisma.garage.findFirst({
    where: { id, isDeleted: false, isActive: true },
    select: { id: true },
  });
  if (!garageOk) return [];

  const rows = await prisma.tourismProgram.findMany({
    where: {
      garageId: id,
      isActive: true,
      status: "SCHEDULED",
      availableSeats: { gt: 0 },
      startAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    orderBy: { startAt: "asc" },
    take: 100,
    include: {
      garage: { select: { name: true } },
      vehicle: { select: { brand: true, model: true, plateNumber: true } },
      driver: { select: { name: true } },
      places: { select: programStopInclude },
      partners: { select: programPartnerInclude },
    },
  });
  return rows.map(mapProgramRow);
}

export type TourismCompanyBrowseRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  programsCount: number;
  tripsCount: number;
  nextProgramTitle: string | null;
  nextProgramAt: string | null;
};

/** شركات لديها برامج (أو رحلات) متاحة — لصفحة تصفّح البرامج */
export async function getTourismCompaniesForPassengerBrowse(): Promise<
  TourismCompanyBrowseRow[]
> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const programWhere = {
    isActive: true,
    status: "SCHEDULED" as const,
    availableSeats: { gt: 0 },
    startAt: { gte: since },
  };
  const tripWhere = {
    status: TripStatus.SCHEDULED,
    availableSeats: { gt: 0 },
    departureTime: { gte: since },
  };

  const rows = await prisma.garage.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      tourismPrograms: { some: programWhere },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      phone: true,
      address: true,
      tourismPrograms: {
        where: programWhere,
        orderBy: { startAt: "asc" },
        take: 1,
        select: { title: true, startAt: true },
      },
      _count: {
        select: {
          tourismPrograms: { where: programWhere },
          trips: { where: tripWhere },
        },
      },
    },
  });

  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    phone: g.phone,
    address: g.address,
    programsCount: g._count.tourismPrograms,
    tripsCount: g._count.trips,
    nextProgramTitle: g.tourismPrograms[0]?.title ?? null,
    nextProgramAt: g.tourismPrograms[0]
      ? g.tourismPrograms[0].startAt.toISOString()
      : null,
  }));
}

export async function getProgramSeatsForMap(
  programId: string
): Promise<
  {
    id: string;
    seatNumber: number;
    row: number | null;
    col: number | null;
    label: string | null;
    status: string;
  }[]
> {
  const id = programId.trim();
  if (!id) return [];

  const program = await prisma.tourismProgram.findFirst({
    where: { id, isActive: true, status: "SCHEDULED" },
    select: {
      id: true,
      maxSeats: true,
      vehicle: {
        select: {
          brand: true,
          model: true,
          totalSeats: true,
          seatLayoutJson: true,
          category: true,
        },
      },
    },
  });
  if (!program) return [];

  let seats = await prisma.seat.findMany({
    where: { programId: id },
    orderBy: { seatNumber: "asc" },
    select: {
      id: true,
      seatNumber: true,
      row: true,
      col: true,
      label: true,
      status: true,
    },
  });

  if (seats.length === 0) {
    await prisma.$transaction(async (tx) => {
      await createProgramSeatsInTx(
        tx,
        program.id,
        program.vehicle,
        program.maxSeats
      );
      const available = await tx.seat.count({
        where: { programId: program.id, status: SeatStatus.AVAILABLE },
      });
      await tx.tourismProgram.update({
        where: { id: program.id },
        data: { availableSeats: available },
      });
    });
    seats = await prisma.seat.findMany({
      where: { programId: id },
      orderBy: { seatNumber: "asc" },
      select: {
        id: true,
        seatNumber: true,
        row: true,
        col: true,
        label: true,
        status: true,
      },
    });
  }

  return seats.map((s) => ({
    id: s.id,
    seatNumber: s.seatNumber,
    row: s.row,
    col: s.col,
    label: s.label,
    status: s.status,
  }));
}

/** حجز مقعد أو أكثر على مركبة البرنامج السياحي */
export async function bookSeatsOnTourismProgram(
  programId: string,
  seatIds: string[]
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح للمسافر فقط" };
  }

  const id = programId.trim();
  if (!id) return { error: "معرف البرنامج غير صالح" };

  const uniqueSeatIds = [
    ...new Set(seatIds.map((x) => String(x).trim()).filter(Boolean)),
  ];
  if (uniqueSeatIds.length === 0) {
    return { error: "اختر مقعداً واحداً على الأقل" };
  }

  try {
    const notifyTargets: { userId: string; title: string; body: string }[] = [];
    const passengersCount = uniqueSeatIds.length;

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
          maxSeats: true,
          vehicle: {
            select: {
              brand: true,
              model: true,
              totalSeats: true,
              seatLayoutJson: true,
              category: true,
            },
          },
          partners: {
            include: {
              partnership: {
                include: {
                  hotel: { select: { id: true, ownerId: true, name: true } },
                  restaurant: {
                    select: { id: true, ownerId: true, name: true },
                  },
                  farm: { select: { id: true, ownerId: true, name: true } },
                },
              },
            },
            orderBy: { stopOrder: "asc" },
          },
        },
      });
      if (!p) throw new Error("program");

      const seatCount = await tx.seat.count({ where: { programId: p.id } });
      if (seatCount === 0) {
        await createProgramSeatsInTx(tx, p.id, p.vehicle, p.maxSeats);
      }

      const seats = await tx.seat.findMany({
        where: {
          id: { in: uniqueSeatIds },
          programId: p.id,
          status: SeatStatus.AVAILABLE,
        },
      });
      if (seats.length !== uniqueSeatIds.length) throw new Error("seat");

      let totalAddon = new Prisma.Decimal(0);
      for (const link of p.partners) {
        totalAddon = totalAddon.add(link.priceAddon);
      }
      const priceAtBooking = p.basePrice.add(totalAddon);

      for (const seat of seats) {
        await tx.tourismProgramBooking.create({
          data: {
            programId: p.id,
            userId: session.user.id,
            seatId: seat.id,
            status: BookingStatus.PENDING,
            priceAtBooking,
            passengersCount: 1,
          },
        });
        await tx.seat.update({
          where: { id: seat.id },
          data: { status: SeatStatus.RESERVED },
        });
      }

      await tx.tourismProgram.update({
        where: { id: p.id },
        data: { availableSeats: { decrement: passengersCount } },
      });

      const checkIn = p.startAt;
      const checkOut =
        p.endAt && p.endAt > p.startAt
          ? p.endAt
          : new Date(p.startAt.getTime() + 24 * 60 * 60 * 1000);
      const packageNote = `حجز ضمن الباقة السياحية: ${p.title} (${passengersCount} مقعد)`;

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
    revalidatePath("/passenger/garages");
    revalidatePath("/bookings");
    revalidatePath("/hotel-bookings");
    revalidatePath("/restaurant-bookings");
    revalidatePath("/farm-bookings");
    revalidatePath("/home");
    return { success: true, count: uniqueSeatIds.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "seat") return { error: "أحد المقاعد لم يعد متاحاً" };
    if (msg === "program") return { error: "البرنامج غير متاح للحجز" };
    return { error: "تعذر الحجز على البرنامج السياحي" };
  }
}

/** @deprecated استخدم bookSeatsOnTourismProgram */
export async function bookTourismProgram(
  programId: string,
  _passengersCount: number
) {
  return {
    error: "اختر المقاعد من خريطة المركبة لإتمام الحجز",
  };
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
  const currency = normalizeProgramCurrency(
    String(formData.get("currency") ?? "IQD")
  );
  const maxSeats = Number(formData.get("maxSeats"));
  const status = String(formData.get("status") ?? "SCHEDULED");
  const isActive = String(formData.get("isActive") ?? "true") === "true";
  const stopsParsed = parseProgramStopEntries(formData);
  if ("error" in stopsParsed) return { error: stopsParsed.error };
  const stops = stopsParsed.stops;
  const partnershipIds = formData
    .getAll("partnershipIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!id || !title || !garageId || !vehicleId || !driverId || !startAtRaw || !basePriceRaw || !maxSeats || stops.length === 0) {
    return { error: "أكمل الحقول المطلوبة، وأضف محطة سفر أو سياحة واحدة على الأقل" };
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

  const uniquePartnershipIds = Array.from(new Set(partnershipIds));

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.tourismProgram.findUnique({
        where: { id },
        select: {
          id: true,
          garageId: true,
          vehicleId: true,
          maxSeats: true,
          availableSeats: true,
        },
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
        select: {
          id: true,
          totalSeats: true,
          brand: true,
          model: true,
          seatLayoutJson: true,
          category: true,
        },
      });
      if (!vehicle) throw new Error("vehicle");

      const reservedSeats = await tx.seat.count({
        where: {
          programId: existing.id,
          status: { not: SeatStatus.AVAILABLE },
        },
      });
      const bookedSeats = Math.max(
        reservedSeats,
        existing.maxSeats - existing.availableSeats
      );
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

      await assertProgramStopsValid(tx, stops);

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

      const seatCount = await tx.seat.count({
        where: { programId: existing.id },
      });
      const layoutChanged =
        existing.vehicleId !== vehicle.id || existing.maxSeats !== maxSeats;

      if (seatCount === 0) {
        await createProgramSeatsInTx(tx, existing.id, vehicle, maxSeats);
      } else if (layoutChanged && reservedSeats === 0) {
        await tx.seat.deleteMany({ where: { programId: existing.id } });
        await createProgramSeatsInTx(tx, existing.id, vehicle, maxSeats);
      }

      const availableSeats = await tx.seat.count({
        where: { programId: existing.id, status: SeatStatus.AVAILABLE },
      });

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
          currency,
          maxSeats,
          availableSeats:
            seatCount === 0 || (layoutChanged && reservedSeats === 0)
              ? availableSeats
              : Math.max(0, maxSeats - bookedSeats),
          status: status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
          isActive,
        },
      });

      await tx.tourismProgramPlace.deleteMany({ where: { programId: existing.id } });
      await tx.tourismProgramPlace.createMany({
        data: stops.map((s, idx) => ({
          programId: existing.id,
          stopKind: s.kind,
          tourismPlaceId: s.tourismPlaceId,
          cityId: s.cityId,
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
    if (msg === "cities") return { error: "بعض مدن السفر المحددة غير صالحة" };
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


import { prisma } from "@/lib/prisma";
import { Prisma, SeatStatus, TransportType, TripStatus } from "@prisma/client";

const tripInclude = {
  fromCity: { select: { name: true, region: true } },
  toCity: { select: { name: true, region: true } },
  garage: { select: { name: true, address: true } },
  driver: {
    select: {
      name: true,
      driverProfile: { select: { location: true } },
    },
  },
} as const;

const upcomingWhere = {
  status: TripStatus.SCHEDULED,
  availableSeats: { gt: 0 },
  departureTime: { gte: new Date(Date.now() - 60 * 60 * 1000) },
};

function mapTrip(t: {
  id: string;
  garageId: string | null;
  departureTime: Date;
  basePrice: Prisma.Decimal;
  availableSeats: number;
  transportType: TransportType;
  fromCity: { name: string; region: string | null };
  toCity: { name: string; region: string | null };
  garage: { name: string; address: string | null } | null;
  driver: { name: string; driverProfile: { location: string | null } | null };
}) {
  return {
    id: t.id,
    fromCity: t.fromCity.name,
    toCity: t.toCity.name,
    fromRegion: t.fromCity.region,
    toRegion: t.toCity.region,
    departureTime: t.departureTime.toISOString(),
    basePrice: String(t.basePrice),
    availableSeats: t.availableSeats,
    transportType: t.transportType,
    garageName: t.garage?.name ?? null,
    garageId: t.garageId,
    isFreelance: !t.garageId,
    driverName: t.driver.name,
    sourceLocation: t.garageId
      ? (t.garage?.address?.trim() ?? null)
      : (t.driver.driverProfile?.location?.trim() ?? null),
  };
}

export async function fetchGarageById(garageId: string) {
  return prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      phone: true,
      address: true,
    },
  });
}

export async function fetchGaragesForPassenger() {
  return prisma.garage.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      phone: true,
      address: true,
    },
  });
}

export async function fetchTripsForGarage(garageId: string) {
  const ok = await prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false, isActive: true },
    select: { id: true },
  });
  if (!ok) return [];
  const rows = await prisma.trip.findMany({
    where: { ...upcomingWhere, garageId },
    orderBy: { departureTime: "asc" },
    take: 100,
    include: tripInclude,
  });
  return rows.map(mapTrip);
}

export async function fetchFreelanceTrips() {
  const rows = await prisma.trip.findMany({
    where: { ...upcomingWhere, garageId: null },
    orderBy: { departureTime: "asc" },
    take: 100,
    include: tripInclude,
  });
  return rows.map(mapTrip);
}

export async function searchTrips(params: {
  fromCityId?: string;
  toCityId?: string;
  q?: string;
  scope?: "all" | "garage" | "freelance";
}) {
  const scope = params.scope ?? "all";
  const q = (params.q ?? "").trim();
  const andParts: Prisma.TripWhereInput[] = [];
  if (q) {
    andParts.push({
      OR: [
        { fromCity: { name: { contains: q, mode: "insensitive" } } },
        { toCity: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  const rows = await prisma.trip.findMany({
    where: {
      ...upcomingWhere,
      ...(params.fromCityId ? { fromCityId: params.fromCityId } : {}),
      ...(params.toCityId ? { toCityId: params.toCityId } : {}),
      ...(scope === "garage" ? { garageId: { not: null } } : {}),
      ...(scope === "freelance" ? { garageId: null } : {}),
      ...(andParts.length ? { AND: andParts } : {}),
    },
    orderBy: { departureTime: "asc" },
    take: 100,
    include: tripInclude,
  });
  return rows.map(mapTrip);
}

export async function fetchAvailableSeats(tripId: string) {
  const tripOk = await prisma.trip.findFirst({
    where: { id: tripId, status: TripStatus.SCHEDULED },
    select: { id: true },
  });
  if (!tripOk) return [];
  return prisma.seat.findMany({
    where: { tripId, status: SeatStatus.AVAILABLE },
    orderBy: { seatNumber: "asc" },
    select: { id: true, seatNumber: true },
  });
}

export async function fetchTourismProgramsForPassenger() {
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
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    notes: p.notes,
    garageId: p.garageId,
    garageName: p.garage.name,
    vehicleLabel: `${p.vehicle.brand} ${p.vehicle.model} — ${p.vehicle.plateNumber}`,
    driverName: p.driver.name,
    startAt: p.startAt.toISOString(),
    endAt: p.endAt ? p.endAt.toISOString() : null,
    basePrice: String(p.basePrice),
    maxSeats: p.maxSeats,
    availableSeats: p.availableSeats,
    status: p.status,
    places: p.places
      .map((x) => ({ id: x.place.id, name: x.place.name, order: x.stopOrder }))
      .sort((a, b) => a.order - b.order),
  }));
}

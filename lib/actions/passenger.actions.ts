"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  Prisma,
  SeatStatus,
  TransportType,
  TripStatus,
} from "@prisma/client";

export type PublicGarageRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
};

export async function getPublicGaragesForPassenger(): Promise<PublicGarageRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];

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

export async function getPublicGarageByIdForPassenger(
  garageId: string
): Promise<PublicGarageRow | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return null;
  const id = garageId.trim();
  if (!id) return null;

  return prisma.garage.findFirst({
    where: { id, isDeleted: false, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      phone: true,
      address: true,
    },
  });
}

function mapTripToPassengerRow(t: {
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
}): PassengerTripRow {
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
    isFreelance: !t.garageId,
    driverName: t.driver.name,
    sourceLocation: t.garageId
      ? (t.garage?.address?.trim() ?? null)
      : (t.driver.driverProfile?.location?.trim() ?? null),
  };
}

export async function getTripsForGaragePassenger(
  garageId: string
): Promise<PassengerTripRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];
  const id = garageId.trim();
  if (!id) return [];

  const garageOk = await prisma.garage.findFirst({
    where: { id, isDeleted: false, isActive: true },
    select: { id: true },
  });
  if (!garageOk) return [];

  const rows = await prisma.trip.findMany({
    where: {
      garageId: id,
      status: TripStatus.SCHEDULED,
      availableSeats: { gt: 0 },
      departureTime: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    orderBy: { departureTime: "asc" },
    take: 100,
    include: {
      fromCity: { select: { name: true, region: true } },
      toCity: { select: { name: true, region: true } },
      garage: { select: { name: true, address: true } },
      driver: {
        select: {
          name: true,
          driverProfile: { select: { location: true } },
        },
      },
    },
  });

  return rows.map(mapTripToPassengerRow);
}

export type PassengerTripScope = "all" | "garage" | "freelance";

export type PassengerTripRow = {
  id: string;
  fromCity: string;
  toCity: string;
  fromRegion: string | null;
  toRegion: string | null;
  departureTime: string;
  basePrice: string;
  availableSeats: number;
  transportType: string;
  garageName: string | null;
  isFreelance: boolean;
  driverName: string;
  sourceLocation: string | null;
};

export async function searchTripsForPassenger(params: {
  fromCityId?: string;
  toCityId?: string;
  q?: string;
  scope?: PassengerTripScope;
}): Promise<PassengerTripRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];

  const scope = params.scope ?? "all";
  const q = (params.q ?? "").trim();

  const andParts: Prisma.TripWhereInput[] = [];
  if (q.length > 0) {
    andParts.push({
      OR: [
        { fromCity: { name: { contains: q, mode: "insensitive" } } },
        { toCity: { name: { contains: q, mode: "insensitive" } } },
        { fromCity: { region: { contains: q, mode: "insensitive" } } },
        { toCity: { region: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  const rows = await prisma.trip.findMany({
    where: {
      status: TripStatus.SCHEDULED,
      availableSeats: { gt: 0 },
      departureTime: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      ...(params.fromCityId ? { fromCityId: params.fromCityId } : {}),
      ...(params.toCityId ? { toCityId: params.toCityId } : {}),
      ...(scope === "garage" ? { garageId: { not: null } } : {}),
      ...(scope === "freelance" ? { garageId: null } : {}),
      ...(andParts.length ? { AND: andParts } : {}),
    },
    orderBy: { departureTime: "asc" },
    take: 100,
    include: {
      fromCity: { select: { name: true, region: true } },
      toCity: { select: { name: true, region: true } },
      garage: { select: { name: true, address: true } },
      driver: {
        select: {
          name: true,
          driverProfile: { select: { location: true } },
        },
      },
    },
  });

  return rows.map(mapTripToPassengerRow);
}

/** كل الرحلات المستقلة (بدون كراج) المتاحة للحجز — لصفحة كراجات المسافر. */
export async function getFreelanceTripsForPassenger(): Promise<
  PassengerTripRow[]
> {
  return searchTripsForPassenger({ scope: "freelance" });
}

export type TripSeatOption = {
  id: string;
  seatNumber: number;
};

export async function getAvailableSeatsForTrip(
  tripId: string
): Promise<TripSeatOption[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) return [];

  const tripOk = await prisma.trip.findFirst({
    where: { id: tripId, status: TripStatus.SCHEDULED },
    select: { id: true },
  });
  if (!tripOk) return [];

  const seats = await prisma.seat.findMany({
    where: {
      tripId,
      status: SeatStatus.AVAILABLE,
    },
    orderBy: { seatNumber: "asc" },
    select: { id: true, seatNumber: true },
  });
  return seats;
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  BookingStatus,
  LuggageKind,
  Prisma,
  SeatStatus,
  TripStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { BookTripLuggagePayload } from "@/lib/luggage-labels";

const MAX_LUGGAGE_ITEMS = 24;

export type BookingLuggageRow = {
  kind: string;
  weightKg: string | null;
  dimensions: string | null;
  quantity: number;
};

export type BookingRow = {
  id: string;
  bookingKind: "trip" | "tourism_program" | "hotel" | "restaurant" | "farm";
  passengerName: string;
  passengerEmail?: string | null;
  status: string;
  priceAtBooking: string;
  passengersCount: number;
  createdAt: Date;
  departureTime: Date | null;
  tripFromCity: string | null;
  tripFromRegion: string | null;
  tripToCity: string | null;
  tripToRegion: string | null;
  seatNumber: number | null;
  luggage: BookingLuggageRow[];
  programTitle: string | null;
  programGarageName: string | null;
  programVehicleLabel: string | null;
  programDriverName: string | null;
  programPlaces: { name: string; order: number }[];
  placeName: string | null;
  detailLabel: string | null;
};

const luggageKindSet = new Set<string>(Object.values(LuggageKind));

function parseWeightKg(raw: unknown): Prisma.Decimal | null {
  if (raw === undefined || raw === null) return null;
  const t = String(raw).trim().replace(/,/g, ".");
  if (!t) return null;
  const n = Number(t);
  if (Number.isNaN(n) || n <= 0) return null;
  return new Prisma.Decimal(n.toFixed(2));
}

function parseQuantity(raw: unknown, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  if (i < 1) return fallback;
  return Math.min(i, 99);
}

function parseLuggageForCreate(raw: unknown):
  | {
      ok: true;
      items: {
        kind: LuggageKind;
        weightKg: Prisma.Decimal | null;
        dimensions: string | null;
        quantity: number;
      }[];
    }
  | { ok: false; error: string } {
  if (raw === undefined || raw === null) {
    return { ok: true, items: [] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false, error: "بيانات أمتعة غير صالحة" };
  }
  if (raw.length === 0) {
    return { ok: true, items: [] };
  }
  if (raw.length > MAX_LUGGAGE_ITEMS) {
    return { ok: false, error: "عدد قطع الأمتعة كبير جداً" };
  }

  const items: {
    kind: LuggageKind;
    weightKg: Prisma.Decimal | null;
    dimensions: string | null;
    quantity: number;
  }[] = [];

  for (const row of raw) {
    if (!row || typeof row !== "object") {
      return { ok: false, error: "بيانات أمتعة غير صالحة" };
    }
    const o = row as Record<string, unknown>;
    const kindStr = String(o.kind ?? "");
    if (!luggageKindSet.has(kindStr)) {
      return { ok: false, error: "نوع غرض غير معروف" };
    }
    const kind = kindStr as LuggageKind;
    const weightKg = parseWeightKg(o.weightKg);
    const dimensionsRaw = String(o.dimensions ?? "").trim();
    const dimensions =
      dimensionsRaw.length > 0 ? dimensionsRaw.slice(0, 120) : null;

    if (kind === LuggageKind.SACK) {
      const quantity = parseQuantity(o.quantity, 0);
      if (quantity < 1) {
        return { ok: false, error: "للكيس: أدخل عدد الأكياس (عدد ≥ 1)" };
      }
      items.push({
        kind,
        weightKg,
        dimensions: null,
        quantity,
      });
    } else {
      if (!weightKg) {
        return {
          ok: false,
          error: "أدخل وزن كل حقيبة أو كرتون بالكيلوغرام",
        };
      }
      if (!dimensions) {
        return {
          ok: false,
          error: "أدخل حجم القطعة (مثال: 70×45×30 سم)",
        };
      }
      const quantity = parseQuantity(o.quantity, 1);
      items.push({ kind, weightKg, dimensions, quantity });
    }
  }

  return { ok: true, items };
}

function mapBookingRow(b: {
  id: string;
  user: { name: string; email?: string | null };
  status: BookingStatus;
  priceAtBooking: Prisma.Decimal;
  createdAt: Date;
  trip: {
    departureTime: Date;
    fromCity: { name: string; region: string | null };
    toCity: { name: string; region: string | null };
  };
  seat: { seatNumber: number } | null;
  luggageItems: {
    kind: LuggageKind;
    weightKg: Prisma.Decimal | null;
    dimensions: string | null;
    quantity: number;
  }[];
}): BookingRow {
  return {
    id: b.id,
    bookingKind: "trip",
    passengerName: b.user.name,
    passengerEmail: b.user.email ?? null,
    status: b.status,
    priceAtBooking: String(b.priceAtBooking),
    passengersCount: 1,
    createdAt: b.createdAt,
    departureTime: b.trip.departureTime,
    tripFromCity: b.trip.fromCity.name,
    tripFromRegion: b.trip.fromCity.region,
    tripToCity: b.trip.toCity.name,
    tripToRegion: b.trip.toCity.region,
    seatNumber: b.seat?.seatNumber ?? null,
    luggage: b.luggageItems.map((l) => ({
      kind: l.kind,
      weightKg: l.weightKg != null ? String(l.weightKg) : null,
      dimensions: l.dimensions,
      quantity: l.quantity,
    })),
    programTitle: null,
    programGarageName: null,
    programVehicleLabel: null,
    programDriverName: null,
    programPlaces: [],
    placeName: null,
    detailLabel: null,
  };
}

function mapProgramBookingRow(b: {
  id: string;
  user: { name: string; email?: string | null };
  status: BookingStatus;
  priceAtBooking: Prisma.Decimal;
  passengersCount: number;
  createdAt: Date;
  program: {
    title: string;
    startAt: Date;
    garage: { name: string };
    vehicle: { brand: string; model: string; plateNumber: string };
    driver: { name: string };
    places: { stopOrder: number; place: { name: string } }[];
  };
}): BookingRow {
  return {
    id: b.id,
    bookingKind: "tourism_program",
    passengerName: b.user.name,
    passengerEmail: b.user.email ?? null,
    status: b.status,
    priceAtBooking: String(b.priceAtBooking),
    passengersCount: b.passengersCount,
    createdAt: b.createdAt,
    departureTime: b.program.startAt,
    tripFromCity: null,
    tripFromRegion: null,
    tripToCity: null,
    tripToRegion: null,
    seatNumber: null,
    luggage: [],
    programTitle: b.program.title,
    programGarageName: b.program.garage.name,
    programVehicleLabel: `${b.program.vehicle.brand} ${b.program.vehicle.model} — ${b.program.vehicle.plateNumber}`,
    programDriverName: b.program.driver.name,
    programPlaces: b.program.places
      .map((p) => ({ name: p.place.name, order: p.stopOrder }))
      .sort((a, b2) => a.order - b2.order),
    placeName: null,
    detailLabel: null,
  };
}

function mapPlaceBookingRow(input: {
  id: string;
  bookingKind: "hotel" | "restaurant" | "farm";
  passengerName: string;
  passengerEmail?: string | null;
  status: BookingStatus;
  priceAtBooking: string;
  passengersCount: number;
  createdAt: Date;
  departureTime: Date | null;
  placeName: string;
  detailLabel: string | null;
}): BookingRow {
  return {
    id: input.id,
    bookingKind: input.bookingKind,
    passengerName: input.passengerName,
    passengerEmail: input.passengerEmail ?? null,
    status: input.status,
    priceAtBooking: input.priceAtBooking,
    passengersCount: input.passengersCount,
    createdAt: input.createdAt,
    departureTime: input.departureTime,
    tripFromCity: null,
    tripFromRegion: null,
    tripToCity: null,
    tripToRegion: null,
    seatNumber: null,
    luggage: [],
    programTitle: null,
    programGarageName: null,
    programVehicleLabel: null,
    programDriverName: null,
    programPlaces: [],
    placeName: input.placeName,
    detailLabel: input.detailLabel,
  };
}

export async function getBookingsForUser(): Promise<BookingRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  if (session.user.role === UserRole.SUPER_ADMIN) {
    const [tripRows, programRows] = await Promise.all([
      prisma.booking.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          trip: {
            include: {
              fromCity: { select: { name: true, region: true } },
              toCity: { select: { name: true, region: true } },
            },
          },
          seat: { select: { seatNumber: true } },
          luggageItems: {
            orderBy: { createdAt: "asc" },
            select: {
              kind: true,
              weightKg: true,
              dimensions: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.tourismProgramBooking.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          program: {
            include: {
              garage: { select: { name: true } },
              vehicle: { select: { brand: true, model: true, plateNumber: true } },
              driver: { select: { name: true } },
              places: { include: { place: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);
    return [...tripRows.map(mapBookingRow), ...programRows.map(mapProgramBookingRow)].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  if (
    session.user.role === UserRole.GARAGE_OWNER ||
    session.user.role === UserRole.DRIVER
  ) {
    const garageFilter =
      session.user.role === UserRole.GARAGE_OWNER
        ? { garage: { ownerId: session.user.id, isDeleted: false } }
        : { driverId: session.user.id };

    const programFilter =
      session.user.role === UserRole.GARAGE_OWNER
        ? { program: { garage: { ownerId: session.user.id, isDeleted: false } } }
        : { program: { driverId: session.user.id } };

    const [tripRows, programRows] = await Promise.all([
      prisma.booking.findMany({
        where: { trip: garageFilter },
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          trip: {
            include: {
              fromCity: { select: { name: true, region: true } },
              toCity: { select: { name: true, region: true } },
            },
          },
          seat: { select: { seatNumber: true } },
          luggageItems: {
            orderBy: { createdAt: "asc" },
            select: {
              kind: true,
              weightKg: true,
              dimensions: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.tourismProgramBooking.findMany({
        where: programFilter,
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          program: {
            include: {
              garage: { select: { name: true } },
              vehicle: { select: { brand: true, model: true, plateNumber: true } },
              driver: { select: { name: true } },
              places: { include: { place: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);
    return [...tripRows.map(mapBookingRow), ...programRows.map(mapProgramBookingRow)].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const [tripRows, programRows, hotelRows, restaurantRows, farmRows] =
    await Promise.all([
      prisma.booking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          trip: {
            include: {
              fromCity: { select: { name: true, region: true } },
              toCity: { select: { name: true, region: true } },
            },
          },
          seat: { select: { seatNumber: true } },
          luggageItems: {
            orderBy: { createdAt: "asc" },
            select: {
              kind: true,
              weightKg: true,
              dimensions: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.tourismProgramBooking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          program: {
            include: {
              garage: { select: { name: true } },
              vehicle: { select: { brand: true, model: true, plateNumber: true } },
              driver: { select: { name: true } },
              places: { include: { place: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.hotelBooking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          hotel: { select: { name: true } },
          room: { select: { roomNumber: true, roomType: true } },
        },
      }),
      prisma.restaurantBooking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          restaurant: { select: { name: true } },
        },
      }),
      prisma.farmBooking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          farm: { select: { name: true } },
        },
      }),
    ]);

  const placeBookings: BookingRow[] = [
    ...hotelRows.map((b) =>
      mapPlaceBookingRow({
        id: b.id,
        bookingKind: "hotel",
        passengerName: b.user.name,
        passengerEmail: b.user.email,
        status: b.status,
        priceAtBooking: String(b.priceAtBooking),
        passengersCount: b.guests,
        createdAt: b.createdAt,
        departureTime: b.checkIn,
        placeName: b.hotel.name,
        detailLabel: `غرفة ${b.room.roomNumber} · حتى ${b.checkOut.toLocaleDateString("en-US")}`,
      })
    ),
    ...restaurantRows.map((b) =>
      mapPlaceBookingRow({
        id: b.id,
        bookingKind: "restaurant",
        passengerName: b.user.name,
        passengerEmail: b.user.email,
        status: b.status,
        priceAtBooking: "—",
        passengersCount: b.guests,
        createdAt: b.createdAt,
        departureTime: b.reservedAt,
        placeName: b.restaurant.name,
        detailLabel: null,
      })
    ),
    ...farmRows.map((b) =>
      mapPlaceBookingRow({
        id: b.id,
        bookingKind: "farm",
        passengerName: b.user.name,
        passengerEmail: b.user.email,
        status: b.status,
        priceAtBooking: "—",
        passengersCount: b.guests,
        createdAt: b.createdAt,
        departureTime: b.startAt,
        placeName: b.farm.name,
        detailLabel: `إلى ${b.endAt.toLocaleDateString("en-US")}`,
      })
    ),
  ];

  return [
    ...tripRows.map(mapBookingRow),
    ...programRows.map(mapProgramBookingRow),
    ...placeBookings,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function bookSeatsOnTrip(
  tripId: string,
  seatIds: string[],
  luggageItems: BookTripLuggagePayload[]
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "غير مصرح" };
  }

  const role = session.user.role;
  const isPassenger = role === UserRole.USER;
  const isGarageStaff =
    role === UserRole.GARAGE_OWNER || role === UserRole.SUPER_ADMIN;
  if (!isPassenger && !isGarageStaff) {
    return { error: "لا تملك صلاحية الحجز على الرحلات" };
  }

  const uniqueSeatIds = [...new Set(seatIds.map((id) => String(id).trim()).filter(Boolean))];
  if (uniqueSeatIds.length === 0) {
    return { error: "اختر مقعداً واحداً على الأقل" };
  }

  const parsed = parseLuggageForCreate(luggageItems);
  if (!parsed.ok) return { error: parsed.error };

  try {
    await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: {
          id: tripId,
          status: TripStatus.SCHEDULED,
          availableSeats: { gte: uniqueSeatIds.length },
        },
        select: {
          id: true,
          basePrice: true,
          garageId: true,
          garage: { select: { ownerId: true } },
        },
      });
      if (!trip) throw new Error("trip");

      if (isGarageStaff && role === UserRole.GARAGE_OWNER) {
        if (!trip.garageId || trip.garage?.ownerId !== session.user.id) {
          throw new Error("ownership");
        }
      }

      const seats = await tx.seat.findMany({
        where: {
          id: { in: uniqueSeatIds },
          tripId,
          status: SeatStatus.AVAILABLE,
        },
      });
      if (seats.length !== uniqueSeatIds.length) throw new Error("seat");

      let luggageAttached = false;
      for (const seat of seats) {
        const booking = await tx.booking.create({
          data: {
            userId: session.user.id,
            tripId,
            seatId: seat.id,
            status: BookingStatus.PENDING,
            priceAtBooking: trip.basePrice,
          },
        });

        if (!luggageAttached && parsed.items.length > 0) {
          await tx.bookingLuggageItem.createMany({
            data: parsed.items.map((item) => ({
              bookingId: booking.id,
              kind: item.kind,
              weightKg: item.weightKg,
              dimensions: item.dimensions,
              quantity: item.quantity,
            })),
          });
          luggageAttached = true;
        }

        await tx.seat.update({
          where: { id: seat.id },
          data: { status: SeatStatus.RESERVED },
        });
      }

      await tx.trip.update({
        where: { id: tripId },
        data: { availableSeats: { decrement: uniqueSeatIds.length } },
      });
    });
    revalidatePath("/bookings");
    revalidatePath("/passenger/trips");
    revalidatePath("/passenger/freelance-trips");
    revalidatePath("/trips");
    revalidatePath("/home");
    return { success: true, count: uniqueSeatIds.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "ownership") {
      return { error: "يمكنك الحجز فقط على رحلات شركتك السياحية" };
    }
    return { error: "تعذر الحجز — ربما تم حجز أحد المقاعد" };
  }
}

export async function bookSeatOnTrip(
  tripId: string,
  seatId: string,
  luggageItems: BookTripLuggagePayload[]
) {
  return bookSeatsOnTrip(tripId, [seatId], luggageItems);
}

export type GarageBookableTrip = {
  id: string;
  label: string;
  availableSeats: number;
  basePrice: string;
  departureTime: string;
};

/** رحلات مجدولة لشركة مالك الكراج — للحجز من صفحة الحجوزات */
export async function getBookableTripsForGarage(): Promise<GarageBookableTrip[]> {
  const session = await auth();
  if (!session?.user) return [];

  let where: Prisma.TripWhereInput = {
    status: TripStatus.SCHEDULED,
    availableSeats: { gt: 0 },
    departureTime: { gte: new Date(Date.now() - 60 * 60 * 1000) },
  };

  if (session.user.role === UserRole.SUPER_ADMIN) {
    where = { ...where, garageId: { not: null } };
  } else if (session.user.role === UserRole.GARAGE_OWNER) {
    where = {
      ...where,
      garage: { ownerId: session.user.id, isDeleted: false },
    };
  } else {
    return [];
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { departureTime: "asc" },
    take: 100,
    include: {
      fromCity: { select: { name: true } },
      toCity: { select: { name: true } },
      garage: { select: { name: true } },
    },
  });

  return trips.map((t) => ({
    id: t.id,
    label: `${t.fromCity.name} → ${t.toCity.name}${
      t.garage?.name ? ` · ${t.garage.name}` : ""
    } · ${t.departureTime.toLocaleString("en-US")} · متبقي ${t.availableSeats}`,
    availableSeats: t.availableSeats,
    basePrice: String(t.basePrice),
    departureTime: t.departureTime.toISOString(),
  }));
}

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const programBooking = await prisma.tourismProgramBooking.findUnique({
    where: { id: bookingId },
    include: { program: { include: { garage: true } } },
  });
  if (programBooking) {
    if (programBooking.status === BookingStatus.CANCELLED) {
      return { error: "الحجز ملغى مسبقاً" };
    }
    const isCustomer = programBooking.userId === session.user.id;
    const isOwnerProgram =
      session.user.role === UserRole.GARAGE_OWNER &&
      programBooking.program.garage.ownerId === session.user.id;
    const isSuper = session.user.role === UserRole.SUPER_ADMIN;
    if (!isCustomer && !isOwnerProgram && !isSuper) {
      return { error: "لا تملك صلاحية إلغاء هذا الحجز" };
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.tourismProgramBooking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });
        await tx.tourismProgram.update({
          where: { id: programBooking.programId },
          data: { availableSeats: { increment: programBooking.passengersCount } },
        });
      });
      revalidatePath("/bookings");
      revalidatePath("/passenger/tourism-programs");
      revalidatePath("/home");
      return { success: true };
    } catch {
      return { error: "تعذر الإلغاء" };
    }
  }

  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });
  if (!b) return { error: "الحجز غير موجود" };
  if (b.status === BookingStatus.CANCELLED) {
    return { error: "الحجز ملغى مسبقاً" };
  }

  const isCustomer = b.userId === session.user.id;
  const isOwnerTrip =
    session.user.role === UserRole.GARAGE_OWNER &&
    b.trip.garageId &&
    (await prisma.garage.findFirst({
      where: { id: b.trip.garageId, ownerId: session.user.id },
    }));
  const isSuper = session.user.role === UserRole.SUPER_ADMIN;

  if (!isCustomer && !isOwnerTrip && !isSuper) {
    return { error: "لا تملك صلاحية إلغاء هذا الحجز" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: "إلغاء من لوحة التحكم",
        },
      });
      await tx.seat.update({
        where: { id: b.seatId },
        data: { status: SeatStatus.AVAILABLE },
      });
      await tx.trip.update({
        where: { id: b.tripId },
        data: { availableSeats: { increment: 1 } },
      });
    });
    revalidatePath("/bookings");
    revalidatePath("/passenger/trips");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الإلغاء" };
  }
}

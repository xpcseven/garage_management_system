import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  LuggageKind,
  Prisma,
  SeatStatus,
  TripStatus,
} from "@prisma/client";
import type { BookTripLuggagePayload } from "@/lib/luggage-labels";

const MAX_LUGGAGE_ITEMS = 24;
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

function parseLuggage(raw: unknown) {
  if (raw === undefined || raw === null) return { ok: true as const, items: [] };
  if (!Array.isArray(raw)) {
    return { ok: false as const, error: "بيانات أمتعة غير صالحة" };
  }
  if (raw.length > MAX_LUGGAGE_ITEMS) {
    return { ok: false as const, error: "عدد قطع الأمتعة كبير جداً" };
  }
  const items: {
    kind: LuggageKind;
    weightKg: Prisma.Decimal | null;
    dimensions: string | null;
    quantity: number;
  }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") {
      return { ok: false as const, error: "بيانات أمتعة غير صالحة" };
    }
    const o = row as Record<string, unknown>;
    const kindStr = String(o.kind ?? "");
    if (!luggageKindSet.has(kindStr)) {
      return { ok: false as const, error: "نوع غرض غير معروف" };
    }
    const kind = kindStr as LuggageKind;
    const weightKg = parseWeightKg(o.weightKg);
    const dimensionsRaw = String(o.dimensions ?? "").trim();
    const dimensions =
      dimensionsRaw.length > 0 ? dimensionsRaw.slice(0, 120) : null;
    if (kind === LuggageKind.SACK) {
      const quantity = parseQuantity(o.quantity, 0);
      if (quantity < 1) {
        return { ok: false as const, error: "للكيس: أدخل عدد الأكياس" };
      }
      items.push({ kind, weightKg, dimensions: null, quantity });
    } else {
      if (!weightKg) {
        return { ok: false as const, error: "أدخل وزن الحقيبة بالكيلوغرام" };
      }
      if (!dimensions) {
        return { ok: false as const, error: "أدخل حجم القطعة" };
      }
      items.push({
        kind,
        weightKg,
        dimensions,
        quantity: parseQuantity(o.quantity, 1),
      });
    }
  }
  return { ok: true as const, items };
}

export async function fetchBookingsForUser(userId: string) {
  const [tripRows, programRows] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
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
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
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

  const trips = tripRows.map((b) => ({
    id: b.id,
    bookingKind: "trip" as const,
    status: b.status,
    priceAtBooking: String(b.priceAtBooking),
    passengersCount: 1,
    createdAt: b.createdAt.toISOString(),
    departureTime: b.trip.departureTime.toISOString(),
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
    programPlaces: [] as { name: string; order: number }[],
  }));

  const programs = programRows.map((b) => ({
    id: b.id,
    bookingKind: "tourism_program" as const,
    status: b.status,
    priceAtBooking: String(b.priceAtBooking),
    passengersCount: b.passengersCount,
    createdAt: b.createdAt.toISOString(),
    departureTime: b.program.startAt.toISOString(),
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
  }));

  return [...trips, ...programs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function bookSeatOnTripForUser(
  userId: string,
  tripId: string,
  seatId: string,
  luggage: BookTripLuggagePayload[]
) {
  const parsed = parseLuggage(luggage);
  if (!parsed.ok) return { error: parsed.error };
  try {
    await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: {
          id: tripId,
          status: TripStatus.SCHEDULED,
          availableSeats: { gt: 0 },
        },
      });
      if (!trip) throw new Error("trip");
      const seat = await tx.seat.findFirst({
        where: { id: seatId, tripId, status: SeatStatus.AVAILABLE },
      });
      if (!seat) throw new Error("seat");
      const booking = await tx.booking.create({
        data: {
          userId,
          tripId,
          seatId,
          status: BookingStatus.PENDING,
          priceAtBooking: trip.basePrice,
        },
      });
      if (parsed.items.length > 0) {
        await tx.bookingLuggageItem.createMany({
          data: parsed.items.map((item) => ({
            bookingId: booking.id,
            kind: item.kind,
            weightKg: item.weightKg,
            dimensions: item.dimensions,
            quantity: item.quantity,
          })),
        });
      }
      await tx.seat.update({
        where: { id: seatId },
        data: { status: SeatStatus.RESERVED },
      });
      await tx.trip.update({
        where: { id: tripId },
        data: { availableSeats: { decrement: 1 } },
      });
    });
    return { success: true as const };
  } catch {
    return { error: "تعذر الحجز — ربما تم حجز المقعد" };
  }
}

export async function bookTourismProgramForUser(
  userId: string,
  programId: string,
  passengersCount: number
) {
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
          userId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
        select: { id: true },
      });
      if (exists) throw new Error("duplicate");
      await tx.tourismProgramBooking.create({
        data: {
          programId: p.id,
          userId,
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
    return { success: true as const };
  } catch (e) {
    if (e instanceof Error && e.message === "duplicate") {
      return { error: "لديك حجز نشط على هذا البرنامج" };
    }
    return { error: "تعذر الحجز على البرنامج" };
  }
}

export async function cancelBookingForUser(
  userId: string,
  bookingId: string
) {
  const programBooking = await prisma.tourismProgramBooking.findUnique({
    where: { id: bookingId },
    select: {
      userId: true,
      status: true,
      passengersCount: true,
      programId: true,
    },
  });
  if (programBooking) {
    if (programBooking.userId !== userId) {
      return { error: "لا تملك صلاحية إلغاء هذا الحجز" };
    }
    if (programBooking.status === BookingStatus.CANCELLED) {
      return { error: "الحجز ملغى مسبقاً" };
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.tourismProgramBooking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });
        await tx.tourismProgram.update({
          where: { id: programBooking.programId },
          data: {
            availableSeats: { increment: programBooking.passengersCount },
          },
        });
      });
      return { success: true as const };
    } catch {
      return { error: "تعذر الإلغاء" };
    }
  }

  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true, status: true, seatId: true, tripId: true },
  });
  if (!b) return { error: "الحجز غير موجود" };
  if (b.userId !== userId) return { error: "لا تملك صلاحية إلغاء هذا الحجز" };
  if (b.status === BookingStatus.CANCELLED) {
    return { error: "الحجز ملغى مسبقاً" };
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: "إلغاء من التطبيق",
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
    return { success: true as const };
  } catch {
    return { error: "تعذر الإلغاء" };
  }
}

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
  status: string;
  priceAtBooking: string;
  createdAt: Date;
  tripFromCity: string;
  tripFromRegion: string | null;
  tripToCity: string;
  tripToRegion: string | null;
  seatNumber: number | null;
  luggage: BookingLuggageRow[];
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
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "أضف غرضاً واحداً على الأقل من الأمتعة" };
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
  status: BookingStatus;
  priceAtBooking: Prisma.Decimal;
  createdAt: Date;
  trip: {
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
    status: b.status,
    priceAtBooking: String(b.priceAtBooking),
    createdAt: b.createdAt,
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
  };
}

export async function getBookingsForUser(): Promise<BookingRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  if (session.user.role === UserRole.SUPER_ADMIN) {
    const rows = await prisma.booking.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
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
    });
    return rows.map(mapBookingRow);
  }

  if (
    session.user.role === UserRole.GARAGE_OWNER ||
    session.user.role === UserRole.DRIVER
  ) {
    const garageFilter =
      session.user.role === UserRole.GARAGE_OWNER
        ? { garage: { ownerId: session.user.id, isDeleted: false } }
        : { driverId: session.user.id };

    const rows = await prisma.booking.findMany({
      where: { trip: garageFilter },
      take: 50,
      orderBy: { createdAt: "desc" },
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
    });
    return rows.map(mapBookingRow);
  }

  const rows = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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
  });
  return rows.map(mapBookingRow);
}

export async function bookSeatOnTrip(
  tripId: string,
  seatId: string,
  luggageItems: BookTripLuggagePayload[]
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.USER) {
    return { error: "الحجز متاح لحسابات المسافر فقط" };
  }

  const parsed = parseLuggageForCreate(luggageItems);
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
        where: {
          id: seatId,
          tripId,
          status: SeatStatus.AVAILABLE,
        },
      });
      if (!seat) throw new Error("seat");

      const booking = await tx.booking.create({
        data: {
          userId: session.user.id,
          tripId,
          seatId,
          status: BookingStatus.PENDING,
          priceAtBooking: trip.basePrice,
        },
      });

      await tx.bookingLuggageItem.createMany({
        data: parsed.items.map((item) => ({
          bookingId: booking.id,
          kind: item.kind,
          weightKg: item.weightKg,
          dimensions: item.dimensions,
          quantity: item.quantity,
        })),
      });

      await tx.seat.update({
        where: { id: seatId },
        data: { status: SeatStatus.RESERVED },
      });

      await tx.trip.update({
        where: { id: tripId },
        data: { availableSeats: { decrement: 1 } },
      });
    });
    revalidatePath("/bookings");
    revalidatePath("/passenger/trips");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الحجز — ربما تم حجز المقعد" };
  }
}

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

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

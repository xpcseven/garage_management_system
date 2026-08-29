import type { VehicleCategory } from "@prisma/client";

export type SeatLayoutCell = {
  n: number;
  row: number;
  col: number;
  label: string;
  isDriver?: boolean;
};

export type SeatLayout = {
  rows: number;
  cols: number;
  seats: SeatLayoutCell[];
};

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  SEDAN: "صالون",
  SUV: "دفع رباعي (SUV)",
  VAN: "فان",
  MINIBUS: "باص صغير",
  BUS: "باص",
  COACH: "حافلة سياحية",
  PICKUP: "بيك أب",
};

export const VEHICLE_BRAND_SUGGESTIONS = [
  "شيفروليه",
  "جي إم سي",
  "مرسيدس",
  "تويوتا",
  "هيونداي",
  "كيا",
  "نيسان",
  "فولكس فاجن",
  "فورد",
  "ميتسوبيشي",
  "هوندا",
  "إيسوزو",
  "لاند روفر",
  "بي إم دبليو",
  "يوتونغ",
  "كينغ لونغ",
  "هايجر",
  "فولفو",
  "سكانيا",
  "مان",
] as const;

function buildGrid(
  rows: number,
  cols: number,
  opts?: { skipCols?: number[]; driverAt?: { row: number; col: number } }
): SeatLayout {
  const skip = new Set(opts?.skipCols ?? []);
  const seats: SeatLayoutCell[] = [];
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (skip.has(c)) continue;
      const isDriver =
        opts?.driverAt?.row === r && opts?.driverAt?.col === c;
      if (isDriver) {
        seats.push({
          n: 0,
          row: r,
          col: c,
          label: "سائق",
          isDriver: true,
        });
        continue;
      }
      seats.push({
        n,
        row: r,
        col: c,
        label: `${String.fromCharCode(65 + r)}${c + 1}`,
      });
      n += 1;
    }
  }
  return { rows, cols, seats };
}

/** قوالب افتراضية حسب نوع المركبة */
export function getDefaultSeatLayout(category: VehicleCategory): SeatLayout {
  switch (category) {
    case "SEDAN":
      // 2+3 مقاعد راكب (بدون عدّ السائق كمقاعد قابلة للحجز)
      return buildGrid(2, 3, { driverAt: { row: 0, col: 0 } });
    case "SUV":
      return buildGrid(3, 3, { driverAt: { row: 0, col: 0 } });
    case "PICKUP":
      return buildGrid(2, 2, { driverAt: { row: 0, col: 0 } });
    case "VAN":
      // ممر في الوسط
      return buildGrid(4, 4, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "MINIBUS":
      return buildGrid(5, 4, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "BUS":
      return buildGrid(8, 5, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "COACH":
      return buildGrid(12, 5, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    default:
      return buildGrid(2, 3, { driverAt: { row: 0, col: 0 } });
  }
}

export function countBookableSeats(layout: SeatLayout): number {
  return layout.seats.filter((s) => !s.isDriver && s.n > 0).length;
}

export function layoutFromTotalSeats(totalSeats: number): SeatLayout {
  const seats: SeatLayoutCell[] = [];
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(totalSeats))));
  const rows = Math.ceil(totalSeats / cols);
  for (let i = 0; i < totalSeats; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    seats.push({
      n: i + 1,
      row,
      col,
      label: String(i + 1),
    });
  }
  return { rows, cols, seats };
}

export function parseSeatLayout(raw: unknown): SeatLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.seats) || typeof o.rows !== "number" || typeof o.cols !== "number") {
    return null;
  }
  return o as SeatLayout;
}

/** بيانات createMany لمقاعد الرحلة (بدون مقعد السائق) */
export function seatsForTripCreate(
  tripId: string,
  layout: SeatLayout,
  maxSeats: number
) {
  return seatsForVehicleCreate({ tripId }, layout, maxSeats);
}

/** مقاعد قابلة للحجز لرحلة أو برنامج سياحي */
export function seatsForVehicleCreate(
  parent: { tripId: string } | { programId: string },
  layout: SeatLayout,
  maxSeats: number
) {
  const bookable = layout.seats
    .filter((s) => !s.isDriver && s.n > 0)
    .sort((a, b) => a.n - b.n)
    .slice(0, maxSeats);

  return bookable.map((s, i) => ({
    ...("tripId" in parent
      ? { tripId: parent.tripId }
      : { programId: parent.programId }),
    seatNumber: i + 1,
    row: s.row,
    col: s.col,
    label: s.label,
  }));
}

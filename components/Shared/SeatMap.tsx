"use client";

import { cn } from "@/lib/utils";

export type SeatMapSeat = {
  id: string;
  seatNumber: number;
  row: number | null;
  col: number | null;
  label: string | null;
  status: "AVAILABLE" | "RESERVED" | "BOOKED" | string;
};

type Props = {
  seats: SeatMapSeat[];
  selectedId?: string | null;
  onSelect?: (seatId: string) => void;
  /** معاينة فقط بدون تفاعل */
  preview?: boolean;
  className?: string;
};

/**
 * مخطط مقاعد:
 * - متاح: إطار خفيف بدون تعبئة
 * - محجوز/محجوز مؤقتاً: أحمر
 * - المحدد: حدود بنفسجية
 */
export default function SeatMap({
  seats,
  selectedId,
  onSelect,
  preview,
  className,
}: Props) {
  const hasGrid = seats.some((s) => s.row != null && s.col != null);

  if (!hasGrid) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {seats.map((s) => {
          const taken = s.status !== "AVAILABLE";
          return (
            <button
              key={s.id}
              type="button"
              disabled={preview || taken || !onSelect}
              onClick={() => onSelect?.(s.id)}
              className={cn(
                "h-10 min-w-10 rounded-md border px-2 text-xs font-medium transition",
                taken
                  ? "border-red-500 bg-red-500 text-white cursor-not-allowed"
                  : selectedId === s.id
                    ? "border-violet-600 bg-violet-100 text-violet-900"
                    : "border-slate-300 bg-transparent hover:border-violet-400"
              )}
            >
              {s.label || s.seatNumber}
            </button>
          );
        })}
      </div>
    );
  }

  const maxRow = Math.max(...seats.map((s) => s.row ?? 0), 0);
  const maxCol = Math.max(...seats.map((s) => s.col ?? 0), 0);
  const byPos = new Map(
    seats.map((s) => [`${s.row}-${s.col}`, s] as const)
  );

  return (
    <div className={cn("space-y-3", className)} dir="ltr">
      <div className="mx-auto w-fit rounded-md border border-dashed border-slate-300 px-6 py-1 text-center text-[11px] text-slate-500">
        مقدمة المركبة
      </div>
      <div
        className="mx-auto grid w-fit gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${maxCol + 1}, minmax(2.25rem, 2.5rem))`,
        }}
      >
        {Array.from({ length: maxRow + 1 }, (_, r) =>
          Array.from({ length: maxCol + 1 }, (_, c) => {
            const seat = byPos.get(`${r}-${c}`);
            if (!seat) {
              return (
                <div
                  key={`empty-${r}-${c}`}
                  className="h-9 w-9"
                  aria-hidden
                />
              );
            }
            const taken = seat.status !== "AVAILABLE";
            return (
              <button
                key={seat.id}
                type="button"
                disabled={preview || taken || !onSelect}
                title={seat.label || `مقعد ${seat.seatNumber}`}
                onClick={() => onSelect?.(seat.id)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border text-[10px] font-semibold transition",
                  taken
                    ? "border-red-600 bg-red-500 text-white cursor-not-allowed"
                    : selectedId === seat.id
                      ? "border-violet-700 bg-violet-100 text-violet-900 ring-2 ring-violet-400"
                      : "border-slate-300 bg-white text-slate-700 hover:border-violet-500"
                )}
              >
                {seat.label || seat.seatNumber}
              </button>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" />
          متاح
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-red-600 bg-red-500" />
          محجوز
        </span>
      </div>
    </div>
  );
}

/** معاينة قالب مركبة قبل الحفظ */
export function SeatLayoutPreview({
  layout,
}: {
  layout: {
    rows: number;
    cols: number;
    seats: {
      n: number;
      row: number;
      col: number;
      label: string;
      isDriver?: boolean;
    }[];
  };
}) {
  const byPos = new Map(
    layout.seats.map((s) => [`${s.row}-${s.col}`, s] as const)
  );

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3" dir="ltr">
      <p className="text-center text-[11px] text-slate-500">معاينة المقاعد</p>
      <div
        className="mx-auto grid w-fit gap-1"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(2rem, 2.25rem))`,
        }}
      >
        {Array.from({ length: layout.rows }, (_, r) =>
          Array.from({ length: layout.cols }, (_, c) => {
            const seat = byPos.get(`${r}-${c}`);
            if (!seat) {
              return <div key={`e-${r}-${c}`} className="h-8 w-8" />;
            }
            return (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded border text-[9px] font-medium",
                  seat.isDriver
                    ? "border-slate-400 bg-slate-300 text-slate-700"
                    : "border-slate-300 bg-white text-slate-800"
                )}
                title={seat.isDriver ? "مقعد السائق" : seat.label}
              >
                {seat.isDriver ? "D" : seat.label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

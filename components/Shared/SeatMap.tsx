"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  selectedIds?: string[];
  onSelect?: (seatId: string) => void;
  preview?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  /**
   * يضبط حجم المقعد تلقائياً ليعرض كل الأعمدة داخل العرض المتاح بدون سكرول
   */
  fitWidth?: boolean;
};

const DEFAULT_SEAT_PX = 36;
const MIN_SEAT_PX = 20;
const MAX_SEAT_PX = 40;
const GAP_PX = 6;

export default function SeatMap({
  seats,
  selectedId,
  selectedIds,
  onSelect,
  preview,
  className,
  orientation = "horizontal",
  fitWidth = false,
}: Props) {
  const selected = new Set([
    ...(selectedIds ?? []),
    ...(selectedId ? [selectedId] : []),
  ]);

  const hasGrid = seats.some((s) => s.row != null && s.col != null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [seatPx, setSeatPx] = useState(DEFAULT_SEAT_PX);

  const maxRow = useMemo(
    () => Math.max(...seats.map((s) => s.row ?? 0), 0),
    [seats]
  );
  const maxCol = useMemo(
    () => Math.max(...seats.map((s) => s.col ?? 0), 0),
    [seats]
  );

  const horizontalCols = maxRow + 1;
  const verticalCols = maxCol + 1;

  useEffect(() => {
    if (!fitWidth || !hasGrid) {
      setSeatPx(DEFAULT_SEAT_PX);
      return;
    }

    const el = shellRef.current;
    if (!el) return;

    const measure = () => {
      const cols =
        orientation === "horizontal" ? horizontalCols : verticalCols;
      const frontW = orientation === "horizontal" ? 40 : 0;
      // العرض المتاح من الشاشة حتى تظهر كل المقاعد بدون سكرول أفقي
      const budget = Math.min(window.innerWidth * 0.96 - 56, 1100) - frontW;
      if (budget <= 0 || cols <= 0) return;

      const neededAtDefault =
        cols * DEFAULT_SEAT_PX + GAP_PX * Math.max(cols - 1, 0);
      if (neededAtDefault <= budget) {
        setSeatPx(DEFAULT_SEAT_PX);
        return;
      }

      const raw = Math.floor(
        (budget - GAP_PX * Math.max(cols - 1, 0)) / cols
      );
      setSeatPx(Math.max(MIN_SEAT_PX, Math.min(MAX_SEAT_PX, raw)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [fitWidth, hasGrid, orientation, horizontalCols, verticalCols, seats.length]);

  const seatSize = `${seatPx}px`;
  const fontSize = seatPx >= 34 ? 11 : seatPx >= 30 ? 10 : 9;

  function seatClass(taken: boolean, isSelected: boolean) {
    return cn(
      "rounded-lg border font-semibold shadow-sm transition",
      taken
        ? "cursor-not-allowed border-rose-400 bg-rose-500 text-white opacity-90"
        : isSelected
          ? "border-emerald-600 bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-emerald-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
    );
  }

  if (!hasGrid) {
    return (
      <div className={cn("flex flex-wrap justify-center gap-2", className)}>
        {seats.map((s) => {
          const taken = s.status !== "AVAILABLE";
          const isSelected = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={preview || taken || !onSelect}
              onClick={() => onSelect?.(s.id)}
              className={cn("h-9 min-w-9 px-2 text-[11px]", seatClass(taken, isSelected))}
            >
              {s.label || s.seatNumber}
            </button>
          );
        })}
      </div>
    );
  }

  const byPos = new Map(
    seats.map((s) => [`${s.row}-${s.col}`, s] as const)
  );

  const legend = (
    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-md border border-slate-200 bg-white shadow-sm" />
        متاح
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-md bg-emerald-500" />
        محدد
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-md bg-rose-500" />
        محجوز
      </span>
    </div>
  );

  function renderSeat(r: number, c: number) {
    const seat = byPos.get(`${r}-${c}`);
    if (!seat) {
      return (
        <div
          key={`e-${r}-${c}`}
          style={{ width: seatSize, height: seatSize }}
          aria-hidden
        />
      );
    }
    const taken = seat.status !== "AVAILABLE";
    const isSelected = selected.has(seat.id);
    return (
      <button
        key={seat.id}
        type="button"
        disabled={preview || taken || !onSelect}
        title={seat.label || `مقعد ${seat.seatNumber}`}
        onClick={() => onSelect?.(seat.id)}
        style={{ width: seatSize, height: seatSize, fontSize }}
        className={cn(
          "flex items-center justify-center",
          seatClass(taken, isSelected)
        )}
      >
        {seat.label || seat.seatNumber}
      </button>
    );
  }

  if (orientation === "horizontal") {
    return (
      <div ref={shellRef} className={cn("w-full space-y-3", className)} dir="ltr">
        <div className="flex w-full items-center justify-center gap-2.5">
          <div
            className="flex shrink-0 items-center justify-center rounded-xl bg-slate-800 text-[10px] font-medium tracking-wide text-white [writing-mode:vertical-rl] rotate-180"
            style={{ width: 32, height: Math.max(seatPx * (maxCol + 1) + GAP_PX * maxCol + 20, 72) }}
          >
            FRONT
          </div>
          <div
            className="grid w-max max-w-full gap-1.5 rounded-2xl bg-slate-100/80 p-2.5 ring-1 ring-slate-200/80"
            style={{
              gap: GAP_PX,
              gridTemplateColumns: `repeat(${horizontalCols}, ${seatSize})`,
              gridTemplateRows: `repeat(${maxCol + 1}, ${seatSize})`,
            }}
          >
            {Array.from({ length: maxCol + 1 }, (_, c) =>
              Array.from({ length: horizontalCols }, (_, r) => renderSeat(r, c))
            )}
          </div>
        </div>
        {legend}
      </div>
    );
  }

  return (
    <div ref={shellRef} className={cn("w-full space-y-3", className)} dir="ltr">
      <div className="mx-auto w-fit rounded-full bg-slate-800 px-4 py-1 text-[10px] font-medium tracking-wide text-white">
        FRONT
      </div>
      <div
        className="mx-auto grid w-fit gap-1.5 rounded-2xl bg-slate-100/80 p-2.5 ring-1 ring-slate-200/80"
        style={{
          gap: GAP_PX,
          gridTemplateColumns: `repeat(${verticalCols}, ${seatSize})`,
        }}
      >
        {Array.from({ length: maxRow + 1 }, (_, r) =>
          Array.from({ length: verticalCols }, (_, c) => renderSeat(r, c))
        )}
      </div>
      {legend}
    </div>
  );
}

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
  const size = "2rem";

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3" dir="ltr">
      <p className="text-center text-[11px] text-slate-500">معاينة المقاعد</p>
      <div className="flex items-center justify-center gap-2">
        <div className="flex h-14 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[8px] text-white [writing-mode:vertical-rl] rotate-180">
          FRONT
        </div>
        <div
          className="grid w-max gap-1 rounded-xl bg-white p-2 ring-1 ring-slate-200"
          style={{
            gridTemplateColumns: `repeat(${layout.rows}, ${size})`,
            gridTemplateRows: `repeat(${layout.cols}, ${size})`,
          }}
        >
          {Array.from({ length: layout.cols }, (_, c) =>
            Array.from({ length: layout.rows }, (_, r) => {
              const seat = byPos.get(`${r}-${c}`);
              if (!seat) {
                return (
                  <div
                    key={`e-${r}-${c}`}
                    style={{ width: size, height: size }}
                  />
                );
              }
              return (
                <div
                  key={`${r}-${c}`}
                  style={{ width: size, height: size }}
                  className={cn(
                    "flex items-center justify-center rounded-md border text-[9px] font-medium",
                    seat.isDriver
                      ? "border-slate-400 bg-slate-300 text-slate-700"
                      : "border-slate-200 bg-white text-slate-800"
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
    </div>
  );
}

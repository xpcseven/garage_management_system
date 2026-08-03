"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BookingRow } from "@/lib/actions/booking.actions";
import { cancelBooking } from "@/lib/actions/booking.actions";
import { Button } from "@/components/ui/button";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import BookingLuggageList from "./BookingLuggageList";
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";
import { cn } from "@/lib/utils";

type Props = { bookings: BookingRow[]; canCancel: boolean };

type KindFilter = "all" | BookingRow["bookingKind"];
type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "CANCELLED";

const KIND_LABEL: Record<BookingRow["bookingKind"], string> = {
  trip: "رحلة",
  tourism_program: "برنامج سياحي",
  hotel: "فندق",
  restaurant: "مطعم",
  farm: "مزرعة",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكّد",
  CANCELLED: "ملغى",
};

function formatWhen(d: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString("ar-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(d);
  }
}

function titleFor(b: BookingRow) {
  if (b.bookingKind === "trip" && b.tripFromCity && b.tripToCity) {
    return `${b.tripFromCity} ← ${b.tripToCity}`;
  }
  if (b.bookingKind === "tourism_program") {
    return b.programTitle ?? "برنامج سياحي";
  }
  return b.placeName ?? KIND_LABEL[b.bookingKind];
}

export default function Booking_Table({ bookings, canCancel }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (kind !== "all" && b.bookingKind !== kind) return false;
      if (status !== "all" && b.status !== status) return false;
      if (!q) return true;
      const hay = [
        b.passengerName,
        b.passengerEmail,
        b.programTitle,
        b.placeName,
        b.detailLabel,
        b.tripFromCity,
        b.tripToCity,
        KIND_LABEL[b.bookingKind],
        STATUS_LABEL[b.status] ?? b.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, kind, status, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [kind, status, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function openDetails(b: BookingRow) {
    const details =
      b.bookingKind === "tourism_program"
        ? [
            `المسافر: ${b.passengerName}`,
            `البريد: ${b.passengerEmail ?? "—"}`,
            `البرنامج: ${b.programTitle ?? "—"}`,
            `الشركة: ${b.programGarageName ?? "—"}`,
            `المركبة: ${b.programVehicleLabel ?? "—"}`,
            `السائق: ${b.programDriverName ?? "—"}`,
            `عدد الأفراد: ${b.passengersCount}`,
            `السعر: ${b.priceAtBooking}`,
            `الحالة: ${STATUS_LABEL[b.status] ?? b.status}`,
            `الأماكن: ${
              b.programPlaces.length
                ? b.programPlaces.map((x) => `${x.order}. ${x.name}`).join(" | ")
                : "—"
            }`,
          ]
        : b.bookingKind === "trip"
          ? [
              `المسافر: ${b.passengerName}`,
              `البريد: ${b.passengerEmail ?? "—"}`,
              `المسار: من ${b.tripFromCity ?? "—"} إلى ${b.tripToCity ?? "—"}`,
              `المقعد: ${b.seatNumber ?? "—"}`,
              `السعر: ${b.priceAtBooking}`,
              `الحالة: ${STATUS_LABEL[b.status] ?? b.status}`,
            ]
          : [
              `المسافر: ${b.passengerName}`,
              `النوع: ${KIND_LABEL[b.bookingKind]}`,
              `المكان: ${b.placeName ?? "—"}`,
              b.detailLabel ? `التفاصيل: ${b.detailLabel}` : "",
              `عدد الأفراد: ${b.passengersCount}`,
              `السعر: ${b.priceAtBooking}`,
              `الحالة: ${STATUS_LABEL[b.status] ?? b.status}`,
            ].filter(Boolean);

    await Swal.fire({
      icon: "info",
      title: "تفاصيل الحجز",
      html: `<div style="text-align:right;line-height:1.9">${details
        .map((d) => `<div>${d}</div>`)
        .join("")}</div>`,
      confirmButtonText: "إغلاق",
    });
  }

  async function onCancel(id: string) {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "إلغاء الحجز",
      text: "هل تريد إلغاء الحجز؟",
      showCancelButton: true,
      confirmButtonText: "نعم، إلغاء",
      cancelButtonText: "تراجع",
    });
    if (!confirmed.isConfirmed) return;
    start(async () => {
      const res = await cancelBooking(id);
      if (res.success) {
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تم الإلغاء",
          text: "تم إلغاء الحجز بنجاح",
          confirmButtonText: "موافق",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "تعذر الإلغاء",
          text: res.error,
          confirmButtonText: "حسناً",
        });
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 sm:p-6 dark:bg-card dark:ring-orchid/20">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            القائمة
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            حجوزاتك
          </h2>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالمسافر أو المكان أو المسار…"
            className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-orchid-light dark:focus:ring-orchid/40"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                ["all", "الكل"],
                ["trip", "رحلات"],
                ["tourism_program", "برامج"],
                ["hotel", "فنادق"],
                ["restaurant", "مطاعم"],
                ["farm", "مزارع"],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                active={kind === value}
                label={label}
                onClick={() => setKind(value)}
              />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                ["all", "كل الحالات"],
                ["PENDING", "قيد الانتظار"],
                ["CONFIRMED", "مؤكّد"],
                ["CANCELLED", "ملغى"],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                active={status === value}
                label={label}
                onClick={() => setStatus(value)}
              />
            ))}
          </div>

          <p className="font-data text-xs text-dusk/45 dark:text-muted-foreground">
            {filtered.length} حجز
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
          <p className="font-display text-2xl text-plum dark:text-orchid-light">
            {bookings.length === 0 ? "لا حجوزات بعد" : "لا نتائج مطابقة"}
          </p>
          <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
            {bookings.length === 0
              ? "ابدأ بحجز رحلة أو برنامج أو إقامة من لوحة المسافر."
              : "جرّب توسيع التصفية أو مسح البحث."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paged.map((b) => {
              const when = formatWhen(b.departureTime);
              const canCancelThis =
                canCancel &&
                b.status === "PENDING" &&
                (b.bookingKind === "trip" ||
                  b.bookingKind === "tourism_program");

              return (
                <article
                  key={b.id}
                  className="rounded-3xl bg-white p-5 ring-1 ring-plum/10 transition hover:shadow-orchid dark:bg-card dark:ring-orchid/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3 text-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-plum-soft px-2.5 py-0.5 font-data text-[10px] tracking-wide text-plum dark:bg-orchid/15 dark:text-orchid-light">
                          {KIND_LABEL[b.bookingKind]}
                        </span>
                        <StatusPill status={b.status} />
                      </div>

                      <div>
                        {b.bookingKind === "trip" &&
                        b.tripFromCity &&
                        b.tripToCity ? (
                          <div className="text-base sm:text-lg">
                            <TripRouteArrow
                              fromCityName={b.tripFromCity}
                              fromRegion={b.tripFromRegion}
                              toCityName={b.tripToCity}
                              toRegion={b.tripToRegion}
                            />
                          </div>
                        ) : (
                          <h3 className="text-lg font-semibold text-dusk dark:text-foreground">
                            {titleFor(b)}
                          </h3>
                        )}
                        {b.detailLabel && (
                          <p className="mt-1 text-sm text-dusk/55 dark:text-muted-foreground">
                            {b.detailLabel}
                          </p>
                        )}
                        {b.bookingKind === "tourism_program" &&
                          b.programGarageName && (
                            <p className="mt-1 text-sm text-dusk/55 dark:text-muted-foreground">
                              {b.programGarageName}
                            </p>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-dusk/60 dark:text-muted-foreground">
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            المسافر
                          </span>{" "}
                          {b.passengerName}
                        </p>
                        {when && (
                          <p>
                            <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                              الموعد
                            </span>{" "}
                            {when}
                          </p>
                        )}
                        {b.seatNumber != null && (
                          <p>
                            <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                              المقعد
                            </span>{" "}
                            {b.seatNumber}
                          </p>
                        )}
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            الأفراد
                          </span>{" "}
                          {b.passengersCount}
                        </p>
                      </div>

                      {b.bookingKind === "trip" && b.luggage.length > 0 && (
                        <div>
                          <p className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            الأمتعة
                          </p>
                          <div className="mt-1">
                            <BookingLuggageList luggage={b.luggage} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-plum/10 pt-4 dark:border-orchid/15 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:border-s lg:pt-0 lg:ps-6">
                      <div className="text-start lg:text-end">
                        <p className="font-data text-xl font-semibold tabular-nums text-plum dark:text-orchid-light">
                          {b.priceAtBooking}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-plum/20 dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15"
                          onClick={() => openDetails(b)}
                        >
                          التفاصيل
                        </Button>
                        {canCancelThis && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={pending}
                            className="rounded-xl border-0 bg-dusk text-white hover:bg-dusk-muted dark:bg-orchid dark:hover:bg-orchid-light"
                            onClick={() => onCancel(b.id)}
                          >
                            إلغاء
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid",
        active
          ? "bg-orchid text-white shadow-orchid"
          : "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15"
      )}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
        status === "PENDING" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
        status === "CONFIRMED" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        status === "CANCELLED" &&
          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
        !["PENDING", "CONFIRMED", "CANCELLED"].includes(status) &&
          "bg-mist text-dusk/60 dark:bg-muted dark:text-muted-foreground"
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HotelBookingRow } from "@/lib/actions/hotel.actions";
import { updateHotelBookingStatus } from "@/lib/actions/hotel.actions";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import TablePagination from "@/components/Shared/TablePagination";

const STATUS_AR: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغى",
};

type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "CANCELLED";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

export default function HotelBookingsManager({
  bookings,
}: {
  bookings: HotelBookingRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const waiting = bookings.filter((b) => b.status === "PENDING").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!q) return true;
      const hay = [b.guestName, b.hotelName, b.roomNumber]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setBookingStatus(id: string, next: BookingStatus) {
    start(async () => {
      await updateHotelBookingStatus(id, next);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              الضيافة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              حجوزات الفندق
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              متابعة طلبات حجز الغرف من المسافرين وتأكيدها أو إلغاؤها.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/hotels">الفنادق</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
          <Metric label="الكل" value={bookings.length} />
          <Metric label="بانتظار التأكيد" value={waiting} />
        </div>
      </header>

      <section className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث بالضيف أو الفندق أو الغرفة…"
            className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(
              [
                ["all", "الكل"],
                ["PENDING", "قيد الانتظار"],
                ["CONFIRMED", "مؤكد"],
                ["CANCELLED", "ملغى"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  status === value
                    ? "bg-orchid text-white shadow-orchid"
                    : chipIdle
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الضيف
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الغرفة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  من
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  إلى
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الحالة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                >
                  <td
                    className="p-3 font-semibold text-dusk dark:text-foreground"
                    data-label="الضيف"
                  >
                    {b.guestName}
                  </td>
                  <td
                    className="p-3 text-dusk/70 dark:text-muted-foreground"
                    data-label="الغرفة"
                  >
                    {b.hotelName} / {b.roomNumber}
                  </td>
                  <td
                    className="p-3 font-data text-dusk/60 dark:text-muted-foreground"
                    data-label="من"
                  >
                    {new Date(b.checkIn).toLocaleDateString("ar")}
                  </td>
                  <td
                    className="p-3 font-data text-dusk/60 dark:text-muted-foreground"
                    data-label="إلى"
                  >
                    {new Date(b.checkOut).toLocaleDateString("ar")}
                  </td>
                  <td className="p-3" data-label="الحالة">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                        b.status === "CONFIRMED" &&
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                        b.status === "PENDING" &&
                          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
                        b.status === "CANCELLED" &&
                          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      )}
                    >
                      {STATUS_AR[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="p-3" data-label="إجراءات">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={pending || b.status === "CONFIRMED"}
                        className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                        onClick={() => setBookingStatus(b.id, "CONFIRMED")}
                      >
                        تأكيد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending || b.status === "CANCELLED"}
                        className="rounded-xl border-plum/20 dark:border-orchid/30"
                        onClick={() => setBookingStatus(b.id, "CANCELLED")}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    لا توجد حجوزات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-plum/10 px-2 py-3 sm:px-4 dark:border-orchid/15">
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}

"use client";

import type { BookingRow } from "@/lib/actions/booking.actions";
import Booking_Table from "./Booking_Table";
import GarageBookSeatsDialog from "./GarageBookSeatsDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  bookings: BookingRow[];
  canCancel: boolean;
  canBookSeats?: boolean;
};

export default function Booking_Component({
  bookings,
  canCancel,
  canBookSeats = false,
}: Props) {
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/15"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              متابعة موحّدة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الحجوزات
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              رحلات، برامج، فنادق، مطاعم ومزارع في مكان واحد
              {pendingCount > 0
                ? ` — لديك ${pendingCount} طلباً قيد الانتظار.`
                : "."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canBookSeats && <GarageBookSeatsDialog />}
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <Metric label="الكل" value={bookings.length} />
          <Metric label="قيد الانتظار" value={pendingCount} />
          <Metric
            label="مؤكّد"
            value={bookings.filter((b) => b.status === "CONFIRMED").length}
          />
        </div>
      </header>

      <Booking_Table bookings={bookings} canCancel={canCancel} />
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

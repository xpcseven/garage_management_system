"use client";

import { useEffect, useMemo, useState } from "react";
import type { CityRow } from "@/lib/actions/city.actions";
import type {
  PassengerTripRow,
  PassengerTripScope,
} from "@/lib/actions/passenger.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PassengerTripBookButton from "./PassengerTripBookButton";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import TablePagination from "@/components/Shared/TablePagination";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import { cn } from "@/lib/utils";

type Initial = {
  from: string;
  to: string;
  q: string;
  scope: PassengerTripScope;
};

type Props = {
  cities: CityRow[];
  trips: PassengerTripRow[];
  initialParams: Initial;
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

function formatDeparture(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function Passenger_Trips_Component({
  cities,
  trips,
  initialParams,
}: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const pagedTrips = useMemo(
    () => trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [trips, page]
  );

  useEffect(() => {
    setPage(1);
  }, [trips]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
              حجز مقعد
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              ابحث عن رحلة
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              صفّ حسب المدن ونوع الرحلة، ثم احجز مقعدك لدى شركة سياحية أو سائق
              مستقل.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/garages">الشركات السياحية</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/bookings">حجوزاتي</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            التصفية
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            حدد وجهتك
          </h2>
        </div>

        <form
          method="get"
          action="/passenger/trips"
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-medium text-dusk/60 dark:text-muted-foreground">
              من مدينة
            </label>
            <select
              name="from"
              defaultValue={initialParams.from}
              className={fieldClass}
            >
              <option value="">— أي انطلاق —</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.region ? ` (${c.region})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-start">
            <label className="text-xs font-medium text-dusk/60 dark:text-muted-foreground">
              إلى مدينة
            </label>
            <select
              name="to"
              defaultValue={initialParams.to}
              className={fieldClass}
            >
              <option value="">— أي وصول —</option>
              {cities.map((c) => (
                <option key={`t-${c.id}`} value={c.id}>
                  {c.name}
                  {c.region ? ` (${c.region})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-start sm:col-span-2">
            <label className="text-xs font-medium text-dusk/60 dark:text-muted-foreground">
              بحث نصي (مدينة أو منطقة)
            </label>
            <input
              name="q"
              defaultValue={initialParams.q}
              placeholder="مثال: بغداد، أربيل…"
              className={cn(
                fieldClass,
                "dark:placeholder:text-muted-foreground"
              )}
            />
          </div>

          <div className="space-y-1.5 text-start sm:col-span-2">
            <label className="text-xs font-medium text-dusk/60 dark:text-muted-foreground">
              نوع الرحلات
            </label>
            <select
              name="scope"
              defaultValue={initialParams.scope}
              className={fieldClass}
            >
              <option value="all">الكل (شركة سياحية + مستقل)</option>
              <option value="garage">رحلات الشركات السياحية فقط</option>
              <option value="freelance">رحلات السائقين المستقلين فقط</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button
              type="submit"
              className="rounded-xl border-0 bg-plum px-6 text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
            >
              عرض النتائج
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              className="rounded-xl border-plum/20 dark:border-orchid/30"
            >
              <Link href="/passenger/trips">مسح التصفية</Link>
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 text-start">
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              النتائج
            </p>
            <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
              رحلات متاحة
            </h2>
          </div>
          <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
            {trips.length} رحلة
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              لا رحلات مطابقة
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              جرّب توسيع التصفية أو اختيار مدن أخرى.
            </p>
            <Button
              asChild
              className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">عرض كل الرحلات</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {pagedTrips.map((t) => (
                <article
                  key={t.id}
                  className={cn(
                    "rounded-3xl bg-white p-5 ring-1 ring-plum/10",
                    "transition hover:shadow-orchid",
                    "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40"
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3 text-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                            t.isFreelance
                              ? "bg-fuchsia-soft text-fuchsia-brand dark:bg-fuchsia-brand/20 dark:text-orchid-light"
                              : "bg-plum-soft text-plum dark:bg-orchid/20 dark:text-orchid-light"
                          )}
                        >
                          {t.isFreelance
                            ? "سائق مستقل"
                            : t.garageName ?? "شركة سياحية"}
                        </span>
                        {t.transportType && (
                          <span className="font-data text-[10px] text-dusk/45 dark:text-muted-foreground">
                            {t.transportType}
                          </span>
                        )}
                      </div>

                      <div className="text-base sm:text-lg">
                        <TripRouteArrow
                          fromCityName={t.fromCity}
                          fromRegion={t.fromRegion}
                          toCityName={t.toCity}
                          toRegion={t.toRegion}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-dusk/60 dark:text-muted-foreground">
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            المغادرة
                          </span>{" "}
                          {formatDeparture(t.departureTime)}
                        </p>
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            السائق
                          </span>{" "}
                          {t.driverName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            الموقع
                          </span>
                          <LocationMapIcon
                            location={t.sourceLocation}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-plum/10 pt-4 dark:border-orchid/15 sm:flex-col sm:items-end sm:border-t-0 sm:border-s sm:pt-0 sm:ps-6">
                      <div className="text-start sm:text-end">
                        <p className="font-data text-xl font-semibold tabular-nums text-plum dark:text-orchid-light">
                          {t.basePrice}
                        </p>
                        <p className="mt-0.5 text-xs text-dusk/50 dark:text-muted-foreground">
                          {t.availableSeats} مقعد متاح
                        </p>
                      </div>
                      <PassengerTripBookButton tripId={t.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <TablePagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

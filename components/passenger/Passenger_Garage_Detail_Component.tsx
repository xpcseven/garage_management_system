"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  PassengerTripRow,
  PublicGarageRow,
} from "@/lib/actions/passenger.actions";
import type { TourismProgramPassengerRow } from "@/lib/actions/tourism_program.actions";
import type { PartnershipRow } from "@/lib/actions/partnership.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PassengerTripBookButton from "./PassengerTripBookButton";
import PassengerTourismProgramBookButton from "./PassengerTourismProgramBookButton";
import PassengerGaragePartners from "./PassengerGaragePartners";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import TablePagination from "@/components/Shared/TablePagination";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import { cn } from "@/lib/utils";
import { formatProgramPrice } from "@/lib/program-currency";

type Props = {
  garage: PublicGarageRow;
  trips: PassengerTripRow[];
  programs?: TourismProgramPassengerRow[];
  partners?: PartnershipRow[];
  isLoggedIn?: boolean;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function shortText(raw: string | null | undefined, max = 140) {
  if (!raw?.trim()) return null;
  const text = raw.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function Passenger_Garage_Detail_Component({
  garage,
  trips,
  programs = [],
  partners = [],
  isLoggedIn = false,
}: Props) {
  const [tripPage, setTripPage] = useState(1);
  const [programPage, setProgramPage] = useState(1);
  const PAGE_SIZE = 8;

  const tripTotalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const programTotalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));

  const pagedTrips = useMemo(
    () => trips.slice((tripPage - 1) * PAGE_SIZE, tripPage * PAGE_SIZE),
    [trips, tripPage]
  );
  const pagedPrograms = useMemo(
    () =>
      programs.slice((programPage - 1) * PAGE_SIZE, programPage * PAGE_SIZE),
    [programs, programPage]
  );

  useEffect(() => {
    if (tripPage > tripTotalPages) setTripPage(tripTotalPages);
  }, [tripPage, tripTotalPages]);

  useEffect(() => {
    if (programPage > programTotalPages) setProgramPage(programTotalPages);
  }, [programPage, programTotalPages]);

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
          <div className="max-w-2xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              شركة سياحية
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              {garage.name}
            </h1>
            {garage.description?.trim() && (
              <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
                {garage.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65 dark:text-muted-foreground">
              {garage.phone?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    هاتف
                  </span>{" "}
                  <a
                    href={`tel:${garage.phone}`}
                    className="hover:text-white dark:hover:text-orchid-light"
                  >
                    {garage.phone}
                  </a>
                </p>
              )}
              {garage.address?.trim() && (
                <div className="flex items-center gap-2">
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    الموقع
                  </span>
                  <LocationMapIcon location={garage.address} size="sm" />
                </div>
              )}
              <p>
                <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                  الرحلات
                </span>{" "}
                {trips.length} متاحة
              </p>
              <p>
                <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                  البرامج
                </span>{" "}
                {programs.length} متاحة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/passenger/garages">العودة للشركات</Link>
            </Button>
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">بحث كل الرحلات</Link>
            </Button>
          </div>
        </div>
      </header>

      <PassengerGaragePartners partners={partners} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 text-start">
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              البرامج السياحية
            </p>
            <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
              برامج هذه الشركة
            </h2>
          </div>
          <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
            {programs.length} برنامج
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-xl text-plum dark:text-orchid-light">
              لا برامج متاحة حالياً
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              يمكنك تصفّح كل البرامج على المنصة أو العودة لاحقاً.
            </p>
            <Button
              asChild
              className="mt-5 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/tourism-programs">كل البرامج</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {pagedPrograms.map((p) => (
                <article
                  key={p.id}
                  className={cn(
                    "rounded-3xl bg-white p-5 ring-1 ring-plum/10",
                    "transition hover:shadow-orchid",
                    "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40"
                  )}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3 text-start">
                      <h3 className="text-lg font-semibold text-dusk dark:text-foreground sm:text-xl">
                        {p.title}
                      </h3>
                      {shortText(p.description) && (
                        <p className="text-sm leading-7 text-dusk/65 dark:text-muted-foreground">
                          {shortText(p.description)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-dusk/60 dark:text-muted-foreground">
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            الانطلاق
                          </span>{" "}
                          {formatWhen(p.startAt)}
                        </p>
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            المركبة
                          </span>{" "}
                          {p.vehicleLabel}
                        </p>
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            السائق
                          </span>{" "}
                          {p.driverName}
                        </p>
                      </div>
                      {p.places.length > 0 && (
                        <ol className="flex flex-wrap gap-2">
                          {p.places.map((x) => (
                            <li
                              key={`${x.kind}-${x.id}-${x.order}`}
                              className="rounded-full bg-mist px-3 py-1 text-xs text-dusk/75 ring-1 ring-plum/10 dark:bg-background dark:text-muted-foreground dark:ring-orchid/20"
                            >
                              {x.order}.{" "}
                              <span className="font-data text-[10px] text-orchid dark:text-orchid-light">
                                {x.kind === "TRAVEL" ? "سفر" : "سياحة"}
                              </span>{" "}
                              {x.name}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-plum/10 pt-4 dark:border-orchid/15 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:border-s lg:pt-0 lg:ps-6">
                      <div className="text-start lg:text-end">
                        <p className="font-data text-xl font-semibold tabular-nums text-plum dark:text-orchid-light">
                          {formatProgramPrice(p.basePrice, p.currency)}
                        </p>
                        <p className="mt-0.5 text-xs text-dusk/50 dark:text-muted-foreground">
                          {p.availableSeats} مقعد متاح
                        </p>
                      </div>
                      <PassengerTourismProgramBookButton
                        programId={p.id}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <TablePagination
              page={programPage}
              totalPages={programTotalPages}
              onPageChange={setProgramPage}
            />
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 text-start">
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              الرحلات
            </p>
            <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
              رحلات هذه الشركة
            </h2>
          </div>
          <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
            {trips.length} رحلة
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              لا رحلات متاحة حالياً
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              يمكنك العودة لاحقاً أو البحث في كل الرحلات على المنصة.
            </p>
            <Button
              asChild
              className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
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
                          {formatWhen(t.departureTime)}
                        </p>
                        <p>
                          <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            السائق
                          </span>{" "}
                          {t.driverName}
                        </p>
                        {t.sourceLocation?.trim() && (
                          <div className="flex items-center gap-2">
                            <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                              الموقع
                            </span>
                            <LocationMapIcon
                              location={t.sourceLocation}
                              size="sm"
                            />
                          </div>
                        )}
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
                      <PassengerTripBookButton
                        tripId={t.id}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <TablePagination
              page={tripPage}
              totalPages={tripTotalPages}
              onPageChange={setTripPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

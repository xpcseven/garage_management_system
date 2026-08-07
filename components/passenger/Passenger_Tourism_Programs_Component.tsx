"use client";

import { useEffect, useMemo, useState } from "react";
import type { TourismProgramPassengerRow } from "@/lib/actions/tourism_program.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/Shared/TablePagination";
import PassengerTourismProgramBookButton from "./PassengerTourismProgramBookButton";
import { cn } from "@/lib/utils";

type Props = {
  programs: TourismProgramPassengerRow[];
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

export default function Passenger_Tourism_Programs_Component({
  programs,
  isLoggedIn = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((p) => {
      const hay = [
        p.title,
        p.description,
        p.garageName,
        p.driverName,
        p.vehicleLabel,
        ...p.places.map((x) => x.name),
        ...p.partners.map((x) => x.partnerName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [programs, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

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
              باقات جاهزة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              البرامج السياحية
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              برامج من الشركات المسجّلة تشمل مسار المعالم والشركاء — احجز مقعدك
              بعدد الأفراد المناسب.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/passenger/tourism-places">الأماكن السياحية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">بحث في البرامج</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بعنوان البرنامج أو الشركة أو المعلم…"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-background"
            />
          </label>
          <p className="font-data text-xs text-white/50 sm:whitespace-nowrap dark:text-muted-foreground">
            {filtered.length} برنامج
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            المتاح للحجز
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            برامج قادمة
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              {programs.length === 0
                ? "لا برامج متاحة حالياً"
                : "لا نتائج مطابقة"}
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              {programs.length === 0
                ? "يمكنك البحث عن رحلة مقعد أو تصفّح المعالم في الأثناء."
                : "جرّب كلمة أخرى أو امسح البحث."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {query && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-plum/20 dark:border-orchid/30"
                  onClick={() => setQuery("")}
                >
                  مسح البحث
                </Button>
              )}
              <Button
                asChild
                className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
              >
                <Link href="/passenger/trips">ابحث عن رحلة</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {paged.map((p) => (
                <article
                  key={p.id}
                  className={cn(
                    "rounded-3xl bg-white p-5 ring-1 ring-plum/10",
                    "transition hover:shadow-orchid",
                    "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40"
                  )}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-4 text-start">
                      <div>
                        <span className="rounded-full bg-plum-soft px-2.5 py-0.5 font-data text-[10px] tracking-wide text-plum dark:bg-orchid/20 dark:text-orchid-light">
                          {p.garageName}
                        </span>
                        <h3 className="mt-2 text-lg font-semibold text-dusk dark:text-foreground sm:text-xl">
                          {p.title}
                        </h3>
                        {shortText(p.description) && (
                          <p className="mt-2 text-sm leading-7 text-dusk/65 dark:text-muted-foreground">
                            {shortText(p.description)}
                          </p>
                        )}
                      </div>

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
                        <div>
                          <p className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            مسار الأماكن
                          </p>
                          <ol className="mt-2 flex flex-wrap gap-2">
                            {p.places.map((x) => (
                              <li
                                key={x.id}
                                className="rounded-full bg-mist px-3 py-1 text-xs text-dusk/75 ring-1 ring-plum/10 dark:bg-background dark:text-muted-foreground dark:ring-orchid/20"
                              >
                                <span className="font-data text-orchid dark:text-orchid-light">
                                  {x.order}.
                                </span>{" "}
                                {x.name}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {p.partners.length > 0 && (
                        <div>
                          <p className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                            الشركاء المشمولون
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {p.partners.map((x) => (
                              <li
                                key={x.partnershipId}
                                className="rounded-full bg-fuchsia-soft/60 px-3 py-1 text-xs text-dusk/75 dark:bg-orchid/15 dark:text-muted-foreground"
                              >
                                {x.order}. {x.partnerName}
                                {Number(x.priceAddon) > 0
                                  ? ` (+${x.priceAddon})`
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-plum/10 pt-4 dark:border-orchid/15 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:border-s lg:pt-0 lg:ps-6">
                      <div className="text-start lg:text-end">
                        <p className="font-data text-xl font-semibold tabular-nums text-plum dark:text-orchid-light">
                          {p.basePrice}
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
